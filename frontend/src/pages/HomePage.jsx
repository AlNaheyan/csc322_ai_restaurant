import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

function HomePage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Welcome to Restaurant Order System</h1>
        <p>Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {user?.first_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      {user?.Customer && (
        <div>
          <p>Balance: ${user.Customer.deposit_balance}</p>
          <p>VIP Status: {user.Customer.is_vip ? 'Yes' : 'No'}</p>
          <p>Registration: {user.Customer.registration_status}</p>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <a href="/menu" style={{ marginRight: '15px' }}>Browse Menu</a>
        <a href="/dashboard" style={{ marginRight: '15px' }}>My Dashboard</a>
        <a href="/cart" style={{ marginRight: '15px' }}>Cart</a>
      </div>
      <button onClick={handleLogout} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
}

export default HomePage;
