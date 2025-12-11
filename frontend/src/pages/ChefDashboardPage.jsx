import { useState, useEffect } from 'react';
import { chefService } from '../services/chefService';
import socketService from '../services/socketService';
import RatingDisplay from '../components/RatingDisplay';

function ChefDashboardPage() {
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [receivedComplaints, setReceivedComplaints] = useState([]);
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
  const [complaintsTab, setComplaintsTab] = useState('received');

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'ratings') {
      loadRatings();
    }
    if (activeTab === 'complaints') {
      loadComplaints();
    }

    socketService.on('new_order', loadDashboardData);
    socketService.on('order_status_update', loadDashboardData);

    return () => {
      socketService.off('new_order', loadDashboardData);
      socketService.off('order_status_update', loadDashboardData);
    };
  }, [activeTab]);

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

  const loadRatings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chef/profile', {
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
    <div style={{ padding: 'clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#333', fontSize: 'clamp(24px, 4vw, 32px)' }}>Chef Dashboard</h2>

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
        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'ratings' ? '#007bff' : 'transparent',
            color: activeTab === 'ratings' ? 'white' : '#FFFF',
            border: 'none',
            borderBottom: activeTab === 'ratings' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '10px'
          }}
        >
          My Ratings
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'complaints' ? '#007bff' : 'transparent',
            color: activeTab === 'complaints' ? 'white' : '#FFFF',
            border: 'none',
            borderBottom: activeTab === 'complaints' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '10px'
          }}
        >
          Complaints
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: 'clamp(20px, 3vw, 30px)' }}>
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

          <h3 style={{ color: '#fff' }}>My Menu Items</h3>
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
                      Filed by: {complaint.Filer ? `${complaint.Filer.first_name} ${complaint.Filer.last_name}` : 'Unknown'}
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
                      Subject: {complaint.Subject ? `${complaint.Subject.first_name} ${complaint.Subject.last_name}` : 'Unknown'}
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

export default ChefDashboardPage;
