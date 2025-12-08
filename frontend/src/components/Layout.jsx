import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/authSlice';

function Layout({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#333',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            Restaurant
          </h1>
          <nav style={{ display: 'flex', gap: '15px' }}>
            <Link to="/menu" style={{ color: 'white', textDecoration: 'none' }}>Menu</Link>
            {isAuthenticated && (
              <>
                {(user?.role === 'customer' || user?.role === 'vip') && (
                  <>
                    <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>
                  </>
                )}
                {user?.role === 'chef' && (
                  <Link to="/chef/dashboard" style={{ color: 'white', textDecoration: 'none' }}>My Kitchen</Link>
                )}
                {user?.role === 'delivery' && (
                  <Link to="/delivery/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Deliveries</Link>
                )}
                {user?.role === 'manager' && (
                  <Link to="/manager/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Manager Panel</Link>
                )}
              </>
            )}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span>{user?.first_name} ({user?.role})</span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        background: '#f5f5f5',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #ddd',
        color: '#333'
      }}>
        <p style={{ margin: 0 }}>Restaurant Order & Delivery System</p>
      </footer>
    </div>
  );
}

export default Layout;
