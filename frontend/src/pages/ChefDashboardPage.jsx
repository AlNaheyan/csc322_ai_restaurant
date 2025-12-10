import { useState, useEffect } from 'react';
import { chefService } from '../services/chefService';
import socketService from '../services/socketService';

function ChefDashboardPage() {
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_vip_only: false,
    is_available: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadDashboardData();

    socketService.on('new_order', loadDashboardData);
    socketService.on('order_status_update', loadDashboardData);

    return () => {
      socketService.off('new_order', loadDashboardData);
      socketService.off('order_status_update', loadDashboardData);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, itemsData, ordersData] = await Promise.all([
        chefService.getDashboard(),
        chefService.getMyMenuItems(),
        chefService.getMyOrders()
      ]);
      setStats(statsData);
      setMenuItems(itemsData);
      setOrders(ordersData);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await chefService.updateMenuItem(editingItem.item_id, formData);
        alert('Menu item updated successfully!');
      } else {
        await chefService.createMenuItem(formData);
        alert('Menu item created successfully!');
      }
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        is_vip_only: false,
        is_available: true
      });
      setShowAddForm(false);
      setEditingItem(null);
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_vip_only: item.is_vip_only,
      is_available: item.is_available
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await chefService.deleteMenuItem(itemId);
      alert('Menu item deleted successfully!');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete menu item');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      is_vip_only: false,
      is_available: true
    });
  };

  const handleMarkReady = async (orderId) => {
    try {
      await chefService.markOrderReady(orderId);
      alert('Order marked as ready for delivery!');
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark order as ready');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready: '#20c997',
      out_for_delivery: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>Chef Dashboard</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'orders' ? '#007bff' : 'transparent',
            color: activeTab === 'orders' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'menu' ? '#007bff' : 'transparent',
            color: activeTab === 'menu' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'menu' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Menu Items ({menuItems.length})
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>Total Menu Items</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: 0 }}>{stats.menu_items_count}</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>Active Items</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>{stats.active_items_count}</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>Total Orders</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: 0 }}>{stats.total_orders}</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>Rating</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12', margin: 0 }}>
              {parseFloat(stats.average_rating).toFixed(1)} ★
            </p>
            <p style={{ color: '#666', fontSize: '12px', margin: '5px 0 0 0' }}>
              ({stats.total_ratings} reviews)
            </p>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3 style={{ color: '#333' }}>Active Orders</h3>
          {orders.length === 0 ? (
            <p style={{ color: '#666' }}>No active orders at the moment</p>
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
                      <h4 style={{ color: '#333', margin: 0 }}>Order #{order.order_id}</h4>
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
                    <h5 style={{ color: '#333', marginBottom: '10px' }}>Your Items:</h5>
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
                    <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                      <strong>Delivery Address:</strong> {order.delivery_address}
                    </p>
                    {order.special_instructions && (
                      <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                        <strong>Special Instructions:</strong> {order.special_instructions}
                      </p>
                    )}
                  </div>

                  {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                    <div style={{ marginTop: '15px' }}>
                      <button
                        onClick={() => handleMarkReady(order.order_id)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        Mark as Ready for Delivery
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Add New Menu Item
            </button>
          </div>

      {showAddForm && (
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#333', marginTop: 0 }}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Image URL:</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                <input
                  type="checkbox"
                  name="is_vip_only"
                  checked={formData.is_vip_only}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                VIP Only
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Available
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 style={{ color: '#333' }}>My Menu Items</h3>
      {menuItems.length === 0 ? (
        <p style={{ color: '#666' }}>No menu items yet. Create your first one!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {menuItems.map(item => (
            <div key={item.item_id} style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px'
            }}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                />
              )}
              <h4 style={{ color: '#333', margin: '0 0 10px 0' }}>{item.name}</h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{item.description}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
                ${parseFloat(item.price).toFixed(2)}
              </p>
              <div style={{ marginBottom: '10px' }}>
                {item.is_vip_only && (
                  <span style={{ background: 'gold', color: '#333', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>
                    VIP Only
                  </span>
                )}
                <span style={{
                  background: item.is_available ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>
                Rating: {parseFloat(item.average_rating).toFixed(1)} ★ ({item.total_ratings} reviews)
              </p>
              <p style={{ color: '#666', fontSize: '12px', marginBottom: '15px' }}>
                Orders: {item.order_count}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    flex: 1,
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.item_id)}
                  style={{
                    flex: 1,
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
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

export default ChefDashboardPage;
