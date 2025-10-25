import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { instancesAPI, analysisAPI } from '../services/api';
import './RunAnalysis.css';

interface ServiceNowInstance {
  id: string;
  name: string;
  url: string;
  status: string;
}

const RunAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstanceId = searchParams.get('instance');

  const [instances, setInstances] = useState<ServiceNowInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState(preselectedInstanceId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingInstances, setLoadingInstances] = useState(true);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoadingInstances(true);
      const response = await instancesAPI.getAll();
      console.log('RunAnalysis - instances response:', response);

      // Handle response data properly - axios returns data directly in response.data
      const instancesData = Array.isArray(response) ? response : (response?.data || []);
      const activeInstances = instancesData.filter(
        (inst: ServiceNowInstance) => inst.status === 'active'
      );
      setInstances(activeInstances);

      if (activeInstances.length === 0) {
        setError('No active ServiceNow instances found. Please add one first.');
      }
    } catch (err: any) {
      console.error('Error fetching instances:', err);
      setError('Failed to load instances. Please try again.');
      setInstances([]); // Set empty array on error
    } finally {
      setLoadingInstances(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstanceId) {
      setError('Please select a ServiceNow instance');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for the analysis');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const analysisData = {
        title,
        description,
        instance_id: selectedInstanceId,
        analysis_type: analysisType,
      };

      const response = await analysisAPI.create(analysisData);
      alert('Analysis started successfully! This may take a few minutes.');
      navigate(`/analysis/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to start analysis:', err);
      setError(err.response?.data?.detail || 'Failed to start analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInstances) {
    return (
      <div className="run-analysis-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="run-analysis-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/analysis')} className="btn-back">
              ← Back to Analyses
            </button>
            <h1>Run New Analysis</h1>
            <p>Start AI-powered GRC analysis on your ServiceNow data</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-content">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="analysis-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Select Instance */}
            <section className="form-section">
              <h2>Select ServiceNow Instance</h2>

              {instances.length === 0 ? (
                <div className="no-instances">
                  <p>No active ServiceNow instances found.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/instances/new')}
                    className="btn-secondary"
                  >
                    ➕ Add Instance
                  </button>
                </div>
              ) : (
                <div className="instance-selector">
                  {instances.map((instance) => (
                    <label key={instance.id} className="instance-option">
                      <input
                        type="radio"
                        name="instance"
                        value={instance.id}
                        checked={selectedInstanceId === instance.id}
                        onChange={(e) => setSelectedInstanceId(e.target.value)}
                      />
                      <div className="instance-info">
                        <span className="instance-name">{instance.name}</span>
                        <span className="instance-url">{instance.url}</span>
                      </div>
                      <span className="radio-check">✓</span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Analysis Details */}
            <section className="form-section">
              <h2>Analysis Details</h2>

              <div className="form-group">
                <label htmlFor="title">Analysis Title *</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q4 2024 Compliance Review"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this analysis..."
                  rows={3}
                />
              </div>
            </section>

            {/* Analysis Type */}
            <section className="form-section">
              <h2>Analysis Type</h2>

              <div className="analysis-type-selector">
                <label className="analysis-type-option">
                  <input
                    type="radio"
                    name="analysisType"
                    value="comprehensive"
                    checked={analysisType === 'comprehensive'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">🎯</span>
                    <div className="type-info">
                      <span className="type-name">Comprehensive Analysis</span>
                      <span className="type-desc">
                        Full GRC assessment covering all aspects
                      </span>
                    </div>
                  </div>
                  <span className="radio-check">✓</span>
                </label>

                <label className="analysis-type-option">
                  <input
                    type="radio"
                    name="analysisType"
                    value="risk"
                    checked={analysisType === 'risk'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">⚠️</span>
                    <div className="type-info">
                      <span className="type-name">Risk Analysis</span>
                      <span className="type-desc">Focus on risk assessment and mitigation</span>
                    </div>
                  </div>
                  <span className="radio-check">✓</span>
                </label>

                <label className="analysis-type-option">
                  <input
                    type="radio"
                    name="analysisType"
                    value="compliance"
                    checked={analysisType === 'compliance'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">✅</span>
                    <div className="type-info">
                      <span className="type-name">Compliance Check</span>
                      <span className="type-desc">Verify compliance with standards</span>
                    </div>
                  </div>
                  <span className="radio-check">✓</span>
                </label>

                <label className="analysis-type-option">
                  <input
                    type="radio"
                    name="analysisType"
                    value="control"
                    checked={analysisType === 'control'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">🛡️</span>
                    <div className="type-info">
                      <span className="type-name">Control Effectiveness</span>
                      <span className="type-desc">Evaluate control implementation</span>
                    </div>
                  </div>
                  <span className="radio-check">✓</span>
                </label>
              </div>
            </section>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/analysis')}
                className="btn-cancel"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading || instances.length === 0}
              >
                {loading ? 'Starting Analysis...' : '🚀 Start Analysis'}
              </button>
            </div>
          </form>

          {/* Info Sidebar */}
          <aside className="info-sidebar">
            <h3>What to Expect</h3>

            <div className="info-section">
              <h4>Analysis Duration</h4>
              <p>Typical analysis takes 5-15 minutes depending on data size.</p>
            </div>

            <div className="info-section">
              <h4>AI-Powered Insights</h4>
              <p>Our AI analyzes your GRC data to identify:</p>
              <ul>
                <li>Risk patterns and trends</li>
                <li>Compliance gaps</li>
                <li>Control weaknesses</li>
                <li>Recommended actions</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>Real-time Updates</h4>
              <p>
                You'll receive notifications as the analysis progresses. You can navigate away
                and return later.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RunAnalysis;
