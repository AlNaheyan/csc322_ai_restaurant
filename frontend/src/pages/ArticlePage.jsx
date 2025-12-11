import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { chatService } from '../services/chatService';

const ArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadArticle();
    loadComments();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const result = await chatService.getArticleById(articleId);
      setArticle(result.data);
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const result = await chatService.getArticleComments(articleId);
      setComments(result.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await chatService.createComment(articleId, newComment);
      setNewComment('');
      loadComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await chatService.updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      loadComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update comment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await chatService.deleteComment(commentId);
      loadComments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete comment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const canEditComment = (comment) => {
    if (!user || comment.user_id !== user.userId) return false;
    const hoursSinceCreation = (Date.now() - new Date(comment.created_at).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation <= 24;
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    return comment.user_id === user.userId || user.role === 'manager';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#242424', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #333',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error && !article) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#242424', padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#dc2626',
            color: '#fff',
            borderRadius: '8px'
          }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/chat')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#242424', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '6px 14px',
              backgroundColor: '#333',
              color: '#10b981',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {article.category}
            </span>
            {article.is_manager_approved && (
              <span style={{
                padding: '6px 14px',
                backgroundColor: '#10b981',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                ✓ Manager Approved
              </span>
            )}
          </div>

          <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '20px', lineHeight: '1.3' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', color: '#666', fontSize: '14px' }}>
            {article.Author && (
              <span>
                By {article.Author.first_name} {article.Author.last_name}
              </span>
            )}
            <span>Views: {article.view_count || 0}</span>
            <span>Helpful: {article.helpful_count || 0}</span>
            <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
          </div>

          <div style={{
            color: '#d0d0d0',
            fontSize: '16px',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap'
          }}>
            {article.content}
          </div>
        </div>

        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '20px' }}>
            Comments ({comments.length})
          </h2>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#dc2626',
              color: '#fff',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {isAuthenticated && article.is_manager_approved && (
            <form onSubmit={handleSubmitComment} style={{ marginBottom: '30px' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  padding: '10px 24px',
                  backgroundColor: submitting || !newComment.trim() ? '#666' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          {!isAuthenticated && (
            <div style={{
              padding: '16px',
              backgroundColor: '#333',
              borderRadius: '8px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>
                Please <a href="/login" style={{ color: '#10b981', textDecoration: 'underline' }}>login</a> to comment
              </p>
            </div>
          )}

          {!article.is_manager_approved && isAuthenticated && (
            <div style={{
              padding: '16px',
              backgroundColor: '#333',
              borderRadius: '8px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>
                Comments are disabled until this article is approved by a manager
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.comment_id}
                  style={{
                    backgroundColor: '#222',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: '500', fontSize: '15px' }}>
                        {comment.Author?.first_name} {comment.Author?.last_name}
                      </span>
                      <span style={{ color: '#666', fontSize: '13px', marginLeft: '10px' }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      {comment.is_edited && (
                        <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px', fontStyle: 'italic' }}>
                          (edited)
                        </span>
                      )}
                    </div>
                    {isAuthenticated && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canEditComment(comment) && editingComment !== comment.comment_id && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {editingComment === comment.comment_id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#333',
                          color: '#fff',
                          border: '1px solid #444',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateComment(comment.comment_id)}
                          disabled={submitting}
                          style={{
                            padding: '6px 16px',
                            backgroundColor: submitting ? '#666' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '6px 16px',
                            backgroundColor: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#d0d0d0', margin: 0, lineHeight: '1.6', fontSize: '14px' }}>
                      {comment.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ArticlePage;
