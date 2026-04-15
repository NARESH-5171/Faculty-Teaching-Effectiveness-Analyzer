import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#ef4444'];

const LiveEngagementPanel = () => {
  const { user } = useAuth();
  const teacherId = user?.id || user?._id;
  const { socket, connected } = useSocket();
  const [sessionId, setSessionId] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [counts, setCounts] = useState({ understand: 0, confused: 0, total: 0 });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!teacherId) return;
    api.get(`/live/sessions/${teacherId}`).then((r) => setSessions(r.data)).catch(() => {});
  }, [teacherId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('engagement_update', (data) => {
      if (data.sessionId === activeSession) setCounts(data);
    });
    return () => socket.off('engagement_update');
  }, [socket, activeSession]);

  const startSession = async () => {
    if (!sessionId.trim()) return;
    setActiveSession(sessionId);
    try {
      const { data } = await api.get(`/live/stats/${teacherId}/${sessionId}`);
      setCounts(data);
    } catch {
      setCounts({ understand: 0, confused: 0, total: 0 });
    }
  };

  const loadSession = async (sid) => {
    setSessionId(sid);
    setActiveSession(sid);
    const { data } = await api.get(`/live/stats/${teacherId}/${sid}`);
    setCounts(data);
  };

  const pieData = [
    { name: 'Understand', value: counts.understand },
    { name: 'Confused', value: counts.confused },
  ].filter((d) => d.value > 0);

  const understandPct = counts.total > 0 ? Math.round((counts.understand / counts.total) * 100) : 0;
  const comprehensionColor = understandPct >= 70 ? '#10b981' : understandPct >= 40 ? '#f59e0b' : '#ef4444';
  const comprehensionHint = understandPct >= 70
    ? 'Most students are following along.'
    : understandPct >= 40
      ? 'Some students need clarification.'
      : 'Many students are confused. Consider pausing and recapping.';

  return (
    <div className="card live-panel">
      <div className="live-panel-header">
        <h3>Live Engagement Monitor</h3>
        <span className={`socket-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="session-controls">
        <input
          type="text"
          placeholder="Enter Session ID (e.g. CS101-Week3)"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startSession()}
        />
        <button onClick={startSession} className="btn-primary">Monitor</button>
      </div>

      {sessions.length > 0 && (
        <div className="past-sessions">
          <p>Recent sessions:</p>
          <div className="session-chips">
            {sessions.map((s) => (
              <button key={s._id} onClick={() => loadSession(s._id)} className={`session-chip ${activeSession === s._id ? 'active' : ''}`}>
                {s._id}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSession && (
        <>
          <div className="live-counts">
            <div className="live-count-card understand">
              <span className="count-num">{counts.understand}</span>
              <span>Understand</span>
            </div>
            <div className="live-count-card confused">
              <span className="count-num">{counts.confused}</span>
              <span>Confused</span>
            </div>
            <div className="live-count-card total">
              <span className="count-num">{counts.total}</span>
              <span>Total</span>
            </div>
          </div>

          {counts.total > 0 && (
            <>
              <div className="comprehension-bar">
                <div className="comp-label">
                  <span>Comprehension Rate</span>
                  <strong>{understandPct}%</strong>
                </div>
                <div className="comp-track">
                  <div className="comp-fill" style={{ width: `${understandPct}%`, background: comprehensionColor }} />
                </div>
                <p className="comp-hint">{comprehensionHint}</p>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}

          {counts.total === 0 && (
            <p className="empty-state">
              Waiting for students to respond in session <strong>{activeSession}</strong>...
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default LiveEngagementPanel;
