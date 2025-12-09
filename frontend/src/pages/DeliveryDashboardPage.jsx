import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import socketService from '../services/socketService';

function DeliveryDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [bidForm, setBidForm] = useState({});
  const [showBidForm, setShowBidForm] = useState(null);

  useEffect(() => {
    loadData();

    socketService.on('new_order_ready', handleNewOrderReady);
    socketService.on('bid_accepted', handleBidAccepted);
    socketService.on('bid_rejected', handleBidRejected);

    return () => {
      socketService.off('new_order_ready', handleNewOrderReady);
      socketService.off('bid_accepted', handleBidAccepted);
      socketService.off('bid_rejected', handleBidRejected);
    };
  }, []);

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
      const response = await api.get('/orders?status=ready');
      setReadyOrders(response.data.filter(order => !order.assigned_delivery_person));
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
    if (!bid?.bid_amount || !bid?.estimated_time_minutes) {
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
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#fff' }}>Delivery Dashboard</h1>
      <p style={{ color: '#fff' }}>Welcome, {user?.first_name}!</p>

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
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
                              value={bidForm[order.order_id]?.estimated_time_minutes || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [order.order_id]: { ...bidForm[order.order_id], estimated_time_minutes: e.target.value }
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
                        <strong>Estimated Time:</strong> {bid.estimated_time_minutes} minutes
                      </p>
                      <p style={{ color: '#666', margin: '5px 0' }}>
                        <strong>Status:</strong> <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: bid.status === 'accepted' ? '#28a745' :
                                     bid.status === 'pending' ? '#f39c12' : '#dc3545',
                          color: 'white'
                        }}>{bid.status}</span>
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
    </div>
  );
}

export default DeliveryDashboardPage;
