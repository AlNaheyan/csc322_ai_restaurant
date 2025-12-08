import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';

function CartPage() {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    dispatch(updateQuantity({ item_id: itemId, quantity: parseInt(newQuantity) }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Shopping Cart</h2>
        <p>Your cart is empty</p>
        <a href="/menu">Browse Menu</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Shopping Cart</h2>
      <div>
        {items.map(item => (
          <div key={item.item_id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{item.name}</h3>
              <p>${parseFloat(item.price).toFixed(2)} each</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.item_id, e.target.value)}
                style={{ width: '60px', padding: '5px' }}
              />
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              <button onClick={() => handleRemove(item.item_id)} style={{ padding: '5px 10px' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', borderTop: '2px solid #000', paddingTop: '10px' }}>
        <h3>Subtotal: ${total.toFixed(2)}</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Tax, delivery fee, and VIP discounts will be calculated at checkout
        </p>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => dispatch(clearCart())} style={{ padding: '10px 20px' }}>
          Clear Cart
        </button>
        <button onClick={handleCheckout} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default CartPage;
