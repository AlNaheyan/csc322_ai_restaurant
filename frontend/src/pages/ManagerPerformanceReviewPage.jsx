import { useState, useEffect } from 'react';

const ManagerPerformanceReviewPage = () => {
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [vipCustomers, setVipCustomers] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadPerformanceHistory(),
      loadVipCustomers(),
      loadBlacklist()
    ]);
    setLoading(false);
  };

  const loadPerformanceHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/performance/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPerformanceHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to load performance history:', err);
    }
  };

  const loadVipCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vip/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setVipCustomers(data.data);
      }
    } catch (err) {
      console.error('Failed to load VIP customers:', err);
    }
  };

  const loadBlacklist = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/performance/blacklist', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBlacklist(data.data);
      }
    } catch (err) {
      console.error('Failed to load blacklist:', err);
    }
  };

  const handleEvaluateAll = async () => {
    if (!confirm('Run performance evaluation for all employees?')) return;

    try {
      const response = await fetch('http://localhost:3001/api/performance/evaluate-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Evaluation complete:\n${data.data.bonuses.length} bonuses\n${data.data.demotions.length} demotions\n${data.data.terminations.length} terminations`);
        loadPerformanceHistory();
      }
    } catch (err) {
      alert('Failed to run evaluation');
    }
  };

  const handleCheckVipStatus = async () => {
    if (!confirm('Check VIP status for all customers?')) return;

    try {
      const response = await fetch('http://localhost:3001/api/vip/check-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(`VIP check complete:\n${data.data.upgraded.length} upgraded\n${data.data.downgraded.length} downgraded`);
        loadVipCustomers();
      }
    } catch (err) {
      alert('Failed to check VIP status');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Performance & VIP Management
      </h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('performance')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            background: activeTab === 'performance' ? '#2563eb' : 'white',
            color: activeTab === 'performance' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Performance History
        </button>
        <button
          onClick={() => setActiveTab('vip')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            background: activeTab === 'vip' ? '#2563eb' : 'white',
            color: activeTab === 'vip' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          VIP Customers
        </button>
        <button
          onClick={() => setActiveTab('blacklist')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            background: activeTab === 'blacklist' ? '#2563eb' : 'white',
            color: activeTab === 'blacklist' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Blacklist
        </button>
      </div>

      {activeTab === 'performance' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleEvaluateAll}
              style={{
                padding: '10px 20px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Run Employee Evaluation
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Employee</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Avg Rating</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Total Ratings</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Action Taken</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Bonus/Salary Change</th>
              </tr>
            </thead>
            <tbody>
              {performanceHistory.map((record) => (
                <tr key={record.history_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {record.Employee?.User?.first_name} {record.Employee?.User?.last_name}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {new Date(record.evaluation_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>{record.rating_average}</td>
                  <td style={{ padding: '12px', color: '#333' }}>{record.total_ratings}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: record.action_taken === 'bonus' ? '#dcfce7' :
                                 record.action_taken === 'termination' ? '#fee2e2' :
                                 record.action_taken === 'demotion' ? '#fef3c7' : '#f3f4f6',
                      color: record.action_taken === 'bonus' ? '#166534' :
                             record.action_taken === 'termination' ? '#991b1b' :
                             record.action_taken === 'demotion' ? '#854d0e' : '#6b7280'
                    }}>
                      {record.action_taken || 'none'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {record.bonus_amount && `+$${parseFloat(record.bonus_amount).toFixed(2)}`}
                    {record.salary_change && `${parseFloat(record.salary_change).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'vip' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCheckVipStatus}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Check All VIP Status
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Total Spent</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Order Count</th>
              </tr>
            </thead>
            <tbody>
              {vipCustomers.map((customer) => (
                <tr key={customer.customer_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {customer.User?.first_name} {customer.User?.last_name}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>{customer.User?.email}</td>
                  <td style={{ padding: '12px', color: '#333' }}>${parseFloat(customer.total_spent || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#333' }}>{customer.order_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'blacklist' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Blacklisted By</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {blacklist.map((record) => (
                <tr key={record.blacklist_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {record.BlacklistedUser?.first_name} {record.BlacklistedUser?.last_name}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>{record.reason}</td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {record.BlacklistedBy?.first_name} {record.BlacklistedBy?.last_name}
                  </td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    {new Date(record.blacklisted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerPerformanceReviewPage;
