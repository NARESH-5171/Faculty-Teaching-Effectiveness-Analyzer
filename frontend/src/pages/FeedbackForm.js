import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
import LiveFeedbackButtons from '../components/LiveFeedbackButtons';

const categories = ['communication', 'clarity', 'engagement', 'knowledge', 'punctuality'];

const StarRating = ({ value, onChange, label }) => (
  <div className="star-rating-group">
    <label>{label}</label>
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className={`star ${n <= value ? 'filled' : ''}`}>
          <FiStar />
        </button>
      ))}
      <span className="rating-value">{value}/5</span>
    </div>
  </div>
);

const FeedbackForm = () => {
  const [teachers, setTeachers] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [form, setForm] = useState({
    teacherId: '',
    subject: '',
    semester: '',
    academicYear: '',
    comments: '',
    ratings: { communication: 3, clarity: 3, engagement: 3, knowledge: 3, punctuality: 3 },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/feedback/teachers').then((r) => setTeachers(r.data)).catch(() => {});
    api.get('/feedback/my').then((r) => setMyFeedbacks(r.data)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.teacherId) e.teacherId = 'Select a teacher';
    if (!form.subject.trim()) e.subject = 'Subject required';
    if (!form.semester.trim()) e.semester = 'Semester required';
    if (!form.academicYear.trim()) e.academicYear = 'Academic year required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await api.post('/feedback', form);
      toast.success('Feedback submitted! Sentiment analyzed automatically.');
      setForm({
        teacherId: '',
        subject: '',
        semester: '',
        academicYear: '',
        comments: '',
        ratings: { communication: 3, clarity: 3, engagement: 3, knowledge: 3, punctuality: 3 },
      });
      const r = await api.get('/feedback/my');
      setMyFeedbacks(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const setRating = (cat, val) =>
    setForm((f) => ({ ...f, ratings: { ...f.ratings, [cat]: val } }));

  return (
    <div className="page-container">
      <div className="page-header"><h2>Student Feedback</h2></div>

      <div className="tab-bar">
        <button onClick={() => setActiveTab('live')} className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}>Live Class</button>
        <button onClick={() => setActiveTab('form')} className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}>Submit Review</button>
        <button onClick={() => setActiveTab('history')} className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}>My History</button>
      </div>

      {activeTab === 'live' && (
        <div className="live-tab-layout">
          <div className="card">
            <h3>Join a Live Session</h3>
            <p className="subtitle">Ask your teacher for the session ID and select them below.</p>
            <div className="form-group">
              <label>Select Teacher</label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">-- Choose Teacher --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t.userId?._id}>{t.userId?.name} - {t.department}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Session ID</label>
              <input
                type="text"
                placeholder="e.g. CS101-Week3"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
            </div>
          </div>

          <LiveFeedbackButtons teacherId={form.teacherId} sessionId={sessionId} />
        </div>
      )}

      {activeTab === 'form' && (
        <div className="feedback-layout">
          <div className="card form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Teacher *</label>
                <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t.userId?._id}>{t.userId?.name} - {t.department}</option>
                  ))}
                </select>
                {errors.teacherId && <span className="error">{errors.teacherId}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" />
                  {errors.subject && <span className="error">{errors.subject}</span>}
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                    <option value="">Select</option>
                    {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.semester && <span className="error">{errors.semester}</span>}
                </div>
                <div className="form-group">
                  <label>Academic Year *</label>
                  <input type="text" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-25" />
                  {errors.academicYear && <span className="error">{errors.academicYear}</span>}
                </div>
              </div>

              <div className="ratings-section">
                <h4>Rate the Teacher</h4>
                {categories.map((cat) => (
                  <StarRating
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    value={form.ratings[cat]}
                    onChange={(v) => setRating(cat, v)}
                  />
                ))}
              </div>

              <div className="form-group">
                <label>Comments - AI Sentiment Analysis will run automatically</label>
                <textarea
                  rows={4}
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  placeholder="Share your experience... (e.g. 'The explanation was unclear and too fast')"
                  maxLength={1000}
                />
                <small>{form.comments.length}/1000</small>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit & Analyze Sentiment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3>My Submitted Feedbacks</h3>
          {myFeedbacks.length === 0 ? (
            <p className="empty-state">No feedbacks submitted yet.</p>
          ) : (
            <div className="feedback-list">
              {myFeedbacks.map((f) => (
                <div key={f._id} className="feedback-item">
                  <div className="feedback-header">
                    <strong>{f.teacherId?.name}</strong>
                    <div className="inline-row">
                      {f.sentiment?.label && (
                        <span className={`sentiment-tag ${f.sentiment.label}`}>
                          {f.sentiment.label}
                        </span>
                      )}
                      <span className="rating-badge good">Rating {f.overallRating?.toFixed(1)}</span>
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
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;
