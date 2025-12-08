import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { menuService } from '../services/menuService';
import { addToCart } from '../store/cartSlice';

function MenuItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMenuItem();
  }, [id]);

  const loadMenuItem = async () => {
    try {
      const data = await menuService.getById(id);
      setItem(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load menu item');
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'customer' && user?.role !== 'vip') {
      alert('Only customers can add items to cart');
      return;
    }

    dispatch(addToCart({
      item_id: item.item_id,
      name: item.name,
      price: item.price,
      is_vip_only: item.is_vip_only
    }));

    alert('Added to cart!');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!item) return <div style={{ padding: '20px' }}>Menu item not found</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/menu')}
        style={{
          background: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Back to Menu
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '400px',
              background: '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              No image available
            </div>
          )}
        </div>

        <div>
          <h1 style={{ color: '#333', marginTop: 0 }}>{item.name}</h1>
          {item.is_vip_only && (
            <span style={{
              background: 'gold',
              color: '#333',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '15px'
            }}>
              VIP Only
            </span>
          )}

          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: '15px 0' }}>
            ${parseFloat(item.price).toFixed(2)}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#333' }}>Rating:</span>
              <span style={{ color: '#f39c12', fontSize: '20px' }}>
                {'★'.repeat(Math.round(item.average_rating))}
                {'☆'.repeat(5 - Math.round(item.average_rating))}
              </span>
              <span style={{ color: '#666' }}>
                ({parseFloat(item.average_rating).toFixed(1)} / {item.total_ratings} ratings)
              </span>
            </div>
            <p style={{ color: '#333' }}>Orders: {item.order_count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#333' }}>Description</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {item.description || 'No description available'}
            </p>
          </div>

          {item.is_available ? (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{
                    width: '80px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <button
                onClick={handleAddToCart}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <div style={{
              background: '#dc3545',
              color: 'white',
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuItemDetailPage;
