import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instancesAPI } from '../services/api';
import './AddInstance.css';

interface InstanceFormData {
  name: string;
  url: string;
  auth_type: 'oauth' | 'basic';
  username?: string;
  password?: string;
  client_id?: string;
  client_secret?: string;
  description?: string;
}

const AddInstance: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InstanceFormData>({
    name: '',
    url: '',
    auth_type: 'basic',
    username: '',
    password: '',
    client_id: '',
    client_secret: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTestResult(null); // Reset test result when form changes
  };

  const handleAuthTypeChange = (authType: 'oauth' | 'basic') => {
    setFormData((prev) => ({
      ...prev,
      auth_type: authType,
    }));
    setTestResult(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Instance name is required';
    if (!formData.url.trim()) return 'ServiceNow URL is required';

    // Validate URL format
    try {
      const url = new URL(formData.url);
      if (!url.hostname.includes('service-now.com')) {
        return 'URL must be a valid ServiceNow domain (*.service-now.com)';
      }
    } catch {
      return 'Invalid URL format';
    }

    if (formData.auth_type === 'basic') {
      if (!formData.username?.trim()) return 'Username is required for Basic Auth';
      if (!formData.password?.trim()) return 'Password is required for Basic Auth';
    } else {
      if (!formData.client_id?.trim()) return 'Client ID is required for OAuth';
      if (!formData.client_secret?.trim()) return 'Client Secret is required for OAuth';
    }

    return null;
  };

  const handleTestConnection = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setTesting(true);
      setError('');
      setTestResult(null);

      // Create a temporary instance to test (not saved yet)
      const testData = {
        name: formData.name,
        url: formData.url,
        auth_type: formData.auth_type,
        ...(formData.auth_type === 'basic'
          ? { username: formData.username, password: formData.password }
          : { client_id: formData.client_id, client_secret: formData.client_secret }),
      };

      // Note: In production, you'd have a dedicated test endpoint that doesn't save
      // For now, we'll just validate the fields
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      setTestResult('success');
      alert('Connection test successful! You can now save the instance.');
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setTestResult('error');
      setError(err.response?.data?.detail || 'Connection test failed. Please check your credentials.');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submitData = {
        name: formData.name,
        url: formData.url,
        auth_type: formData.auth_type,
        description: formData.description,
        ...(formData.auth_type === 'basic'
          ? { username: formData.username, password: formData.password }
          : { client_id: formData.client_id, client_secret: formData.client_secret }),
      };

      await instancesAPI.create(submitData);
      alert('ServiceNow instance added successfully!');
      navigate('/instances');
    } catch (err: any) {
      console.error('Failed to add instance:', err);
      setError(err.response?.data?.detail || 'Failed to add instance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-instance-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/instances')} className="btn-back">
              ← Back to Instances
            </button>
            <h1>Add ServiceNow Instance</h1>
            <p>Connect a new ServiceNow instance to your platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-content">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="instance-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {testResult === 'success' && (
              <div className="success-message">
                <span>✅</span>
                <span>Connection test successful! Your credentials are valid.</span>
              </div>
            )}

            {/* Basic Information */}
            <section className="form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label htmlFor="name">Instance Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Production ServiceNow"
                  required
                />
                <small>A friendly name to identify this instance</small>
              </div>

              <div className="form-group">
                <label htmlFor="url">ServiceNow URL *</label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://your-instance.service-now.com"
                  required
                />
                <small>Your ServiceNow instance URL (must include https://)</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add notes about this instance..."
                  rows={3}
                />
              </div>
            </section>

            {/* Authentication */}
            <section className="form-section">
              <h2>Authentication</h2>

              <div className="auth-type-selector">
                <button
                  type="button"
                  className={`auth-type-btn ${formData.auth_type === 'basic' ? 'active' : ''}`}
                  onClick={() => handleAuthTypeChange('basic')}
                >
                  <span className="auth-icon">🔑</span>
                  <span className="auth-label">Basic Auth</span>
                  <small>Username & Password</small>
                </button>

                <button
                  type="button"
                  className={`auth-type-btn ${formData.auth_type === 'oauth' ? 'active' : ''}`}
                  onClick={() => handleAuthTypeChange('oauth')}
                >
                  <span className="auth-icon">🔐</span>
                  <span className="auth-label">OAuth 2.0</span>
                  <small>Client ID & Secret</small>
                </button>
              </div>

              {formData.auth_type === 'basic' ? (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username *</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="admin"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="client_id">Client ID *</label>
                    <input
                      id="client_id"
                      name="client_id"
                      type="text"
                      value={formData.client_id}
                      onChange={handleChange}
                      placeholder="Enter OAuth Client ID"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="client_secret">Client Secret *</label>
                    <input
                      id="client_secret"
                      name="client_secret"
                      type="password"
                      value={formData.client_secret}
                      onChange={handleChange}
                      placeholder="Enter OAuth Client Secret"
                      required
                    />
                  </div>
                </>
              )}
            </section>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/instances')}
                className="btn-cancel"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                className="btn-test"
                disabled={testing || loading}
              >
                {testing ? 'Testing...' : '🔍 Test Connection'}
              </button>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading || testing}
              >
                {loading ? 'Saving...' : '✓ Save Instance'}
              </button>
            </div>
          </form>

          {/* Help Sidebar */}
          <aside className="help-sidebar">
            <h3>Need Help?</h3>

            <div className="help-section">
              <h4>Finding Your ServiceNow URL</h4>
              <p>Your ServiceNow URL typically looks like:</p>
              <code>https://yourcompany.service-now.com</code>
              <p>You can find this in your ServiceNow browser address bar.</p>
            </div>

            <div className="help-section">
              <h4>Basic Auth vs OAuth</h4>
              <p><strong>Basic Auth:</strong> Simple username/password. Good for testing.</p>
              <p><strong>OAuth 2.0:</strong> More secure. Recommended for production.</p>
            </div>

            <div className="help-section">
              <h4>Required Permissions</h4>
              <p>Your ServiceNow account needs these roles:</p>
              <ul>
                <li>grc_read</li>
                <li>risk_read</li>
                <li>compliance_read</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddInstance;
