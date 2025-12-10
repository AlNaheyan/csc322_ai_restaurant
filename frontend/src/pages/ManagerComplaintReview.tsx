import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Complaint Review Dashboard</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No pending complaints to review
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.complaint_id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                complaint.is_vip_complaint ? 'border-yellow-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      complaint.complaint_type === 'complaint'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {complaint.complaint_type}
                    </span>
                    {complaint.is_vip_complaint && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        VIP
                      </span>
                    )}
                    {complaint.is_disputed && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        DISPUTED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Subject: {complaint.Subject.username} ({complaint.subject_type})
                  </p>
                  <p className="text-sm text-gray-600">
                    Filed by: {complaint.Filer.username}
                  </p>
                  {complaint.category && (
                    <p className="text-sm text-gray-600">Category: {complaint.category}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-gray-700">{complaint.description}</p>
              </div>

              {complaint.evidence_url && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Evidence:</h3>
                  <a
                    href={complaint.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {complaint.evidence_url}
                  </a>
                </div>
              )}

              {complaint.is_disputed && complaint.dispute_notes && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <h3 className="font-semibold mb-2 text-orange-800">Dispute Notes:</h3>
                  <p className="text-gray-700">{complaint.dispute_notes}</p>
                </div>
              )}

              {reviewingId === complaint.complaint_id ? (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as 'upheld' | 'dismissed')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="upheld">Uphold</option>
                      <option value="dismissed">Dismiss</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Provide your reasoning..."
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(complaint.complaint_id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => {
                        setReviewingId(null);
                        setNotes('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReviewingId(complaint.complaint_id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
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
