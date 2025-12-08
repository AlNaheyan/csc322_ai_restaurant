import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { menuService } from '../services/menuService';
import { addToCart } from '../store/cartSlice';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load menu');
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
    alert(`${item.name} added to cart!`);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading menu...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Menu</h1>
      {menuItems.length === 0 ? (
        <p>No menu items available</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {menuItems.map(item => (
            <div key={item.item_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <h3>{item.name}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>{item.description}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>${parseFloat(item.price).toFixed(2)}</p>
              {item.is_vip_only && (
                <span style={{ background: '#gold', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>VIP Only</span>
              )}
              {item.Chef && (
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Chef: {item.Chef.User?.first_name} {item.Chef.User?.last_name}
                </p>
              )}
              <p style={{ fontSize: '12px' }}>
                Rating: {parseFloat(item.average_rating).toFixed(1)} ⭐ ({item.total_ratings} reviews)
              </p>
              <button
                onClick={() => handleAddToCart(item)}
                style={{ width: '100%', padding: '10px', marginTop: '10px', cursor: 'pointer' }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <a href="/cart">Go to Cart</a>
      </div>
    </div>
  );
}

export default MenuPage;
