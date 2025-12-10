import { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import DisputeForm from '../components/DisputeForm';

interface Complaint {
  complaint_id: number;
  complaint_type: string;
  subject_type: string;
  category: string;
  description: string;
  evidence_url: string | null;
  status: string;
  manager_decision: string | null;
  manager_notes: string | null;
  is_vip_complaint: boolean;
  is_disputed: boolean;
  dispute_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  Filer: {
    user_id: number;
    username: string;
  };
  Subject: {
    user_id: number;
    username: string;
  };
  Resolver?: {
    user_id: number;
    username: string;
  };
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [receivedComplaints, setReceivedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'filed' | 'received'>('filed');
  const [disputingId, setDisputingId] = useState<number | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const [filedRes, receivedRes] = await Promise.all([
        fetch('http://localhost:3001/api/complaints/my?role=filer', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:3001/api/complaints/my?role=subject', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [filedData, receivedData] = await Promise.all([
        filedRes.json(),
        receivedRes.json()
      ]);

      if (filedRes.ok) setComplaints(filedData.data);
      if (receivedRes.ok) setReceivedComplaints(receivedData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = () => {
    setDisputingId(null);
    fetchComplaints();
  };

  const renderComplaint = (complaint: Complaint, isReceived: boolean) => (
    <div
      key={complaint.complaint_id}
      className="bg-white rounded-lg shadow-md p-6 mb-4"
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              complaint.status === 'resolved'
                ? 'bg-gray-100 text-gray-800'
                : complaint.status === 'under_review'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {complaint.status}
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
            {isReceived ? `Filed by: ${complaint.Filer.username}` : `Subject: ${complaint.Subject.username}`}
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

      {complaint.status === 'resolved' && complaint.manager_decision && (
        <div className={`p-4 rounded-lg mb-4 ${
          complaint.manager_decision === 'upheld'
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {complaint.manager_decision === 'upheld' ? (
              <CheckCircle className="w-5 h-5 text-red-600" />
            ) : (
              <XCircle className="w-5 h-5 text-green-600" />
            )}
            <h3 className="font-semibold">
              Manager Decision: {complaint.manager_decision.toUpperCase()}
            </h3>
          </div>
          {complaint.manager_notes && (
            <p className="text-sm text-gray-700">{complaint.manager_notes}</p>
          )}
          {complaint.Resolver && (
            <p className="text-xs text-gray-500 mt-2">
              Resolved by: {complaint.Resolver.username}
            </p>
          )}
        </div>
      )}

      {complaint.is_disputed && complaint.dispute_notes && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <h3 className="font-semibold mb-2 text-orange-800">Dispute Notes:</h3>
          <p className="text-sm text-gray-700">{complaint.dispute_notes}</p>
        </div>
      )}

      {isReceived &&
       complaint.status === 'resolved' &&
       complaint.manager_decision === 'upheld' &&
       !complaint.is_disputed &&
       disputingId !== complaint.complaint_id && (
        <button
          onClick={() => setDisputingId(complaint.complaint_id)}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
        >
          Dispute This Decision
        </button>
      )}

      {disputingId === complaint.complaint_id && (
        <div className="mt-4">
          <DisputeForm
            complaintId={complaint.complaint_id}
            onSubmit={handleDisputeSubmit}
            onCancel={() => setDisputingId(null)}
          />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Complaints & Compliments</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('filed')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'filed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Filed by Me ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'received'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Against Me ({receivedComplaints.length})
          </button>
        </div>
      </div>

      {activeTab === 'filed' ? (
        complaints.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            You haven't filed any complaints or compliments yet
          </div>
        ) : (
          complaints.map(complaint => renderComplaint(complaint, false))
        )
      ) : (
        receivedComplaints.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No complaints or compliments received
          </div>
        ) : (
          receivedComplaints.map(complaint => renderComplaint(complaint, true))
        )
      )}
    </div>
  );
}
