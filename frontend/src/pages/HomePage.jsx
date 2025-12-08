import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

function HomePage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [topChefs, setTopChefs] = useState([]);

  const loadTopChefs = useCallback(async () => {
    try {
      const response = await api.get('/employees/top-chefs?limit=3');
      setTopChefs(response.data);
    } catch (err) {
      console.error('Failed to load top chefs:', err);
    }
  }, []);

  useEffect(() => {
    loadTopChefs();
  }, [loadTopChefs]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1>Welcome to Restaurant Order System</h1>
          <p style={{ fontSize: '18px', marginTop: '20px' }}>
            Experience fine dining delivered to your door
          </p>
          <div style={{ marginTop: '30px' }}>
            <a href="/menu" style={{
              background: '#007bff',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              Browse Menu
            </a>
          </div>
        </div>

        {topChefs.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Our Top Chefs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              {topChefs.map(chef => (
                <div key={chef.employee_id} style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  {chef.profile_picture_url ? (
                    <img
                      src={chef.profile_picture_url}
                      alt={`${chef.User?.first_name} ${chef.User?.last_name}`}
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        margin: '0 auto 15px'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      margin: '0 auto 15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      color: '#999'
                    }}>
                      👨‍🍳
                    </div>
                  )}
                  <h3 style={{ color: '#333', marginBottom: '10px' }}>
                    {chef.User?.first_name} {chef.User?.last_name}
                  </h3>
                  <div style={{ color: '#f39c12', fontSize: '20px', marginBottom: '10px' }}>
                    {'★'.repeat(Math.round(chef.average_rating))}
                    {'☆'.repeat(5 - Math.round(chef.average_rating))}
                  </div>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {parseFloat(chef.average_rating).toFixed(1)} rating ({chef.total_ratings} reviews)
                  </p>
                  {chef.bio && (
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '10px', fontStyle: 'italic' }}>
                      {chef.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#fff' }}>Welcome, {user?.first_name}!</h1>
      <p style={{ color: '#fff' }}>Email: {user?.email}</p>
      <p style={{ color: '#fff' }}>Role: {user?.role}</p>
      {user?.Customer && (
        <div>
          <p style={{ color: '#fff' }}>Balance: ${user.Customer.deposit_balance}</p>
          <p style={{ color: '#fff' }}>VIP Status: {user.Customer.is_vip ? 'Yes' : 'No'}</p>
          <p style={{ color: '#fff' }}>Registration: {user.Customer.registration_status}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
