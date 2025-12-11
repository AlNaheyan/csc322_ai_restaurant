import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Complaint {
  complaint_id: number;
  complaint_type: string;
  subject_type: string;
  category: string;
  description: string;
  evidence_url: string | null;
  status: string;
  is_vip_complaint: boolean;
  is_disputed: boolean;
  dispute_notes: string | null;
  created_at: string;
  Filer: {
    user_id: number;
    username: string;
    email: string;
  };
  Subject: {
    user_id: number;
    username: string;
    email: string;
  };
}

export default function ManagerComplaintReview() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [decision, setDecision] = useState<'upheld' | 'dismissed'>('upheld');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/complaints/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints');
      }

      setComplaints(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (complaintId: number) => {
    if (!notes.trim()) {
      alert('Please provide review notes');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/complaints/${complaintId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ decision, notes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to review complaint');
      }

      setReviewingId(null);
      setNotes('');
      fetchComplaints();
      alert('Review submitted successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading complaints...
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
          Complaint Review Dashboard
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Review and manage customer complaints and compliments
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

      {complaints.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
            No pending complaints to review
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {complaints.map((complaint) => (
            <div
              key={complaint.complaint_id}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: complaint.is_vip_complaint
                  ? '1px solid rgba(251, 191, 36, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: complaint.is_vip_complaint
                  ? '4px solid #fbbf24'
                  : '4px solid rgba(255, 255, 255, 0.08)',
                padding: '24px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: complaint.complaint_type === 'complaint'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                      color: complaint.complaint_type === 'complaint' ? '#ef4444' : '#22c55e',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {complaint.complaint_type}
                    </span>
                    {complaint.is_vip_complaint && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'rgba(251, 191, 36, 0.15)',
                        color: '#fbbf24',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        VIP
                      </span>
                    )}
                    {complaint.is_disputed && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        background: 'rgba(249, 115, 22, 0.15)',
                        color: '#f97316',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <AlertTriangle size={12} />
                        DISPUTED
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#999', fontSize: '14px', margin: '4px 0' }}>
                    <strong style={{ color: '#ccc' }}>Subject:</strong> {complaint.Subject.username} ({complaint.subject_type})
                  </p>
                  <p style={{ color: '#999', fontSize: '14px', margin: '4px 0' }}>
                    <strong style={{ color: '#ccc' }}>Filed by:</strong> {complaint.Filer.username}
                  </p>
                  {complaint.category && (
                    <p style={{ color: '#999', fontSize: '14px', margin: '4px 0' }}>
                      <strong style={{ color: '#ccc' }}>Category:</strong> {complaint.category}
                    </p>
                  )}
                </div>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {new Date(complaint.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Description:
                </h3>
                <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
                  {complaint.description}
                </p>
              </div>

              {complaint.evidence_url && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Evidence:
                  </h3>
                  <a
                    href={complaint.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#60a5fa',
                      fontSize: '14px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {complaint.evidence_url}
                  </a>
                </div>
              )}

              {complaint.is_disputed && complaint.dispute_notes && (
                <div style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Dispute Notes:
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '14px', margin: '0' }}>
                    {complaint.dispute_notes}
                  </p>
                </div>
              )}

              {reviewingId === complaint.complaint_id ? (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#ccc',
                      fontSize: '13px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as 'upheld' | 'dismissed')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="upheld" style={{ background: '#1e293b' }}>Uphold</option>
                      <option value="dismissed" style={{ background: '#1e293b' }}>Dismiss</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#ccc',
                      fontSize: '13px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Review Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Provide your reasoning..."
                      required
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
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleReview(complaint.complaint_id)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => {
                        setReviewingId(null);
                        setNotes('');
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#999',
                        border: 'none',
                        padding: '12px 24px',
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
                <button
                  onClick={() => setReviewingId(complaint.complaint_id)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Review This {complaint.complaint_type}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
