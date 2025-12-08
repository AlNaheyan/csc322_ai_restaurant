import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

function DeliveryDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    loadData();
  }, []);

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

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
    </div>
  );
}

export default DeliveryDashboardPage;
