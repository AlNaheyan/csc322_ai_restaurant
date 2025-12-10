import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Warning {
  warning_id: number;
  warning_type: string;
  source: string;
  reason: string;
  issued_at: string;
  is_active: boolean;
}

export default function WarningDisplay() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/complaints/warnings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setWarnings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch warnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeWarnings = warnings.filter(w => w.is_active);

  if (loading || activeWarnings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className={`p-4 rounded-lg border-2 ${
        activeWarnings.length >= 3
          ? 'bg-red-100 border-red-500'
          : activeWarnings.length >= 2
          ? 'bg-orange-100 border-orange-500'
          : 'bg-yellow-100 border-yellow-500'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-6 h-6 ${
            activeWarnings.length >= 3
              ? 'text-red-600'
              : activeWarnings.length >= 2
              ? 'text-orange-600'
              : 'text-yellow-600'
          }`} />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">
              {activeWarnings.length >= 3
                ? 'CRITICAL: Account at Risk of Termination'
                : `You have ${activeWarnings.length} active warning${activeWarnings.length > 1 ? 's' : ''}`
              }
            </h3>
            {activeWarnings.length >= 3 && (
              <p className="text-sm mb-3 font-semibold">
                Your account may be terminated. Please contact support immediately.
              </p>
            )}
            <div className="space-y-2">
              {activeWarnings.map((warning) => (
                <div key={warning.warning_id} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">
                      {warning.warning_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(warning.issued_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{warning.reason}</p>
                  {warning.source && (
                    <p className="text-xs text-gray-500 mt-1">Source: {warning.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
