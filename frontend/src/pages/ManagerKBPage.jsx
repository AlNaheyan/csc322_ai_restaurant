import { useState, useEffect } from 'react';
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
    <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage knowledge base articles
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'flagged'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Flagged Articles ({flaggedArticles.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Approval ({pendingArticles.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'flagged' ? (
          flaggedArticles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No flagged articles to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedArticles.map(article => (
              <div key={article.article_id} className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {article.flag_count} flag{article.flag_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    <span>Views: {article.view_count}</span>
                    <span className="mx-2">•</span>
                    <span>Helpful: {article.helpful_count}</span>
                    {article.Author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Author: {article.Author.first_name} {article.Author.last_name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUnflag(article.article_id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Unflag (Keep Article)
                    </button>
                    <button
                      onClick={() => handleDelete(article.article_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Article
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        ) : (
          pendingArticles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No pending articles to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingArticles.map(article => (
                <div key={article.article_id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {article.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Pending Approval
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {article.Author && (
                        <span>Author: {article.Author.first_name} {article.Author.last_name} ({article.Author.email})</span>
                      )}
                      <span className="mx-2">•</span>
                      <span>Submitted: {new Date(article.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(article.article_id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(article.article_id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
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
