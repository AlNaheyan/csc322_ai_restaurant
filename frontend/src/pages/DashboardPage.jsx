import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { customerService } from '../services/customerService';
import { logout } from '../store/authSlice';

function DashboardPage() {
  const [customer, setCustomer] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCloseAccount, setShowCloseAccount] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const data = await customerService.getProfile();
      setCustomer(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    setError(null);

    try {
      await customerService.addDeposit(parseFloat(depositAmount));
      setDepositAmount('');
      await loadCustomerData();
      alert('Deposit successful!');
      setDepositLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed');
      setDepositLoading(false);
    }
  };

  const handleCloseAccount = async () => {
    if (!closureReason.trim()) {
      setError('Please provide a reason for closing your account');
      return;
    }

    if (!window.confirm('Are you sure you want to close your account? This action cannot be undone.')) {
      return;
    }

    try {
      await customerService.closeAccount(closureReason);
      alert('Your account has been closed. You will be logged out.');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to close account');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: 'clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)', maxWidth: '1000px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>Customer Dashboard</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333' }}>Account Balance</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
          ${parseFloat(customer?.deposit_balance || 0).toFixed(2)}
        </p>
        {customer?.is_vip && (
          <span style={{ background: 'gold', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', color: '#333' }}>
            VIP Member
          </span>
        )}
        {!customer?.is_vip && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196f3' }}>
            <h4 style={{ color: '#1976d2', marginTop: 0, fontSize: '14px' }}>Become a VIP Member!</h4>
            <p style={{ color: '#1976d2', fontSize: '13px', margin: '8px 0' }}>
              VIP benefits: Free delivery, exclusive menu items, priority support, and your ratings count 2x!
            </p>
            <p style={{ color: '#1976d2', fontSize: '13px', margin: '5px 0' }}>
              <strong>Requirements:</strong> Spend $100+ OR place 3+ orders (with no active complaints)
            </p>
            <div style={{ marginTop: '10px', fontSize: '13px' }}>
              <p style={{ color: '#1976d2', margin: '3px 0' }}>
                Progress: ${parseFloat(customer?.total_spent || 0).toFixed(2)} / $100 spent
              </p>
              <p style={{ color: '#1976d2', margin: '3px 0' }}>
                {customer?.order_count || 0} / 3 orders placed
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333' }}>Add Funds</h3>
        <form onSubmit={handleDeposit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            min="10"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Amount (min $10)"
            required
            style={{ flex: 1, padding: '10px', color: '#333' }}
          />
          <button
            type="submit"
            disabled={depositLoading}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {depositLoading ? 'Processing...' : 'Add Deposit'}
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ color: '#333' }}>Account Stats</h3>
        <p style={{ color: '#333' }}>Total Orders: {customer?.order_count || 0}</p>
        <p style={{ color: '#333' }}>Total Spent: ${parseFloat(customer?.total_spent || 0).toFixed(2)}</p>
        <p style={{ color: '#333' }}>Registration Status: {customer?.registration_status}</p>
        <p style={{ color: '#333' }}>Warnings: {customer?.warning_count || 0}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/orders">View Order History</a>
      </div>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <h3 style={{ color: '#dc3545' }}>Danger Zone</h3>
        {!showCloseAccount ? (
          <button
            onClick={() => setShowCloseAccount(true)}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close Account
          </button>
        ) : (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h4 style={{ color: '#856404', marginTop: 0 }}>Close Your Account</h4>
            <p style={{ color: '#856404', marginBottom: '15px' }}>
              Warning: This action cannot be undone. Your account balance must be $0 to close your account.
            </p>
            <p style={{ color: '#856404', marginBottom: '15px' }}>
              Current Balance: ${parseFloat(customer?.deposit_balance || 0).toFixed(2)}
            </p>
            {parseFloat(customer?.deposit_balance || 0) > 0 && (
              <p style={{ color: '#dc3545', marginBottom: '15px', fontWeight: 'bold' }}>
                You cannot close your account while you have a remaining balance.
              </p>
            )}
            <textarea
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              placeholder="Please tell us why you're closing your account..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '15px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCloseAccount}
                disabled={parseFloat(customer?.deposit_balance || 0) > 0}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: parseFloat(customer?.deposit_balance || 0) > 0 ? 'not-allowed' : 'pointer',
                  opacity: parseFloat(customer?.deposit_balance || 0) > 0 ? 0.5 : 1
                }}
              >
                Confirm Account Closure
              </button>
              <button
                onClick={() => {
                  setShowCloseAccount(false);
                  setClosureReason('');
                  setError(null);
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
