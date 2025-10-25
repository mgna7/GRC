import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import './AnalysisList.css';

interface Analysis {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  instance_id: string;
  instance_name?: string;
  created_at: string;
  completed_at?: string;
  progress?: number;
  error_message?: string;
}

const AnalysisList: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  useEffect(() => {
    fetchAnalyses();
    // Poll for updates every 5 seconds if there are running analyses
    const interval = setInterval(() => {
      if (analyses.some((a) => a.status === 'running' || a.status === 'pending')) {
        fetchAnalyses();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await analysisAPI.getAll();
      setAnalyses(response.data);
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      setError('Failed to load analyses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Pending', color: '#f59e0b', icon: '⏳' },
      running: { text: 'Running', color: '#3b82f6', icon: '▶️' },
      completed: { text: 'Completed', color: '#10b981', icon: '✅' },
      failed: { text: 'Failed', color: '#ef4444', icon: '❌' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : Date.now();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (filter === 'all') return true;
    return analysis.status === filter;
  });

  const statusCounts = {
    all: analyses.length,
    completed: analyses.filter((a) => a.status === 'completed').length,
    running: analyses.filter((a) => a.status === 'running' || a.status === 'pending').length,
    failed: analyses.filter((a) => a.status === 'failed').length,
  };

  if (loading && analyses.length === 0) {
    return (
      <div className="analysis-container">
        <div className="loading">Loading analyses...</div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <h1>Analysis Reports</h1>
            <p>View and manage your GRC analysis results</p>
          </div>
          <button onClick={() => navigate('/analysis/new')} className="btn-primary">
            🚀 Run New Analysis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-content">
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchAnalyses}>Retry</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Analyses
            <span className="count">{statusCounts.all}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
            <span className="count">{statusCounts.completed}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'running' ? 'active' : ''}`}
            onClick={() => setFilter('running')}
          >
            In Progress
            <span className="count">{statusCounts.running}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Failed
            <span className="count">{statusCounts.failed}</span>
          </button>
        </div>

        {/* Analysis List */}
        {filteredAnalyses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No {filter !== 'all' ? filter : ''} Analyses</h3>
            <p>
              {filter === 'all'
                ? 'Run your first analysis to get AI-powered GRC insights.'
                : `No ${filter} analyses found.`}
            </p>
            <button onClick={() => navigate('/analysis/new')} className="btn-primary">
              🚀 Run Your First Analysis
            </button>
          </div>
        ) : (
          <div className="analysis-grid">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="analysis-card">
                <div className="analysis-header">
                  <h3>{analysis.title}</h3>
                  {getStatusBadge(analysis.status)}
                </div>

                {analysis.description && (
                  <p className="analysis-description">{analysis.description}</p>
                )}

                <div className="analysis-details">
                  <div className="detail-row">
                    <span className="detail-icon">🔗</span>
                    <span className="detail-label">Instance:</span>
                    <span className="detail-value">
                      {analysis.instance_name || analysis.instance_id}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-label">Started:</span>
                    <span className="detail-value">{formatDate(analysis.created_at)}</span>
                  </div>

                  {analysis.completed_at && (
                    <div className="detail-row">
                      <span className="detail-icon">⏱️</span>
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">
                        {calculateDuration(analysis.created_at, analysis.completed_at)}
                      </span>
                    </div>
                  )}

                  {analysis.status === 'running' && analysis.progress !== undefined && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${analysis.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{analysis.progress}%</span>
                    </div>
                  )}

                  {analysis.status === 'failed' && analysis.error_message && (
                    <div className="error-details">
                      <span className="detail-icon">⚠️</span>
                      <span className="error-text">{analysis.error_message}</span>
                    </div>
                  )}
                </div>

                <div className="analysis-actions">
                  {analysis.status === 'completed' && (
                    <>
                      <button
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                        className="btn-view"
                      >
                        📈 View Results
                      </button>
                      <button className="btn-secondary">💾 Export</button>
                    </>
                  )}

                  {(analysis.status === 'running' || analysis.status === 'pending') && (
                    <button className="btn-secondary" disabled>
                      ⏳ Processing...
                    </button>
                  )}

                  {analysis.status === 'failed' && (
                    <button
                      onClick={() =>
                        navigate(`/analysis/new?retry=${analysis.id}`)
                      }
                      className="btn-secondary"
                    >
                      🔄 Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisList;
