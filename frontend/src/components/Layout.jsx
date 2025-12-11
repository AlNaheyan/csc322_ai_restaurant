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
        padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 24px)', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigate('/')}>
            Restaurant
          </h1>
          <nav style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 15px)', flexWrap: 'wrap' }}>
            <Link to="/menu" style={{ color: 'white', textDecoration: 'none' }}>Menu</Link>
            <Link to="/chat" style={{ color: 'white', textDecoration: 'none' }}>Chat</Link>
            {isAuthenticated && (
              <Link to="/kb/contribute" style={{ color: 'white', textDecoration: 'none' }}>Contribute KB</Link>
            )}
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
                  <>
                    <Link to="/manager/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Manager Panel</Link>
                    <Link to="/manager/kb" style={{ color: 'white', textDecoration: 'none' }}>KB Review</Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 15px)', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 'clamp(12px, 2vw, 16px)' }}>{user?.first_name} ({user?.role})</span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 1.5vw, 16px)'
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
      <main style={{ flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {children}
      </main>
      <footer style={{
        background: '#f5f5f5',
        padding: 'clamp(15px, 2.5vw, 20px)',
        textAlign: 'center',
        borderTop: '1px solid #ddd',
        color: '#333'
      }}>
        <p style={{ margin: 0, fontSize: 'clamp(12px, 1.5vw, 16px)' }}>Restaurant Order & Delivery System</p>
      </footer>
    </div>
  );
}

export default Layout;
