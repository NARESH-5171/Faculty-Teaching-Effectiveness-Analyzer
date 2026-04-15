import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TeacherForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: '', subjects: '', experience: '', qualification: '', bio: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/teachers/${id}`).then(({ data }) => {
        setForm({
          name: data.userId?.name || '',
          email: data.userId?.email || '',
          password: '',
          department: data.department || '',
          subjects: data.subjects?.join(', ') || '',
          experience: data.experience || '',
          qualification: data.qualification || '',
          bio: data.bio || '',
        });
      }).catch(() => toast.error('Failed to load teacher'));
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!isEdit && !form.name.trim()) e.name = 'Name required';
    if (!isEdit && !form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (isEdit && !form.name.trim()) e.name = 'Name required';
    if (isEdit && form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.department.trim()) e.department = 'Department required';
    if (!form.subjects.trim()) e.subjects = 'At least one subject required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        experience: Number(form.experience),
      };
      if (isEdit) {
        await api.put(`/teachers/${id}`, payload);
        toast.success('Teacher updated');
      } else {
        await api.post('/teachers', payload);
        toast.success('Teacher added');
      }
      navigate('/teachers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</h2>
      </div>
      <div className="card form-card">
        <form onSubmit={handleSubmit} className="teacher-form">
          {!isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="teacher@school.edu" />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
            </div>
          )}
          {!isEdit && (
            <div className="form-group">
              <label>Password (default: Teacher@123)</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank for default" />
            </div>
          )}
          {isEdit && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Jane Smith"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}
          {isEdit && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select Department</option>
                {['Computer Science','Mathematics','Physics','Chemistry','English','Other'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <span className="error">{errors.department}</span>}
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="5" />
            </div>
          </div>
          <div className="form-group">
            <label>Subjects * (comma-separated)</label>
            <input type="text" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Data Structures, Algorithms, DBMS" />
            {errors.subjects && <span className="error">{errors.subjects}</span>}
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="Ph.D. Computer Science" />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Brief description..." />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/teachers')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
