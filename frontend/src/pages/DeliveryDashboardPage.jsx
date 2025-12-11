import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import socketService from '../services/socketService';
import RatingDisplay from '../components/RatingDisplay';

function DeliveryDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [receivedComplaints, setReceivedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [complaintsTab, setComplaintsTab] = useState('received');
  const [bidForm, setBidForm] = useState({});
  const [showBidForm, setShowBidForm] = useState(null);

  useEffect(() => {
    loadData();
    loadReadyOrders();
    loadMyBids();
    if (activeTab === 'ratings') {
      loadRatings();
    }
    if (activeTab === 'complaints') {
      loadComplaints();
    }

    socketService.on('new_order_ready', handleNewOrderReady);
    socketService.on('bid_accepted', handleBidAccepted);
    socketService.on('bid_rejected', handleBidRejected);

    return () => {
      socketService.off('new_order_ready', handleNewOrderReady);
      socketService.off('bid_accepted', handleBidAccepted);
      socketService.off('bid_rejected', handleBidRejected);
    };
  }, [activeTab]);

  const handleNewOrderReady = (data) => {
    loadReadyOrders();
    alert('New order ready for bidding!');
  };

  const handleBidAccepted = (data) => {
    alert('Your bid was accepted! Check My Deliveries.');
    loadData();
    loadMyBids();
  };

  const handleBidRejected = (data) => {
    alert('Your bid was not accepted.');
    loadMyBids();
  };

  const loadData = async () => {
    try {
      const [ordersRes, deliveriesRes, statsRes] = await Promise.all([
        api.get('/delivery/available-orders'),
        api.get('/delivery/my-deliveries'),
        api.get('/delivery/stats')
      ]);
      setAvailableOrders(ordersRes.data);
      setMyDeliveries(deliveriesRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load delivery data:', err);
      setLoading(false);
    }
  };

  const loadReadyOrders = async () => {
    try {
      const response = await api.get('/bidding/orders/ready');
      setReadyOrders(response.data);
    } catch (err) {
      console.error('Failed to load ready orders:', err);
    }
  };

  const loadMyBids = async () => {
    try {
      const response = await api.get('/bidding/bids/my-bids');
      setMyBids(response.data);
    } catch (err) {
      console.error('Failed to load bids:', err);
    }
  };

  const loadRatings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/delivery/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const profileData = await response.json();

      if (response.ok && profileData.employee_id) {
        const ratingsResponse = await fetch(`http://localhost:3001/api/ratings/employees/${profileData.employee_id}/ratings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const ratingsData = await ratingsResponse.json();
        if (ratingsResponse.ok) {
          setRatings(ratingsData.data);
        }
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
    }
  };

  const loadComplaints = async () => {
    try {
      const [filedRes, receivedRes] = await Promise.all([
        fetch('http://localhost:3001/api/complaints/my?role=filer', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:3001/api/complaints/my?role=subject', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [filedData, receivedData] = await Promise.all([
        filedRes.json(),
        receivedRes.json()
      ]);

      if (filedRes.ok) setComplaints(filedData.data || []);
      if (receivedRes.ok) setReceivedComplaints(receivedData.data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      await api.post(`/delivery/accept/${orderId}`);
      alert('Delivery accepted!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept delivery');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/delivery/order/${orderId}/status`, { status });
      alert('Status updated!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSubmitBid = async (orderId) => {
    const bid = bidForm[orderId];
    if (!bid?.bid_amount || !bid?.estimated_time) {
      alert('Please fill in all bid fields');
      return;
    }

    try {
      await api.post(`/bidding/orders/${orderId}/bid`, bid);
      alert('Bid submitted successfully!');
      setBidForm({ ...bidForm, [orderId]: {} });
      setShowBidForm(null);
      loadMyBids();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit bid');
    }
  };

  const handleWithdrawBid = async (bidId) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    try {
      await api.delete(`/bidding/bids/${bidId}`);
      alert('Bid withdrawn successfully');
      loadMyBids();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to withdraw bid');
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading...</div>;

  return (
    <div style={{ padding: 'clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 32px)' }}>Delivery Dashboard</h1>
      <p style={{ color: '#fff', fontSize: 'clamp(14px, 2vw, 18px)' }}>Welcome, {user?.first_name}!</p>

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'clamp(12px, 2vw, 20px)',
          marginBottom: 'clamp(20px, 3vw, 30px)'
        }}>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Deliveries</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>
              {stats.total_deliveries}
            </p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Active Deliveries</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#007bff' }}>
              {stats.active_deliveries}
            </p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Average Rating</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#f39c12' }}>
              {parseFloat(stats.average_rating || 0).toFixed(1)} ⭐
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'available' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Available Orders ({availableOrders.length})
        </button>
        <button
          onClick={() => { setActiveTab('bidding'); loadReadyOrders(); }}
          style={{
            padding: '10px 20px',
            background: activeTab === 'bidding' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Bid on Orders
        </button>
        <button
          onClick={() => { setActiveTab('myBids'); loadMyBids(); }}
          style={{
            padding: '10px 20px',
            background: activeTab === 'myBids' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Bids ({myBids.length})
        </button>
        <button
          onClick={() => setActiveTab('myDeliveries')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'myDeliveries' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Deliveries ({myDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'ratings' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Ratings
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'complaints' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Complaints
        </button>
      </div>

      {activeTab === 'available' && (
        <div>
          <h2 style={{ color: '#fff' }}>Available Orders</h2>
          {availableOrders.length === 0 ? (
            <p style={{ color: '#666' }}>No available orders at the moment</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {availableOrders.map(order => (
                <div key={order.order_id} style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Order #{order.order_id}</h3>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Customer:</strong> {order.Customer?.User?.first_name} {order.Customer?.User?.last_name}
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Address:</strong> {order.delivery_address}
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Total:</strong> ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Status:</strong> {order.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptDelivery(order.order_id)}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Accept Delivery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myDeliveries' && (
        <div>
          <h2 style={{ color: '#fff' }}>My Deliveries</h2>
          {myDeliveries.length === 0 ? (
            <p style={{ color: '#666' }}>You have no active deliveries</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myDeliveries.map(order => (
                <div key={order.order_id} style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Order #{order.order_id}</h3>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Customer:</strong> {order.Customer?.User?.first_name} {order.Customer?.User?.last_name}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Address:</strong> {order.delivery_address}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Total:</strong> ${parseFloat(order.total).toFixed(2)}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Status:</strong> <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: order.status === 'delivered' ? '#28a745' : '#007bff',
                      color: 'white'
                    }}>{order.status}</span>
                  </p>
                  {order.special_instructions && (
                    <p style={{ color: '#666', margin: '5px 0' }}>
                      <strong>Instructions:</strong> {order.special_instructions}
                    </p>
                  )}
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleUpdateStatus(order.order_id, 'out_for_delivery')}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Out for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order.order_id, 'delivered')}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bidding' && (
        <div>
          <h2 style={{ color: '#fff' }}>Orders Ready for Bidding</h2>
          {readyOrders.length === 0 ? (
            <p style={{ color: '#666' }}>No orders ready for bidding at the moment</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {readyOrders.map(order => (
                <div key={order.order_id} style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Order #{order.order_id}</h3>
                    <p style={{ color: '#666', margin: '5px 0' }}>
                      <strong>Address:</strong> {order.delivery_address}
                    </p>
                    <p style={{ color: '#666', margin: '5px 0' }}>
                      <strong>Total:</strong> ${parseFloat(order.total).toFixed(2)}
                    </p>
                    {order.special_instructions && (
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Instructions:</strong> {order.special_instructions}
                      </p>
                    )}

                    {showBidForm === order.order_id ? (
                      <div style={{ marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Submit Your Bid</h4>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                              Bid Amount ($):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              placeholder="5.00"
                              value={bidForm[order.order_id]?.bid_amount || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [order.order_id]: { ...bidForm[order.order_id], bid_amount: e.target.value }
                              })}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                              Estimated Time (minutes):
                            </label>
                            <input
                              type="number"
                              min="5"
                              placeholder="30"
                              value={bidForm[order.order_id]?.estimated_time || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [order.order_id]: { ...bidForm[order.order_id], estimated_time: e.target.value }
                              })}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                              Notes (optional):
                            </label>
                            <textarea
                              placeholder="Any special notes..."
                              value={bidForm[order.order_id]?.notes || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [order.order_id]: { ...bidForm[order.order_id], notes: e.target.value }
                              })}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                resize: 'vertical'
                              }}
                              rows="2"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleSubmitBid(order.order_id)}
                              style={{
                                flex: 1,
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Submit Bid
                            </button>
                            <button
                              onClick={() => setShowBidForm(null)}
                              style={{
                                flex: 1,
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowBidForm(order.order_id)}
                        style={{
                          marginTop: '15px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Place Bid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myBids' && (
        <div>
          <h2 style={{ color: '#fff' }}>My Bids</h2>
          {myBids.length === 0 ? (
            <p style={{ color: '#666' }}>You have no bids yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myBids.map(bid => (
                <div key={bid.bid_id} style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        Order #{bid.Order?.order_id}
                      </h3>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Your Bid:</strong> ${parseFloat(bid.bid_amount).toFixed(2)}
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Estimated Time:</strong> {bid.estimated_time} minutes
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Status:</strong> <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: bid.bid_status === 'accepted' ? '#28a745' :
                            bid.bid_status === 'pending' ? '#f39c12' : '#dc3545',
                          color: 'white'
                        }}>{bid.bid_status}</span>
                      </p>
                      {bid.notes && (
                        <p style={{ color: '#666', margin: '5px 0' }}>
                          <strong>Notes:</strong> {bid.notes}
                        </p>
                      )}
                      <p style={{ color: '#999', margin: '5px 0', fontSize: '12px' }}>
                        Submitted: {new Date(bid.created_at).toLocaleString()}
                      </p>
                    </div>
                    {bid.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawBid(bid.bid_id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Withdraw Bid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ratings' && (
        <div>
          <h3 style={{ color: '#333' }}>My Ratings & Reviews</h3>
          {ratings.length === 0 ? (
            <p style={{ color: '#666' }}>No ratings received yet</p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {ratings.map(rating => (
                <div key={rating.rating_id} style={{
                  color: '#333',
                  background: 'white',
                  border: '1px solid #000000ff',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <RatingDisplay rating={rating.rating} showCount={false} />
                      <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
                        From: {rating.Customer?.User?.first_name} {rating.Customer?.User?.last_name}
                        {rating.is_vip_rating && <span style={{ color: '#f39c12', fontWeight: 'bold', marginLeft: '8px' }}>⭐ VIP (Counts 2x)</span>}
                      </p>
                    </div>
                    <p style={{ color: '#999', fontSize: '12px' }}>
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {rating.comment && (
                    <p style={{ color: '#333', fontSize: '14px', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      "{rating.comment}"
                    </p>
                  )}
                  <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    Order #{rating.order_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div>
          <h3 style={{ color: '#333' }}>Complaints & Compliments</h3>

          <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setComplaintsTab('received')}
              style={{
                padding: '10px 20px',
                background: complaintsTab === 'received' ? '#007bff' : 'transparent',
                color: complaintsTab === 'received' ? 'white' : '#333',
                border: 'none',
                borderBottom: complaintsTab === 'received' ? '2px solid #007bff' : 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Against Me ({receivedComplaints.length})
            </button>
            <button
              onClick={() => setComplaintsTab('filed')}
              style={{
                padding: '10px 20px',
                background: complaintsTab === 'filed' ? '#007bff' : 'transparent',
                color: complaintsTab === 'filed' ? 'white' : '#333',
                border: 'none',
                borderBottom: complaintsTab === 'filed' ? '2px solid #007bff' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '10px'
              }}
            >
              Filed by Me ({complaints.length})
            </button>
          </div>

          {complaintsTab === 'received' ? (
            receivedComplaints.length === 0 ? (
              <p style={{ color: '#666' }}>No complaints or compliments received</p>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {receivedComplaints.map(complaint => (
                  <div key={complaint.complaint_id} style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          background: complaint.complaint_type === 'complaint' ? '#dc3545' : '#28a745',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          {complaint.complaint_type?.toUpperCase()}
                        </span>
                        <span style={{
                          background: complaint.status === 'resolved' ? '#6c757d' : complaint.status === 'under_review' ? '#ffc107' : '#007bff',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {complaint.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        {complaint.is_vip_complaint && (
                          <span style={{
                            background: '#f39c12',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginLeft: '10px'
                          }}>
                            VIP
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                      Filed by: {complaint.Filer ? `${complaint.Filer.first_name} ${complaint.Filer.last_name}` : "Unknown" || 'Unknown'}
                    </p>
                    {complaint.category && (
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                        Category: {complaint.category}
                      </p>
                    )}
                    <p style={{ color: '#333', fontSize: '14px', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      {complaint.description}
                    </p>
                    {complaint.manager_decision && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: complaint.manager_decision === 'upheld' ? '#f8d7da' : '#d4edda',
                        border: `1px solid ${complaint.manager_decision === 'upheld' ? '#f5c6cb' : '#c3e6cb'}`,
                        borderRadius: '4px'
                      }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          Manager Decision: {complaint.manager_decision?.toUpperCase()}
                        </p>
                        {complaint.manager_notes && (
                          <p style={{ fontSize: '14px' }}>{complaint.manager_notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            complaints.length === 0 ? (
              <p style={{ color: '#666' }}>You haven't filed any complaints or compliments</p>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {complaints.map(complaint => (
                  <div key={complaint.complaint_id} style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          background: complaint.complaint_type === 'complaint' ? '#dc3545' : '#28a745',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          {complaint.complaint_type?.toUpperCase()}
                        </span>
                        <span style={{
                          background: complaint.status === 'resolved' ? '#6c757d' : complaint.status === 'under_review' ? '#ffc107' : '#007bff',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {complaint.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                      Subject: {complaint.Subject ? `${complaint.Subject.first_name} ${complaint.Subject.last_name}` : "Unknown" || 'Unknown'}
                    </p>
                    <p style={{ color: '#333', fontSize: '14px', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      {complaint.description}
                    </p>
                    {complaint.manager_decision && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: complaint.manager_decision === 'upheld' ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${complaint.manager_decision === 'upheld' ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '4px'
                      }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          Manager Decision: {complaint.manager_decision?.toUpperCase()}
                        </p>
                        {complaint.manager_notes && (
                          <p style={{ fontSize: '14px' }}>{complaint.manager_notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryDashboardPage;
