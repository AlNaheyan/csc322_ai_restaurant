import { useState, useEffect } from 'react';
import { chefService } from '../services/chefService';

function ChefDashboardPage() {
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, itemsData] = await Promise.all([
        chefService.getDashboard(),
        chefService.getMyMenuItems()
      ]);
      setStats(statsData);
      setMenuItems(itemsData);
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

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>Chef Dashboard</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

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
  );
}

export default ChefDashboardPage;
