import { useState, useEffect } from 'react';
import { Flag, CheckCircle, Eye, ThumbsUp, User, Calendar, XCircle } from 'lucide-react';
import { chatService } from '../services/chatService';

const ManagerKBPage = () => {
  const [activeTab, setActiveTab] = useState('flagged');
  const [flaggedArticles, setFlaggedArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'flagged') {
      fetchFlaggedArticles();
    } else {
      fetchPendingArticles();
    }
  }, [activeTab]);

  const fetchFlaggedArticles = async () => {
    try {
      setLoading(true);
      const result = await chatService.getFlaggedArticles();
      setFlaggedArticles(result.data);
    } catch (err) {
      setError('Failed to load flagged articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      setLoading(true);
      const result = await chatService.getPendingArticles();
      setPendingArticles(result.data);
    } catch (err) {
      setError('Failed to load pending articles');
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async (articleId) => {
    try {
      await chatService.unflagArticle(articleId);
      setSuccessMessage('Article unflagged successfully');
      fetchFlaggedArticles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to unflag article');
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      await chatService.deleteArticle(articleId);
      setSuccessMessage('Article deleted successfully');
      if (activeTab === 'flagged') {
        fetchFlaggedArticles();
      } else {
        fetchPendingArticles();
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete article');
    }
  };

  const handleApprove = async (articleId) => {
    try {
      setError('');
      await chatService.approveArticle(articleId);
      setSuccessMessage('Article approved successfully');
      await fetchPendingArticles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to approve article');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (articleId) => {
    if (!window.confirm('Are you sure you want to reject this article? This will mark it as inactive.')) {
      return;
    }

    try {
      setError('');
      await chatService.rejectArticle(articleId);
      setSuccessMessage('Article rejected successfully');
      await fetchPendingArticles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to reject article');
      setTimeout(() => setError(''), 3000);
    }
  };

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
          Knowledge Base Management
        </h1>
        <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
          Review and manage knowledge base articles
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('flagged')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
            background: activeTab === 'flagged'
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'rgba(255, 255, 255, 0.06)',
            color: activeTab === 'flagged' ? '#fff' : '#999'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'flagged') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'flagged') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }
          }}
        >
          Flagged Articles ({flaggedArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
            background: activeTab === 'pending'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'rgba(255, 255, 255, 0.06)',
            color: activeTab === 'pending' ? '#fff' : '#999'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pending') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pending') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }
          }}
        >
          Pending Approval ({pendingArticles.length})
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

      {successMessage && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          color: '#999'
        }}>
          Loading...
        </div>
      ) : activeTab === 'flagged' ? (
        flaggedArticles.length === 0 ? (
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
              No flagged articles to review
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {flaggedArticles.map(article => (
              <div key={article.article_id} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderLeft: '4px solid #ef4444',
                padding: '24px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {article.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {article.category}
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    <Flag size={14} />
                    {article.flag_count} flag{article.flag_count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' }}>
                    {article.content}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} />
                      {article.view_count} views
                    </span>
                    <span style={{ color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsUp size={14} />
                      {article.helpful_count} helpful
                    </span>
                    {article.Author && (
                      <span style={{ color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {article.Author.first_name} {article.Author.last_name}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleUnflag(article.article_id)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
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
                      Unflag
                    </button>
                    <button
                      onClick={() => handleDelete(article.article_id)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
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
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        pendingArticles.length === 0 ? (
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
              No pending articles to review
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingArticles.map(article => (
              <div key={article.article_id} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderLeft: '4px solid #3b82f6',
                padding: '24px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {article.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {article.category}
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Pending Approval
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' }}>
                    {article.content}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {article.Author && (
                      <span style={{ color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {article.Author.first_name} {article.Author.last_name}
                      </span>
                    )}
                    <span style={{ color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(article.article_id)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
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
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(article.article_id)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
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
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ManagerKBPage;
