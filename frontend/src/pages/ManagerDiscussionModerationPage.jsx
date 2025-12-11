import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Trash2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManagerDiscussionModerationPage() {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const fetchReportedPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/manager/discussions/reported-posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reported posts');
      const data = await response.json();
      setReportedPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnreport = async (postId) => {
    if (!confirm('Are you sure you want to unreport this post and keep it?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/manager/discussions/posts/${postId}/unreport`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to unreport post');

      alert('Post has been unreported and will remain visible');
      fetchReportedPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/manager/discussions/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      alert('Post has been deleted successfully');
      fetchReportedPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading reported posts...
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
          Discussion Moderation
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Review and moderate reported discussion posts
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

      {reportedPosts.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
          <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
            No reported posts to review
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {reportedPosts.map((post) => (
            <div key={post.post_id} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '24px',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Reported
                    </span>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <Link
                      to={`/discussions/${post.DiscussionTopic.topic_id}`}
                      style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      <MessageSquare size={14} />
                      {post.DiscussionTopic.title}
                    </Link>
                    <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0 20px' }}>
                      Category: {post.DiscussionTopic.category}
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#999', fontSize: '13px', margin: '0 0 4px 0' }}>
                      Author: {post.Author.first_name} {post.Author.last_name} ({post.Author.email})
                    </p>
                    <p style={{ color: '#666', fontSize: '12px', margin: '0' }}>
                      Posted: {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
                      {post.content}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleUnreport(post.post_id)}
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
                        e.target.style.background = 'rgba(34, 197, 94, 0.25)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(34, 197, 94, 0.15)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <CheckCircle size={16} />
                      Keep Post
                    </button>

                    <button
                      onClick={() => handleDelete(post.post_id)}
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
                        e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <Trash2 size={16} />
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
