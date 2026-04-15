import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AnalyticsPage = () => {
  const { teacherId } = useParams();
  const [data, setData] = useState(null);
  const [overall, setOverall] = useState(null);
  const [topTeachers, setTopTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      api.get(`/analytics/teacher/${teacherId}`)
        .then((res) => setData(res.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        api.get('/analytics/overall'),
        api.get('/analytics/top-teachers'),
      ]).then(([oRes, tRes]) => {
        setOverall(oRes.data.data);
        setTopTeachers(tRes.data);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [teacherId]);

  if (loading) return <div className="loading">Loading analytics...</div>;

  if (teacherId) {
    if (!data) return (
      <div className="page-container">
        <Link to="/analytics" className="back-link"><FiArrowLeft /> Back</Link>
        <div className="card empty-state"><p>No feedback data available for this teacher yet.</p></div>
      </div>
    );

    const radarData = Object.entries(data.categoryAvgs).map(([key, val]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      score: val,
      fullMark: 5,
    }));

    return (
      <div className="page-container">
        <Link to="/analytics" className="back-link"><FiArrowLeft /> Back to Analytics</Link>
        <div className="page-header">
          <h2>Teacher Analytics</h2>
          <div className="overall-badge">Overall: {data.overallAvg}/5</div>
        </div>

        <div className="analytics-grid">
          <div className="card">
            <h3>Category Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Rating Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.trend}>
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
                <ul>{data.strengths.map((s) => <li key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</li>)}</ul>
              </div>
              <div className="insight-section weaknesses">
                <h4><FiTrendingDown /> Areas to Improve</h4>
                <ul>{data.weaknesses.map((w) => <li key={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</li>)}</ul>
              </div>
            </div>
            <div className="suggestions">
              <h4>Suggestions</h4>
              <ul>{data.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <p className="feedback-count">Based on {data.totalFeedbacks} feedback(s)</p>
          </div>

          <div className="card">
            <h3>Category Scores</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={radarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  const categoryData = overall
    ? Object.entries(overall.categoryAvgs).map(([k, v]) => ({
        category: k.charAt(0).toUpperCase() + k.slice(1),
        avg: parseFloat(v),
      }))
    : [];

  return (
    <div className="page-container">
      <div className="page-header"><h2>Institution Analytics</h2></div>

      {!overall ? (
        <div className="card empty-state"><p>No analytics data yet. Add teachers and collect feedback.</p></div>
      ) : (
        <div className="analytics-grid">
          <div className="card">
            <h3>Category Averages</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Overall Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={overall.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Top Teachers Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topTeachers.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="teacher" width={100} />
                <Tooltip />
                <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card stats-summary">
            <h3>Summary</h3>
            <div className="summary-items">
              <div className="summary-item"><span>Total Teachers</span><strong>{overall.totalTeachers}</strong></div>
              <div className="summary-item"><span>Total Feedbacks</span><strong>{overall.totalFeedbacks}</strong></div>
              <div className="summary-item"><span>Overall Avg</span><strong>{overall.overallAvg}/5</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
