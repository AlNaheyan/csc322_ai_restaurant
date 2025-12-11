import { useState, useEffect } from 'react';

export default function ManagerAnalyticsDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [employees, setEmployees] = useState<any>(null);
  const [complaints, setComplaints] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [overviewRes, revenueRes, ordersRes, customersRes, employeesRes, complaintsRes, menuRes, financialRes] = await Promise.all([
        fetch('http://localhost:3001/api/manager/analytics/overview', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/revenue', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/orders', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/customers', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/employees', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/complaints', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/menu', { headers }),
        fetch('http://localhost:3001/api/manager/analytics/financial', { headers })
      ]);

      setOverview(await overviewRes.json());
      setRevenue(await revenueRes.json());
      setOrders(await ordersRes.json());
      setCustomers(await customersRes.json());
      setEmployees(await employeesRes.json());
      setComplaints(await complaintsRes.json());
      setMenu(await menuRes.json());
      setFinancial(await financialRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 'clamp(20px, 4vw, 50px)',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${overview?.totalRevenue || '0.00'}`, icon: '$', color: '#3b82f6' },
    { label: 'Total Orders', value: overview?.totalOrders || 0, icon: '🛒', color: '#10b981' },
    { label: 'Total Customers', value: overview?.totalCustomers || 0, icon: '👥', color: '#8b5cf6' },
    { label: 'VIP Customers', value: overview?.vipCustomers || 0, icon: '⭐', color: '#f59e0b' },
    { label: 'Active Employees', value: overview?.activeEmployees || 0, icon: '👨‍🍳', color: '#6366f1' },
    { label: 'Pending Complaints', value: overview?.pendingComplaints || 0, icon: '🔔', color: '#ef4444' },
    { label: 'Pending Registrations', value: overview?.pendingRegistrations || 0, icon: '📝', color: '#f97316' },
    { label: 'Avg Order Value', value: `$${revenue?.avgOrderValue || '0.00'}`, icon: '📊', color: '#14b8a6' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'employees', label: 'Employees' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'menu', label: 'Menu' },
    { id: 'financial', label: 'Financial' }
  ];

  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 50px)',
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Comprehensive business insights and performance metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {statCards.map((stat, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#999', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </p>
                <p style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: '0' }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                fontSize: '32px',
                opacity: 0.6
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '4px',
        display: 'flex',
        gap: '4px',
        marginBottom: '32px',
        overflowX: 'auto',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && revenue && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>
              Revenue Trend (Last 10 Days)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {revenue?.revenueByDay?.slice(-10).map((day: any) => (
                <div key={day.date} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#ccc', fontSize: '14px' }}>
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#999', fontSize: '13px' }}>{day.orderCount} orders</span>
                    <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '16px' }}>${day.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Order Status</h3>
              {orders?.statusDistribution?.map((item: any) => (
                <div key={item.status} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <span style={{ color: '#ccc', textTransform: 'capitalize' }}>{item.status}</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Customer Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Total Approved', value: customers?.stats?.total || 0 },
                  { label: 'VIP', value: customers?.stats?.vip || 0 },
                  { label: 'Pending', value: customers?.stats?.pending || 0 },
                  { label: 'Rejected', value: customers?.stats?.rejected || 0 }
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <span style={{ color: '#ccc' }}>{item.label}</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && financial && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '24px', margin: '0 0 32px 0' }}>
            Financial Summary (Last 30 Days)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {[
              { label: 'Total Revenue', value: financial.totalRevenue, color: '#22c55e' },
              { label: 'Total Tax', value: financial.totalTax, color: '#3b82f6' },
              { label: 'Delivery Fees', value: financial.totalDeliveryFees, color: '#8b5cf6' },
              { label: 'Discounts Given', value: financial.totalDiscounts, color: '#ef4444' },
              { label: 'Total Deposits', value: financial.totalDeposits, color: '#6366f1' },
              { label: 'Total Refunds', value: financial.totalRefunds, color: '#f97316' }
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: `4px solid ${item.color}`
              }}>
                <p style={{ color: '#999', fontSize: '13px', margin: '0 0 8px 0' }}>{item.label}</p>
                <p style={{ color: item.color, fontSize: '24px', fontWeight: '700', margin: '0' }}>${item.value}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', margin: '0 0 8px 0' }}>Net Revenue</p>
            <p style={{ color: '#fff', fontSize: '36px', fontWeight: '700', margin: '0' }}>${financial.netRevenue}</p>
          </div>
        </div>
      )}

{activeTab === 'customers' && customers && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Top Spending Customers</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Name</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Email</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Total Spent</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Orders</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'center' }}>VIP</th>
                </tr>
              </thead>
              <tbody>
                {customers.topSpenders?.map((customer: any, idx: number) => (
                  <tr key={customer.customer_id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}>
                    <td style={{ color: '#fff', padding: '12px 8px' }}>{customer.name}</td>
                    <td style={{ color: '#999', fontSize: '14px', padding: '12px 8px' }}>{customer.email}</td>
                    <td style={{ color: '#22c55e', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>${customer.total_spent}</td>
                    <td style={{ color: '#ccc', padding: '12px 8px', textAlign: 'right' }}>{customer.order_count}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {customer.is_vip && <span style={{ color: '#f59e0b' }}>⭐</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'employees' && employees && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Top Performing Employees</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Name</th>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Type</th>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Rating</th>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Ratings</th>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Complaints</th>
                    <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Compliments</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.topPerformers?.map((emp: any, idx: number) => (
                    <tr key={emp.employee_id} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}>
                      <td style={{ color: '#fff', padding: '12px 8px' }}>{emp.name}</td>
                      <td style={{ color: '#ccc', padding: '12px 8px', textTransform: 'capitalize' }}>{emp.employee_type}</td>
                      <td style={{ color: '#fbbf24', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>{emp.average_rating} ⭐</td>
                      <td style={{ color: '#ccc', padding: '12px 8px', textAlign: 'right' }}>{emp.total_ratings}</td>
                      <td style={{ color: '#ef4444', padding: '12px 8px', textAlign: 'right' }}>{emp.complaint_count}</td>
                      <td style={{ color: '#22c55e', padding: '12px 8px', textAlign: 'right' }}>{emp.compliment_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Rating Distribution</h3>
            {employees.ratingDistribution?.map((item: any) => (
              <div key={item.range} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{ color: '#ccc' }}>{item.range} stars</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{item.count} employees</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'menu' && menu && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Top Rated Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {menu.topRatedItems?.slice(0, 5).map((item: any) => (
                <div key={item.item_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 4px 0' }}>{item.name}</p>
                    <p style={{ color: '#999', fontSize: '13px', margin: '0' }}>by {item.chef_name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#fbbf24', fontWeight: '700', margin: '0 0 4px 0' }}>{item.average_rating} ⭐</p>
                    <p style={{ color: '#666', fontSize: '12px', margin: '0' }}>{item.total_ratings} ratings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Most Popular Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {menu.mostPopularItems?.slice(0, 5).map((item: any) => (
                <div key={item.item_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 4px 0' }}>{item.name}</p>
                    <p style={{ color: '#999', fontSize: '13px', margin: '0' }}>by {item.chef_name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#22c55e', fontWeight: '700', margin: '0 0 4px 0' }}>${item.price}</p>
                    <p style={{ color: '#666', fontSize: '12px', margin: '0' }}>{item.order_count} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && complaints && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            {[
              { label: 'Total', value: complaints.stats?.total || 0, color: '#999' },
              { label: 'Pending', value: complaints.stats?.pending || 0, color: '#f59e0b' },
              { label: 'Upheld', value: complaints.stats?.upheld || 0, color: '#ef4444' },
              { label: 'Dismissed', value: complaints.stats?.dismissed || 0, color: '#22c55e' }
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#999', fontSize: '13px', margin: '0 0 8px 0' }}>{stat.label}</p>
                <p style={{ color: stat.color, fontSize: '32px', fontWeight: '700', margin: '0' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Complaints by Category</h3>
            {complaints.byCategory?.map((item: any) => (
              <div key={item.category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{ color: '#ccc', textTransform: 'capitalize' }}>{item.category}</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && orders && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 20px 0' }}>Recent Orders</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Customer</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>Total</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Status</th>
                  <th style={{ color: '#999', fontSize: '13px', fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.recentOrders?.map((order: any, idx: number) => (
                  <tr key={order.order_id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}>
                    <td style={{ color: '#fff', fontWeight: '600', padding: '12px 8px' }}>#{order.order_id}</td>
                    <td style={{ color: '#ccc', padding: '12px 8px' }}>{order.customer_name}</td>
                    <td style={{ color: '#22c55e', fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>${order.total}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.15)' :
                                   order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                                   'rgba(245, 158, 11, 0.15)',
                        color: order.status === 'delivered' ? '#22c55e' :
                               order.status === 'cancelled' ? '#ef4444' :
                               '#f59e0b'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: '#999', fontSize: '13px', padding: '12px 8px' }}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
