import { useState } from 'react';

interface Subject {
  id: number;
  name: string;
  type: 'chef' | 'delivery' | 'customer';
}

interface UniversalComplaintFormProps {
  subjects: Subject[];
  orderId?: number;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function UniversalComplaintForm({ subjects, orderId, onSubmit, onCancel }: UniversalComplaintFormProps) {
  const [complaintType, setComplaintType] = useState<'complaint' | 'compliment'>('complaint');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects.length === 1 ? subjects[0] : null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject_id: selectedSubject.id,
          subject_type: selectedSubject.type,
          complaint_type: complaintType,
          category,
          description,
          evidence_url: evidenceUrl || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit');
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '32px',
      backdropFilter: 'blur(4px)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3 style={{
        color: '#fff',
        fontSize: '20px',
        fontWeight: '600',
        marginTop: '0',
        marginBottom: '24px'
      }}>
        File a {complaintType === 'complaint' ? 'Complaint' : 'Compliment'}
      </h3>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

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
            Type
          </label>
          <select
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value as 'complaint' | 'compliment')}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="complaint" style={{ background: '#1e293b' }}>Complaint</option>
            <option value="compliment" style={{ background: '#1e293b' }}>Compliment</option>
          </select>
        </div>

        {subjects.length > 1 ? (
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
              About *
            </label>
            <select
              value={selectedSubject?.id || ''}
              onChange={(e) => {
                const subject = subjects.find(s => s.id === parseInt(e.target.value));
                setSelectedSubject(subject || null);
              }}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>Select a person...</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id} style={{ background: '#1e293b' }}>
                  {subject.name} ({subject.type})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#60a5fa', fontSize: '14px', margin: 0 }}>
              Filing {complaintType} about: <strong>{selectedSubject?.name}</strong> ({selectedSubject?.type})
              {orderId && ` from Order #${orderId}`}
            </p>
          </div>
        )}

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
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., quality, behavior, service_issue"
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
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the issue or praise in detail..."
            required
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
            Evidence URL (Optional)
          </label>
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://..."
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: loading ? '#666' : '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#999',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
