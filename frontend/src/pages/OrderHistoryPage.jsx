import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import socketService from '../services/socketService';
import RatingForm from '../components/RatingForm';
import ComplaintForm from '../components/ComplaintForm';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingType, setRatingType] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    loadOrders();

    socketService.on('order_status_update', handleOrderStatusUpdate);

    return () => {
      socketService.off('order_status_update', handleOrderStatusUpdate);
    };
  }, []);

  const handleOrderStatusUpdate = (data) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_id === data.orderId
          ? { ...order, status: data.status }
          : order
      )
    );
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready_for_delivery: '#20c997',
      out_for_delivery: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 'clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#333', fontSize: 'clamp(24px, 4vw, 32px)' }}>Order History</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>You haven't placed any orders yet</p>
          <a href="/menu" style={{ color: '#007bff', textDecoration: 'none' }}>
            Browse menu to place your first order
          </a>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {orders.map(order => (
            <div key={order.order_id} style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ color: '#333', margin: 0 }}>Order #{order.order_id}</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Items:</h4>
                {order.OrderItems?.map(item => (
                  <div key={item.order_item_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <span style={{ color: '#333' }}>
                      {item.MenuItem?.name || 'Item'} x {item.quantity}
                    </span>
                    <span style={{ color: '#333', fontWeight: 'bold' }}>
                      ${parseFloat(item.price_at_order * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ color: '#333' }}>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#666' }}>Tax:</span>
                  <span style={{ color: '#333' }}>${parseFloat(order.tax).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#666' }}>Delivery Fee:</span>
                  <span style={{ color: '#333' }}>
                    {order.is_free_delivery ? (
                      <span style={{ color: '#28a745' }}>FREE</span>
                    ) : (
                      `$${parseFloat(order.delivery_fee).toFixed(2)}`
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#666' }}>Discount:</span>
                    <span style={{ color: '#28a745' }}>-${parseFloat(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '2px solid #333'
                }}>
                  <span style={{ color: '#333', fontWeight: 'bold', fontSize: '18px' }}>Total:</span>
                  <span style={{ color: '#333', fontWeight: 'bold', fontSize: '18px' }}>
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                  <strong>Delivery Address:</strong> {order.delivery_address}
                </p>
                {order.special_instructions && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    <strong>Special Instructions:</strong> {order.special_instructions}
                  </p>
                )}
                {order.estimated_delivery_time && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    <strong>Estimated Delivery:</strong> {new Date(order.estimated_delivery_time).toLocaleString()}
                  </p>
                )}
                {order.actual_delivery_time && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    <strong>Delivered At:</strong> {new Date(order.actual_delivery_time).toLocaleString()}
                  </p>
                )}
              </div>

              {order.status === 'delivered' && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>Actions:</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setRatingOrder(order);
                        setRatingType('food');
                      }}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Rate Food/Chef
                    </button>
                    <button
                      onClick={() => {
                        setRatingOrder(order);
                        setRatingType('delivery');
                      }}
                      style={{
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Rate Delivery
                    </button>
                    <button
                      onClick={() => setShowComplaintForm(true)}
                      style={{
                        background: '#ffc107',
                        color: '#333',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      File Complaint/Compliment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ratingOrder && ratingType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
            <RatingForm
              orderId={ratingOrder.order_id}
              targetType={ratingType}
              targetId={ratingType === 'food' ? ratingOrder.OrderItems?.[0]?.chef_id : ratingOrder.assigned_delivery_person}
              targetName={ratingType === 'food' ? 'Chef' : 'Delivery Person'}
              onSubmit={() => {
                setRatingOrder(null);
                setRatingType(null);
                alert('Rating submitted successfully!');
              }}
              onCancel={() => {
                setRatingOrder(null);
                setRatingType(null);
              }}
            />
          </div>
        </div>
      )}

      {showComplaintForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '600px', width: '100%', padding: '20px' }}>
            <ComplaintForm
              onSubmit={() => {
                setShowComplaintForm(false);
                alert('Complaint/Compliment submitted successfully!');
              }}
              onCancel={() => setShowComplaintForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
