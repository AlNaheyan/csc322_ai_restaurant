import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { discussionApi } from '../services/discussionApi';

const TopicDetailPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const data = await discussionApi.getTopicById(topicId);
      setTopic(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setSubmitting(true);
      await discussionApi.createPost(topicId, newPost);
      setNewPost('');
      await fetchTopic();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockTopic = async () => {
    try {
      await discussionApi.lockTopic(topicId);
      await fetchTopic();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to lock topic');
    }
  };

  const handleUnlockTopic = async () => {
    try {
      await discussionApi.unlockTopic(topicId);
      await fetchTopic();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlock topic');
    }
  };

  const handleReportPost = async (postId) => {
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    try {
      await discussionApi.reportPost(postId, reportReason);
      setReportingPost(null);
      setReportReason('');
      alert('Post reported successfully. A manager will review it.');
      await fetchTopic();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report post');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', color: '#cbd5e1' }}>Loading...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '20px' }}>Topic not found</p>
          <button
            onClick={() => navigate('/discussions')}
            style={{
              background: '#4ade80',
              color: '#0f172a',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <button
          onClick={() => navigate('/discussions')}
          style={{
            background: '#334155',
            color: '#cbd5e1',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          ← Back to Discussions
        </button>

        {error && (
          <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#1e293b', padding: '32px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#64748b', color: 'white' }}>
              {topic.category}
            </span>
            {topic.is_locked && (
              <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#7f1d1d', color: '#fca5a5' }}>
                🔒 Locked
              </span>
            )}
            {user?.role === 'manager' && (
              <button
                onClick={topic.is_locked ? handleUnlockTopic : handleLockTopic}
                style={{
                  marginLeft: 'auto',
                  background: topic.is_locked ? '#4ade80' : '#7f1d1d',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {topic.is_locked ? 'Unlock' : 'Lock'} Topic
              </button>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
            {topic.title}
          </h1>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            Started by {topic.Creator?.first_name} {topic.Creator?.last_name} on {new Date(topic.created_at).toLocaleDateString()}
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
            {topic.DiscussionPosts?.length || 0} Replies
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topic.DiscussionPosts && topic.DiscussionPosts.length > 0 ? (
              topic.DiscussionPosts.map((post) => (
                <div
                  key={post.post_id}
                  style={{
                    background: '#1e293b',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #334155'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {post.Author?.first_name} {post.Author?.last_name}
                        <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: '#334155', color: '#cbd5e1' }}>
                          {post.Author?.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                    {isAuthenticated && user?.user_id !== post.author_id && (
                      <button
                        onClick={() => setReportingPost(post.post_id)}
                        style={{
                          background: 'transparent',
                          color: '#94a3b8',
                          border: '1px solid #334155',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Report
                      </button>
                    )}
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>
                    {post.content}
                  </p>
                  {post.is_reported && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#7f1d1d', borderRadius: '6px', fontSize: '13px', color: '#fca5a5' }}>
                      This post has been reported and is under review
                    </div>
                  )}

                  {reportingPost === post.post_id && (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', marginBottom: '8px' }}>
                        Reason for reporting:
                      </label>
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Explain why you're reporting this post..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          fontSize: '14px',
                          minHeight: '80px',
                          boxSizing: 'border-box',
                          marginBottom: '10px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleReportPost(post.post_id)}
                          style={{
                            background: '#7f1d1d',
                            color: '#fca5a5',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Submit Report
                        </button>
                        <button
                          onClick={() => {
                            setReportingPost(null);
                            setReportReason('');
                          }}
                          style={{
                            background: '#334155',
                            color: '#cbd5e1',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                No replies yet. Be the first to reply!
              </div>
            )}
          </div>
        </div>

        {isAuthenticated && ['customer', 'vip', 'chef', 'delivery'].includes(user?.role) && !topic.is_locked && (
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Post a Reply
            </h3>
            <form onSubmit={handleSubmitPost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write your reply..."
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '15px',
                  minHeight: '120px',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  resize: 'vertical'
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#334155' : '#4ade80',
                  color: submitting ? '#94a3b8' : '#0f172a',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        )}

        {!isAuthenticated && (
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
              Please log in to participate in this discussion
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#4ade80',
                color: '#0f172a',
                padding: '12px 28px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
          </div>
        )}

        {topic.is_locked && isAuthenticated && (
          <div style={{ background: '#7f1d1d', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#fca5a5' }}>
            🔒 This topic has been locked by a manager and cannot accept new replies
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
