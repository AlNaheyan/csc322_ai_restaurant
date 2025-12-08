import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { clearCart } from '../store/cartSlice';

function CheckoutPage() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        })),
        delivery_address: deliveryAddress,
        special_instructions: specialInstructions
      };

      const result = await orderService.createOrder(orderData);
      dispatch(clearCart());
      alert(`Order placed successfully! Order ID: ${result.order_id}`);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Checkout</h2>
        <p>Your cart is empty</p>
        <a href="/menu">Browse Menu</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Delivery Address:</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            rows="3"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Special Instructions (optional):</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <h3>Order Summary</h3>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
          {items.map(item => (
            <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{item.name} x {item.quantity}</span>
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ color: 'red', margin: '15px 0' }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
