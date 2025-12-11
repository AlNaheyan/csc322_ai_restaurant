import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

const ManagerDashboardPage = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bids, setBids] = useState([]);
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReadyOrders();

    socketService.on('new_bid', handleNewBid);
    socketService.on('new_order_ready', handleNewOrderReady);

    return () => {
      socketService.off('new_bid', handleNewBid);
      socketService.off('new_order_ready', handleNewOrderReady);
    };
  }, []);

  const handleNewBid = (data) => {
    if (selectedOrder && data.orderId === selectedOrder.order_id) {
      fetchBidsForOrder(selectedOrder.order_id);
    }
  };

  const handleNewOrderReady = (data) => {
    fetchReadyOrders();
  };

  const fetchReadyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/bidding/orders/with-bids', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReadyOrders(data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchBidsForOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bidding/orders/${orderId}/bids`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data);
      }
    } catch (err) {
      setError('Failed to fetch bids');
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setBids([]);
    setJustification('');
    fetchBidsForOrder(order.order_id);
  };

  const handleAcceptBid = async (bidId) => {
    if (!justification.trim()) {
      alert('Please provide a justification for accepting this bid');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bidding/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ justification })
      });

      if (response.ok) {
        alert('Bid accepted successfully!');
        setSelectedOrder(null);
        setBids([]);
        setJustification('');
        fetchReadyOrders();
      } else {
        const data = await response.json();
        alert(`Failed to accept bid: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to accept bid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 50px)',
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          Manager Dashboard
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Manage all aspects of the restaurant system
        </p>
      </div>

      {/* Quick Access Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '50px'
      }}>
        {[
          { path: '/manager/registrations', icon: '👥', label: 'Registrations', color: '#3b82f6' },
          { path: '/manager/analytics', icon: '📊', label: 'Analytics', color: '#8b5cf6' },
          { path: '/manager/performance', icon: '⭐', label: 'Performance', color: '#10b981' },
          { path: '/manager/complaints', icon: '🔔', label: 'Complaints', color: '#f59e0b' },
          { path: '/manager/memos', icon: '📝', label: 'Memos', color: '#6366f1' },
          { path: '/manager/discussions/moderation', icon: '🛡️', label: 'Moderation', color: '#ef4444' },
          { path: '/manager/kb', icon: '📚', label: 'KB Review', color: '#14b8a6' }
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
              border: 'none',
              padding: '24px 16px',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <h2 style={{
        color: '#fff',
        fontSize: 'clamp(22px, 4vw, 28px)',
        fontWeight: '700',
        margin: '0 0 24px 0'
      }}>
        Bid Management
      </h2>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Orders Ready for Delivery */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)'
        }}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginTop: '0', marginBottom: '20px' }}>
            Orders Ready for Delivery
          </h3>

          {readyOrders.length === 0 ? (
            <p style={{ color: '#999', margin: '0' }}>No orders ready for delivery</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {readyOrders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => handleSelectOrder(order)}
                  style={{
                    background: selectedOrder?.order_id === order.order_id
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: selectedOrder?.order_id === order.order_id
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOrder?.order_id !== order.order_id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOrder?.order_id !== order.order_id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 8px 0' }}>
                        Order #{order.order_id}
                      </p>
                      <p style={{ color: '#999', fontSize: '14px', margin: '0 0 4px 0' }}>
                        {order.delivery_address}
                      </p>
                      <p style={{ color: '#666', fontSize: '13px', margin: '0' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '18px', margin: '0 0 4px 0' }}>
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <p style={{ color: '#999', fontSize: '13px', margin: '0' }}>
                        {order.assigned_delivery_person ? 'Assigned' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bids for Selected Order */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)'
        }}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginTop: '0', marginBottom: '20px' }}>
            {selectedOrder ? `Bids for Order #${selectedOrder.order_id}` : 'Select an Order'}
          </h3>

          {!selectedOrder ? (
            <p style={{ color: '#999', margin: '0' }}>Select an order to view bids</p>
          ) : bids.length === 0 ? (
            <p style={{ color: '#999', margin: '0' }}>No bids yet for this order</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bids.map((bid) => (
                <div key={bid.bid_id} style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 4px 0' }}>
                        {bid.DeliveryPerson?.User?.first_name} {bid.DeliveryPerson?.User?.last_name}
                      </p>
                      <p style={{ color: '#999', fontSize: '13px', margin: '0' }}>
                        {bid.DeliveryPerson?.User?.email}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '18px', margin: '0 0 4px 0' }}>
                        ${parseFloat(bid.bid_amount).toFixed(2)}
                      </p>
                      <p style={{ color: '#999', fontSize: '13px', margin: '0' }}>
                        {bid.estimated_time_minutes} min
                      </p>
                    </div>
                  </div>

                  {bid.notes && (
                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600' }}>Notes:</span> {bid.notes}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ color: '#999', fontSize: '12px' }}>Rating:</span>
                    <span style={{ color: '#fbbf24', fontWeight: '600', fontSize: '14px' }}>
                      {parseFloat(bid.DeliveryPerson?.average_rating || 0).toFixed(1)} ⭐
                    </span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      ({bid.DeliveryPerson?.total_ratings || 0} ratings)
                    </span>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#ccc',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      Justification for accepting this bid:
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Explain why you are accepting this bid..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        marginBottom: '12px'
                      }}
                    />
                    <button
                      onClick={() => handleAcceptBid(bid.bid_id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Accept Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
