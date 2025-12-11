import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useState } from 'react';

function Layout({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const NavLink = ({ to, children, index }) => (
    <Link
      to={to}
      onMouseEnter={() => setHoveredLink(index)}
      onMouseLeave={() => setHoveredLink(null)}
      style={{
        color: hoveredLink === index ? '#4ade80' : '#cbd5e1',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s ease',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </Link>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: '#ffffff',
              fontWeight: 'bold'
            }}
            onClick={() => navigate('/')}
          >
            🦫 Beaver Eats
          </h1>
          <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <NavLink to="/menu" index="menu">Menu</NavLink>
            <NavLink to="/chat" index="chat">AI Chat</NavLink>

            {isAuthenticated && user?.role !== 'visitor' && (
              <>
                <NavLink to="/discussions" index="discussions">Discussions</NavLink>
                <NavLink to="/kb/contribute" index="kb">Knowledge Base</NavLink>
              </>
            )}

            {isAuthenticated && (user?.role === 'customer' || user?.role === 'vip') && (
              <>
                <NavLink to="/cart" index="cart">Cart</NavLink>
                <NavLink to="/dashboard" index="dashboard">Dashboard</NavLink>
                <NavLink to="/orders" index="orders">Orders</NavLink>
              </>
            )}

            {user?.role === 'chef' && (
              <NavLink to="/chef/dashboard" index="chef">My Kitchen</NavLink>
            )}

            {user?.role === 'delivery' && (
              <NavLink to="/delivery/dashboard" index="delivery">Deliveries</NavLink>
            )}

            {user?.role === 'manager' && (
              <>
                <NavLink to="/manager/dashboard" index="mgr-dash">Dashboard</NavLink>
                <NavLink to="/manager/registrations" index="mgr-reg">Registrations</NavLink>
                <NavLink to="/manager/complaints" index="mgr-comp">Complaints</NavLink>
                <NavLink to="/manager/performance" index="mgr-perf">Performance</NavLink>
                <NavLink to="/manager/analytics" index="mgr-analytics">Analytics</NavLink>
                <NavLink to="/manager/kb" index="mgr-kb">KB Review</NavLink>
                <NavLink to="/manager/discussions/moderation" index="mgr-disc">Moderation</NavLink>
              </>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  {user?.first_name} {user?.last_name}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: user?.role === 'vip' ? '#fbbf24' : '#94a3b8',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {user?.role === 'vip' ? '⭐ VIP' : user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b91c1c';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.transform = 'translateY(0)';
                }}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: '#cbd5e1',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#4ade80',
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {children}
      </main>

      <footer style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderTop: '1px solid #334155',
        padding: '20px',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          © 2025 Beaver Eats - AI-Powered Order & Delivery System
        </p>
      </footer>
    </div>
  );
}

export default Layout;
