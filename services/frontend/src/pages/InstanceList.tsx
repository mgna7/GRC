import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instancesAPI } from '../services/api';
import './InstanceList.css';

interface ServiceNowInstance {
  id: string;
  name: string;
  url: string;
  auth_type: 'oauth' | 'basic';
  status: 'active' | 'inactive' | 'error';
  last_sync: string | null;
  created_at: string;
  organization_id: string;
}

const InstanceList: React.FC = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ServiceNowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await instancesAPI.getAll();
      console.log('Instances API response:', response);
      // The API returns the array directly in response.data from axios
      const instancesData = Array.isArray(response) ? response : (response.data || []);
      setInstances(instancesData);
    } catch (err: any) {
      console.error('Error fetching instances:', err);

      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(
          '🔐 Authentication Error: Please log out and log back in. ' +
          'Your session may have expired or your account needs to be refreshed. ' +
          'Clear your browser cache (Ctrl+Shift+R) if the problem persists.'
        );
      } else {
        setError(err.response?.data?.detail || 'Failed to load ServiceNow instances. Please try again.');
      }

      setInstances([]); // Set empty array on error to prevent undefined
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (instanceId: string) => {
    try {
      setTesting(instanceId);
      setError('');
      await instancesAPI.testConnection(instanceId);
      alert('Connection test successful!');
      await fetchInstances(); // Refresh to get updated status
    } catch (err: any) {
      console.error('Connection test failed:', err);
      alert(`Connection test failed: ${err.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (instanceId: string) => {
    try {
      setSyncing(instanceId);
      setError('');
      await instancesAPI.sync(instanceId, {
        sync_type: 'manual'
      });
      alert('Data sync started successfully! This may take a few minutes.');
      await fetchInstances(); // Refresh to get updated status
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert(`Sync failed: ${err.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (instanceId: string, instanceName: string) => {
    if (!confirm(`Are you sure you want to delete "${instanceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await instancesAPI.delete(instanceId);
      alert('Instance deleted successfully!');
      await fetchInstances();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Delete failed: ${err.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Active', color: '#10b981' },
      inactive: { text: 'Inactive', color: '#6b7280' },
      error: { text: 'Error', color: '#ef4444' },
    };
    const badge = badges[status as keyof typeof badges] || badges.inactive;
    return (
      <span
        className="status-badge"
        style={{ backgroundColor: badge.color }}
      >
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getAuthTypeLabel = (authType: string) => {
    return authType === 'oauth' ? 'OAuth 2.0' : 'Basic Auth';
  };

  if (loading) {
    return (
      <div className="instances-container">
        <div className="loading">Loading instances...</div>
      </div>
    );
  }

  return (
    <div className="instances-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <h1>ServiceNow Instances</h1>
            <p>Manage your ServiceNow connections</p>
          </div>
          <button
            onClick={() => navigate('/instances/new')}
            className="btn-primary"
          >
            ➕ Add New Instance
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-content">
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchInstances}>Retry</button>
          </div>
        )}

        {!instances || instances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No ServiceNow Instances</h3>
            <p>Get started by connecting your first ServiceNow instance.</p>
            <button
              onClick={() => navigate('/instances/new')}
              className="btn-primary"
            >
              ➕ Add Your First Instance
            </button>
          </div>
        ) : (
          <div className="instances-grid">
            {instances.map((instance) => (
              <div key={instance.id} className="instance-card">
                <div className="instance-header">
                  <h3>{instance.name}</h3>
                  {getStatusBadge(instance.status)}
                </div>

                <div className="instance-details">
                  <div className="detail-row">
                    <span className="detail-label">URL:</span>
                    <a
                      href={instance.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-link"
                    >
                      {instance.url}
                    </a>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Auth Type:</span>
                    <span className="detail-value">{getAuthTypeLabel(instance.auth_type)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Last Sync:</span>
                    <span className="detail-value">{formatDate(instance.last_sync)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(instance.created_at)}</span>
                  </div>
                </div>

                <div className="instance-actions">
                  <button
                    onClick={() => handleTestConnection(instance.id)}
                    className="btn-secondary"
                    disabled={testing === instance.id}
                  >
                    {testing === instance.id ? 'Testing...' : '🔍 Test'}
                  </button>

                  <button
                    onClick={() => handleSync(instance.id)}
                    className="btn-secondary"
                    disabled={syncing === instance.id}
                  >
                    {syncing === instance.id ? 'Syncing...' : '🔄 Sync'}
                  </button>

                  <button
                    onClick={() => navigate(`/analysis/new?instance=${instance.id}`)}
                    className="btn-secondary"
                  >
                    📊 Analyze
                  </button>

                  <button
                    onClick={() => handleDelete(instance.id, instance.name)}
                    className="btn-danger"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstanceList;
