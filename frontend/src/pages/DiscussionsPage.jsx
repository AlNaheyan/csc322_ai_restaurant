import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { discussionApi } from '../services/discussionApi';

const DiscussionsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    category: 'general'
  });

  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTopics();
  }, [filter]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { category: filter } : {};
      const data = await discussionApi.getAllTopics(filters);
      setTopics(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const topic = await discussionApi.createTopic(newTopic);
      setShowNewTopicForm(false);
      setNewTopic({ title: '', category: 'general' });
      navigate(`/discussions/${topic.topic_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create topic');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      chef: 'background: #f97316; color: white;',
      dish: 'background: #4ade80; color: #0f172a;',
      delivery: 'background: #3b82f6; color: white;',
      general: 'background: #64748b; color: white;'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', color: '#cbd5e1' }}>Loading discussions...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff' }}>
            Community Discussions
          </h1>
          {isAuthenticated && ['customer', 'vip', 'chef', 'delivery'].includes(user?.role) && (
            <button
              onClick={() => setShowNewTopicForm(!showNewTopicForm)}
              style={{
                background: '#4ade80',
                color: '#0f172a',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#22c55e'}
              onMouseLeave={(e) => e.target.style.background = '#4ade80'}
            >
              {showNewTopicForm ? 'Cancel' : '+ New Topic'}
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {showNewTopicForm && (
          <div style={{ background: '#1e293b', padding: '32px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', marginBottom: '24px' }}>
              Create New Topic
            </h2>
            <form onSubmit={handleCreateTopic}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Category
                </label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="general">General</option>
                  <option value="chef">Chef</option>
                  <option value="dish">Dish</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="Enter topic title..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#4ade80',
                  color: '#0f172a',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Topic
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['all', 'general', 'chef', 'dish', 'delivery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                background: filter === cat ? '#4ade80' : '#334155',
                color: filter === cat ? '#0f172a' : '#cbd5e1',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {topics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem' }}>No discussions yet. Be the first to start one!</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.topic_id}
                onClick={() => navigate(`/discussions/${topic.topic_id}`)}
                style={{
                  background: '#1e293b',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2d3b4f';
                  e.currentTarget.style.borderColor = '#4ade80';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.borderColor = '#334155';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      ...Object.fromEntries(getCategoryColor(topic.category).split(';').map(s => s.trim().split(':').map(p => p.trim())))
                    }}
                  >
                    {topic.category}
                  </span>
                  {topic.is_locked && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#7f1d1d',
                      color: '#fca5a5'
                    }}>
                      🔒 Locked
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                  {topic.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#94a3b8' }}>
                  <span>By {topic.Creator?.first_name} {topic.Creator?.last_name}</span>
                  <span>•</span>
                  <span>{topic.post_count} {topic.post_count === 1 ? 'reply' : 'replies'}</span>
                  <span>•</span>
                  <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionsPage;
