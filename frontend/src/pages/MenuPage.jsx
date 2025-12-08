import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { menuService } from '../services/menuService';
import { addToCart } from '../store/cartSlice';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [menuItems, searchTerm, sortBy, showVipOnly, minPrice, maxPrice]);

  const loadMenu = async () => {
    try {
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);
      setFilteredItems(items);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load menu');
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = [...menuItems];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showVipOnly) {
      filtered = filtered.filter(item => item.is_vip_only);
    }

    if (minPrice) {
      filtered = filtered.filter(item => parseFloat(item.price) >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(item => parseFloat(item.price) <= parseFloat(maxPrice));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return parseFloat(b.average_rating) - parseFloat(a.average_rating);
        case 'popular':
          return b.order_count - a.order_count;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
    alert(`${item.name} added to cart!`);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading menu...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#fff' }}>Menu</h1>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '14px' }}>
              Search:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '14px' }}>
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="name">Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '14px' }}>
              Min Price:
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="$0"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '14px' }}>
              Max Price:
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
            <input
              type="checkbox"
              checked={showVipOnly}
              onChange={(e) => setShowVipOnly(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            VIP Items Only
          </label>
        </div>

        <div style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
          Showing {filteredItems.length} of {menuItems.length} items
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
          No menu items match your filters
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredItems.map(item => (
            <div key={item.item_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}>
              <div onClick={() => navigate(`/menu/${item.item_id}`)}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <h3 style={{ color: '#fff' }}>{item.name}</h3>
                <p style={{ fontSize: '14px', color: '#fff' }}>{item.description}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>${parseFloat(item.price).toFixed(2)}</p>
                {item.is_vip_only && (
                  <span style={{ background: 'gold', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>VIP Only</span>
                )}
                {item.Chef && (
                  <p style={{ fontSize: '12px', color: '#888' }}>
                    Chef: {item.Chef.User?.first_name} {item.Chef.User?.last_name}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#fff' }}>
                  Rating: {parseFloat(item.average_rating).toFixed(1)} ⭐ ({item.total_ratings} reviews)
                </p>
              </div>
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
        <Link to="/cart" style={{ color: '#007bff', textDecoration: 'none' }}>Go to Cart</Link>
      </div>
    </div>
  );
}

export default MenuPage;
