import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FiMessageSquare, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import LiveEngagementPanel from '../components/LiveEngagementPanel';
import SentimentPanel from '../components/SentimentPanel';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const teacherId = user?.id || user?._id;
  const [analytics, setAnalytics] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/analytics/teacher/${teacherId}`),
      api.get(`/feedback/${teacherId}?page=${page}&limit=5`),
      api.get(`/sentiment/${teacherId}`),
    ]).then(([aRes, fRes, sRes]) => {
      setAnalytics(aRes.data.data);
      setFeedbacks(fRes.data.feedbacks);
      setTotalPages(fRes.data.pages);
      setSentiment(sRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [teacherId, page]);

  if (loading) return <div className="loading">Loading...</div>;

  const radarData = analytics
    ? Object.entries(analytics.categoryAvgs).map(([k, v]) => ({
        category: k.charAt(0).toUpperCase() + k.slice(1), score: v, fullMark: 5,
      }))
    : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Dashboard</h2>
          <p className="subtitle">Welcome, {user.name}</p>
        </div>
        {analytics && (
          <div className="overall-badge large">{analytics.overallAvg}/5 Overall</div>
        )}
      </div>

      <div className="tab-bar">
        {['overview', 'live', 'sentiment', 'feedback'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'overview' && 'Overview'}
            {tab === 'live' && 'Live'}
            {tab === 'sentiment' && 'Sentiment'}
            {tab === 'feedback' && 'Feedback'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        !analytics ? (
          <div className="card empty-state">
            <FiMessageSquare size={40} />
            <p>No feedback received yet. Students will rate you after classes.</p>
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="card">
              <h3>Performance Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3>Rating Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card insights-card">
              <h3>Insights</h3>
              <div className="insights-grid">
                <div className="insight-section strengths">
                  <h4><FiTrendingUp /> Strengths</h4>
                  <ul>{analytics.strengths.map((s) => <li key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</li>)}</ul>
                </div>
                <div className="insight-section weaknesses">
                  <h4><FiTrendingDown /> Improve</h4>
                  <ul>{analytics.weaknesses.map((w) => <li key={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</li>)}</ul>
                </div>
              </div>
              <div className="suggestions">
                <h4>Suggestions</h4>
                <ul>{analytics.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === 'live' && <LiveEngagementPanel />}

      {activeTab === 'sentiment' && (
        <div>
          <p className="subtitle">
            AI-powered analysis of student comments - {sentiment?.total ?? 0} comments analyzed
          </p>
          <div className="analytics-grid">
            <SentimentPanel data={sentiment} />
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="card">
          <h3>Recent Feedback ({analytics?.totalFeedbacks ?? 0} total)</h3>
          {feedbacks.length === 0 ? (
            <p className="empty-state">No feedback yet.</p>
          ) : (
            <>
              <div className="feedback-list">
                {feedbacks.map((f) => (
                  <div key={f._id} className="feedback-item">
                    <div className="feedback-header">
                      <strong>{f.studentId?.name || 'Anonymous'}</strong>
                      <div className="inline-row">
                        {f.sentiment?.label && (
                          <span className={`sentiment-tag ${f.sentiment.label}`}>
                            {f.sentiment.label}
                          </span>
                        )}
                        <span className="rating-badge good">{f.overallRating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <p>{f.subject} - {f.semester}</p>
                    {f.comments && <p className="feedback-comment">"{f.comments}"</p>}
                    {f.sentiment?.keywords?.length > 0 && (
                      <div className="keyword-chips">
                        {f.sentiment.keywords.map((k) => <span key={k} className="keyword-chip">{k}</span>)}
                      </div>
                    )}
                    <small>{new Date(f.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Next</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
