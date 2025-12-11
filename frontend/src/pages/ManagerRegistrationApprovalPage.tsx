import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface Registration {
  customer_id: number;
  user_id: number;
  registration_status: string;
  created_at: string;
  User: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    created_at: string;
  };
}

export default function ManagerRegistrationApprovalPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/manager/registrations/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch registrations');
      }

      setRegistrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (customerId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/manager/registrations/${customerId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve registration');
      }

      alert('Registration approved successfully!');
      fetchPendingRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (customerId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/manager/registrations/${customerId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject registration');
      }

      alert('Registration rejected successfully!');
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading pending registrations...
      </div>
    );
  }

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
          Registration Approvals
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Review and approve customer registration requests
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {registrations.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <Clock size={48} style={{ color: '#22c55e', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
            No pending registrations
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {registrations.map((reg) => (
            <div key={reg.customer_id} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <User size={20} style={{ color: '#667eea', marginRight: '12px' }} />
                    <h3 style={{
                      color: '#fff',
                      fontSize: '20px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      {reg.User.first_name} {reg.User.last_name}
                    </h3>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Email
                      </p>
                      <p style={{ color: '#fff', fontSize: '14px', margin: '0' }}>
                        {reg.User.email}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Phone
                      </p>
                      <p style={{ color: '#fff', fontSize: '14px', margin: '0' }}>
                        {reg.User.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Registration Date
                      </p>
                      <p style={{ color: '#fff', fontSize: '14px', margin: '0' }}>
                        {new Date(reg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Status
                      </p>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        gap: '6px'
                      }}>
                        <Clock size={12} />
                        Pending
                      </span>
                    </div>
                  </div>

                  {rejectingId === reg.customer_id ? (
                    <div style={{ marginTop: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#ccc',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        Rejection Reason
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          outline: 'none',
                          marginBottom: '12px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleReject(reg.customer_id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#999',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleApprove(reg.customer_id)}
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22c55e',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(reg.customer_id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
