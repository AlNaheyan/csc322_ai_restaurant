import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

const ContributeKBPage = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [myArticles, setMyArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    if (activeTab === 'my-articles') {
      fetchMyArticles();
    }
  }, [activeTab]);

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      const result = await chatService.getMyArticles();
      setMyArticles(result.data);
    } catch (err) {
      setError('Failed to load your articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      if (editingArticle) {
        await chatService.updateArticle(editingArticle.article_id, formData);
        setSuccessMessage('Article updated successfully! Waiting for manager approval.');
      } else {
        await chatService.createArticle(formData);
        setSuccessMessage('Article submitted successfully! Waiting for manager approval.');
      }
      setFormData({ title: '', content: '', category: 'general' });
      setEditingArticle(null);
      if (activeTab === 'my-articles') {
        fetchMyArticles();
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit article');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category
    });
    setActiveTab('submit');
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setFormData({ title: '', content: '', category: 'general' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#242424', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#fff', fontSize: '36px', marginBottom: '10px' }}>
            Knowledge Base Contribution
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Share your knowledge with the community
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'submit' ? '#10b981' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Submit Article
          </button>
          <button
            onClick={() => setActiveTab('my-articles')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'my-articles' ? '#10b981' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            My Articles
          </button>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#dc2626',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '16px',
            backgroundColor: '#10b981',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {activeTab === 'submit' && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>
              {editingArticle ? 'Edit Article' : 'Submit New Article'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="general">General</option>
                  <option value="menu">Menu</option>
                  <option value="delivery">Delivery</option>
                  <option value="payment">Payment</option>
                  <option value="policy">Policy</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter article title"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your article content here..."
                  rows="12"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: loading ? '#666' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Submitting...' : (editingArticle ? 'Update Article' : 'Submit Article')}
                </button>
                {editingArticle && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#666',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'my-articles' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{
                  display: 'inline-block',
                  width: '50px',
                  height: '50px',
                  border: '4px solid #333',
                  borderTop: '4px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : myArticles.length === 0 ? (
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '60px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <p style={{ color: '#a0a0a0', fontSize: '18px' }}>
                  You haven't submitted any articles yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {myArticles.map(article => (
                  <div
                    key={article.article_id}
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '1px solid #333'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
                          {article.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: '#333',
                            color: '#10b981',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {article.category}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: article.is_manager_approved ? '#10b981' : '#f59e0b',
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {article.is_manager_approved ? 'Approved' : 'Pending Approval'}
                          </span>
                          {!article.is_active && (
                            <span style={{
                              padding: '4px 12px',
                              backgroundColor: '#dc2626',
                              color: '#fff',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p style={{ color: '#a0a0a0', marginBottom: '16px', lineHeight: '1.6' }}>
                      {article.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #333' }}>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        <span>Views: {article.view_count || 0}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>Helpful: {article.helpful_count || 0}</span>
                        {article.flag_count > 0 && (
                          <>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span style={{ color: '#dc2626' }}>Flags: {article.flag_count}</span>
                          </>
                        )}
                      </div>

                      {!article.is_manager_approved && article.is_active && (
                        <button
                          onClick={() => handleEdit(article)}
                          style={{
                            padding: '8px 20px',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

export default ContributeKBPage;
