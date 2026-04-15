import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageSquare, FiBarChart2, FiStar, FiDownload } from 'react-icons/fi';
import SentimentPanel from '../components/SentimentPanel';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topTeachers, setTopTeachers] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overall'),
      api.get('/analytics/top-teachers'),
      api.get('/sentiment/overall'),
    ])
      .then(([analyticsRes, topRes, sentRes]) => {
        setStats(analyticsRes.data.data);
        setTopTeachers(topRes.data);
        setSentiment(sentRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv' ? 'feedback_report.csv' : 'analytics_report.pdf';
      a.click();
      toast.success('Export successful');
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p className="subtitle">{user?.institution} - Admin Dashboard</p>
        </div>
        <div className="header-actions">
          <button onClick={() => handleExport('csv')} className="btn-secondary">
            <FiDownload /> Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary">
            <FiDownload /> Export PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiUsers className="stat-icon blue" />
          <div>
            <h3>{stats?.totalTeachers ?? 0}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <FiMessageSquare className="stat-icon green" />
          <div>
            <h3>{stats?.totalFeedbacks ?? 0}</h3>
            <p>Total Feedbacks</p>
          </div>
        </div>
        <div className="stat-card">
          <FiStar className="stat-icon yellow" />
          <div>
            <h3>{stats?.overallAvg ?? 'N/A'}</h3>
            <p>Overall Avg Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <FiBarChart2 className="stat-icon purple" />
          <div>
            <h3>{stats?.categoryAvgs?.engagement ?? 'N/A'}</h3>
            <p>Avg Engagement</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Top Performing Teachers</h3>
          {topTeachers.length === 0 ? (
            <p className="empty-state">No data yet. Add teachers and collect feedback.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Teacher</th><th>Avg Rating</th><th>Feedbacks</th></tr>
              </thead>
              <tbody>
                {topTeachers.map((t, i) => (
                  <tr key={t.teacherId}>
                    <td>{i + 1}</td>
                    <td>
                      <Link to={`/analytics/teacher/${t.teacherId}`}>{t.teacher}</Link>
                    </td>
                    <td><span className={`rating-badge ${t.avg >= 4 ? 'good' : t.avg >= 3 ? 'avg' : 'poor'}`}>{t.avg}</span></td>
                    <td>{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/teachers/add" className="action-card">
              <FiUsers /> <span>Add Teacher</span>
            </Link>
            <Link to="/teachers" className="action-card">
              <FiUsers /> <span>Manage Teachers</span>
            </Link>
            <Link to="/analytics" className="action-card">
              <FiBarChart2 /> <span>View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="section-stack">
        <h3 className="sentiment-block-title">Institution Sentiment Overview</h3>
        <div className="analytics-grid">
          <SentimentPanel data={sentiment} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
