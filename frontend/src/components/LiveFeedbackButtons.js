import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const LiveFeedbackButtons = ({ teacherId, sessionId }) => {
  const { socket } = useSocket();
  const [lastResponse, setLastResponse] = useState(null);
  const [counts, setCounts] = useState({ understand: 0, confused: 0, total: 0 });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!teacherId || !sessionId) return;
    socket?.emit('join_session', { teacherId, sessionId });
    api.get(`/live/stats/${teacherId}/${sessionId}`).then((r) => setCounts(r.data)).catch(() => {});
  }, [teacherId, sessionId, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('engagement_update', (data) => {
      if (data.sessionId === sessionId) setCounts(data);
    });
    return () => socket.off('engagement_update');
  }, [socket, sessionId]);

  const sendResponse = async (response) => {
    if (!teacherId || !sessionId) return toast.error('Select a teacher and enter session ID first');
    setSending(true);
    try {
      const { data } = await api.post('/live/respond', { teacherId, sessionId, response });
      setLastResponse(response);
      setCounts(data);
      toast.success(response === 'understand' ? 'Response recorded: Understand' : 'Response recorded: Confused');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const understandPct = counts.total > 0 ? Math.round((counts.understand / counts.total) * 100) : 0;
  const confusedPct = counts.total > 0 ? Math.round((counts.confused / counts.total) * 100) : 0;

  return (
    <div className="live-feedback-box">
      <div className="live-header">
        <span className="live-dot" /> <strong>Live Class Feedback</strong>
      </div>

      <div className="live-buttons">
        <button
          onClick={() => sendResponse('understand')}
          disabled={sending}
          className={`live-btn understand ${lastResponse === 'understand' ? 'active' : ''}`}
        >
          I Understand
        </button>
        <button
          onClick={() => sendResponse('confused')}
          disabled={sending}
          className={`live-btn confused ${lastResponse === 'confused' ? 'active' : ''}`}
        >
          I am Confused
        </button>
      </div>

      {counts.total > 0 && (
        <div className="live-stats">
          <div className="live-bar-row">
            <span>Understand {counts.understand}</span>
            <div className="live-bar">
              <div className="live-bar-fill understand" style={{ width: `${understandPct}%` }} />
            </div>
            <span>{understandPct}%</span>
          </div>
          <div className="live-bar-row">
            <span>Confused {counts.confused}</span>
            <div className="live-bar">
              <div className="live-bar-fill confused" style={{ width: `${confusedPct}%` }} />
            </div>
            <span>{confusedPct}%</span>
          </div>
          <p className="live-total">{counts.total} student(s) responded</p>
        </div>
      )}
    </div>
  );
};

export default LiveFeedbackButtons;
