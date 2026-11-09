import { useState, useEffect } from 'react';
import { checkHealth } from './services/healthService';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-[#164B78] mb-2">
          AISYS Library Management System
        </h1>
        <p className="text-gray-500 mb-8">RFID-Enabled • Phase 1 Foundation</p>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-[#164B78]">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>Connecting to backend...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {health && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-semibold text-lg">✓ Backend Connected</p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>Status: <span className="font-medium text-green-600">{health.status}</span></p>
              <p>Database: <span className="font-medium text-green-600">{health.database}</span></p>
              <p>Version: <span className="font-medium">{health.version}</span></p>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-400">
          Frontend: React + Vite + Tailwind CSS • Backend: FastAPI + SQLAlchemy + SQLite
        </div>
      </div>
    </div>
  );
}

export default App;
