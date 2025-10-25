import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { instancesAPI, analysisAPI } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalInstances: number;
  activeInstances: number;
  totalAnalyses: number;
  recentAnalyses: number;
  complianceScore: number;
  pendingItems: number;
}

interface RecentActivity {
  id: string;
  type: 'instance' | 'analysis' | 'sync';
  title: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    activeInstances: 0,
    totalAnalyses: 0,
    recentAnalyses: 0,
    complianceScore: 0,
    pendingItems: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch instances
      const instancesResponse = await instancesAPI.getAll();
      const instances = instancesResponse.data;

      // Fetch analyses
      const analysesResponse = await analysisAPI.getAll();
      const analyses = analysesResponse.data;

      // Calculate stats
      const activeInstances = instances.filter((i: any) => i.status === 'active').length;
      const recentAnalyses = analyses.filter((a: any) => {
        const analysisDate = new Date(a.created_at);
        const daysSince = (Date.now() - analysisDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      }).length;

      // Mock compliance score (will be calculated from actual data later)
      const complianceScore = analyses.length > 0 ? 85 : 0;

      setStats({
        totalInstances: instances.length,
        activeInstances,
        totalAnalyses: analyses.length,
        recentAnalyses,
        complianceScore,
        pendingItems: 0, // Will be calculated from actual data
      });

      // Build recent activity (simplified)
      const activities: RecentActivity[] = [
        ...instances.slice(0, 3).map((inst: any) => ({
          id: inst.id,
          type: 'instance' as const,
          title: `ServiceNow instance "${inst.name}" connected`,
          timestamp: inst.created_at,
          status: 'success' as const,
        })),
        ...analyses.slice(0, 3).map((analysis: any) => ({
          id: analysis.id,
          type: 'analysis' as const,
          title: `Analysis "${analysis.title}" completed`,
          timestamp: analysis.created_at,
          status: analysis.status === 'completed' ? 'success' as const : 'warning' as const,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(activities);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'instance': return '🔗';
      case 'analysis': return '📊';
      case 'sync': return '🔄';
      default: return '📌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>ComplianceIQ</h1>
            <p>GRC AI Analysis Platform</p>
          </div>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        )}

        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h2>
          <p>Here's what's happening with your GRC compliance platform.</p>
        </section>

        {/* Stats Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>🔗</div>
            <div className="stat-details">
              <h3>{stats.totalInstances}</h3>
              <p>ServiceNow Instances</p>
              <small>{stats.activeInstances} active</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ddd6fe' }}>📊</div>
            <div className="stat-details">
              <h3>{stats.totalAnalyses}</h3>
              <p>Total Analyses</p>
              <small>{stats.recentAnalyses} this week</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
            <div className="stat-details">
              <h3>{stats.complianceScore}%</h3>
              <p>Compliance Score</p>
              <small>{stats.complianceScore >= 80 ? 'Good standing' : 'Needs attention'}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⚠️</div>
            <div className="stat-details">
              <h3>{stats.pendingItems}</h3>
              <p>Pending Items</p>
              <small>Action required</small>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button
              className="action-card"
              onClick={() => navigate('/instances/new')}
            >
              <span className="action-icon">➕</span>
              <span className="action-title">Add ServiceNow Instance</span>
              <span className="action-desc">Connect a new instance</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/analysis/new')}
            >
              <span className="action-icon">🚀</span>
              <span className="action-title">Run Analysis</span>
              <span className="action-desc">Start AI-powered analysis</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/instances')}
            >
              <span className="action-icon">📋</span>
              <span className="action-title">View Instances</span>
              <span className="action-desc">Manage connections</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/analysis')}
            >
              <span className="action-icon">📈</span>
              <span className="action-title">View Reports</span>
              <span className="action-desc">See analysis results</span>
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>No recent activity</p>
              <small>Add a ServiceNow instance to get started</small>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                  <div className="activity-details">
                    <p className="activity-title">{activity.title}</p>
                    <small className="activity-time">{formatDate(activity.timestamp)}</small>
                  </div>
                  <span
                    className="activity-status"
                    style={{ backgroundColor: getStatusColor(activity.status) }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
