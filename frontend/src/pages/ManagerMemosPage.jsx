import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function ManagerMemosPage() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    referenceType: 'delivery_bid',
    referenceId: '',
    memoText: ''
  });

  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/manager/memos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch memos');
      const data = await response.json();
      setMemos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemo = async (e) => {
    e.preventDefault();

    if (!formData.referenceId || !formData.memoText.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/manager/memos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create memo');

      alert('Memo created successfully!');
      setShowCreateForm(false);
      setFormData({ referenceType: 'delivery_bid', referenceId: '', memoText: '' });
      fetchMemos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateMemo = async (memoId) => {
    if (!editText.trim()) {
      alert('Memo text cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/manager/memos/${memoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ memoText: editText })
      });

      if (!response.ok) throw new Error('Failed to update memo');

      alert('Memo updated successfully!');
      setEditingId(null);
      setEditText('');
      fetchMemos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMemo = async (memoId) => {
    if (!confirm('Are you sure you want to delete this memo?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/manager/memos/${memoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete memo');

      alert('Memo deleted successfully!');
      fetchMemos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading memos...
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
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            Manager Memos
          </h1>
          <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
            Create and manage notes for delivery bids, performance decisions, and complaints
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {showCreateForm ? <X size={18} /> : <Plus size={18} />}
          {showCreateForm ? 'Cancel' : 'Create Memo'}
        </button>
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

      {showCreateForm && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px',
          borderRadius: '12px',
          marginBottom: '32px',
          backdropFilter: 'blur(4px)'
        }}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginTop: '0', marginBottom: '24px' }}>
            Create New Memo
          </h3>

          <form onSubmit={handleCreateMemo}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ccc',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Reference Type
              </label>
              <select
                value={formData.referenceType}
                onChange={(e) => setFormData({ ...formData, referenceType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="delivery_bid">Delivery Bid</option>
                <option value="performance_override">Performance Override</option>
                <option value="complaint_decision">Complaint Decision</option>
                <option value="warning_override">Warning Override</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ccc',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Reference ID
              </label>
              <input
                type="number"
                value={formData.referenceId}
                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                placeholder="Enter the ID of the item this memo refers to"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ccc',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Memo Text
              </label>
              <textarea
                value={formData.memoText}
                onChange={(e) => setFormData({ ...formData, memoText: e.target.value })}
                placeholder="Enter your memo notes..."
                rows={5}
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

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Memo
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {memos.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '60px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FileText size={48} style={{ color: '#666', margin: '0 auto 16px' }} />
            <p style={{ color: '#999', margin: '0' }}>No memos yet</p>
          </div>
        ) : (
          memos.map((memo) => (
            <div key={memo.memo_id} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
              transition: 'border-color 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(102, 126, 234, 0.15)',
                    color: '#667eea',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    {memo.reference_type.replace('_', ' ')}
                  </span>
                  <p style={{ color: '#999', fontSize: '13px', margin: '4px 0 0 0' }}>
                    Reference ID: #{memo.reference_id}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {editingId === memo.memo_id ? (
                    <>
                      <button
                        onClick={() => handleUpdateMemo(memo.memo_id)}
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22c55e',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditText('');
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(memo.memo_id);
                          setEditText(memo.memo_text);
                        }}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo.memo_id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === memo.memo_id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
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
              ) : (
                <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                  {memo.memo_text}
                </p>
              )}

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', marginTop: '12px' }}>
                <p style={{ color: '#666', fontSize: '12px', margin: '0' }}>
                  Created by {memo.Manager?.first_name} {memo.Manager?.last_name} on {new Date(memo.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
