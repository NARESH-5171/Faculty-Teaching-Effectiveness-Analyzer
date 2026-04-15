import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiBarChart2, FiBookOpen, FiShield, FiUsers } from 'react-icons/fi';

const roleOptions = [
  { value: 'student', label: 'Student', description: 'Submit feedback and track your entries.', icon: FiUsers },
  { value: 'teacher', label: 'Teacher', description: 'View your analytics and teaching dashboard.', icon: FiBookOpen },
  { value: 'admin', label: 'Admin', description: 'Manage teachers, analytics, and exports.', icon: FiShield },
];

const AuthPage = ({ mode }) => {
  const isLogin = mode === 'login';
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', institution: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const normalizedRouteRole = roleOptions.some((option) => option.value === routeRole) ? routeRole : 'student';

  useEffect(() => {
    if (isLogin) {
      setForm((current) => ({ ...current, role: normalizedRouteRole }));
    }
  }, [isLogin, normalizedRouteRole]);

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!isLogin && form.role === 'admin' && !form.institution.trim()) e.institution = 'Institution name required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      const redirectMap = { admin: '/dashboard', teacher: '/teacher-dashboard', student: '/feedback' };
      navigate(redirectMap[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiBarChart2 className="auth-logo-icon" />
          <h1>Faculty Analyzer</h1>
          <p>{isLogin ? `Sign in to the ${normalizedRouteRole} portal` : 'Create a new account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {isLogin && (
            <div className="form-group">
              <label>Portal</label>
              <div className="role-selector">
                {roleOptions.map(({ value, label, description, icon: Icon }) => (
                  <Link
                    key={value}
                    to={`/login/${value}`}
                    className={`role-option ${form.role === value ? 'active' : ''}`}
                  >
                    <span className="role-option-icon"><Icon /></span>
                    <span className="role-option-content">
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon">
                  <FiUser />
                  <input
                    type="text" placeholder="John Doe"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {roleOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {value === 'admin' ? `${label} (Institution)` : label}
                    </option>
                  ))}
                </select>
              </div>
              {form.role === 'admin' && (
                <div className="form-group">
                  <label>Institution Name</label>
                  <input
                    type="text" placeholder="University of..."
                    value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  />
                  {errors.institution && <span className="error">{errors.institution}</span>}
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <div className="input-icon">
              <FiMail />
              <input
                type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon">
              <FiLock />
              <input
                type="password" placeholder="Enter your password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? `Sign In as ${form.role.charAt(0).toUpperCase()}${form.role.slice(1)}` : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login/student'}>
            {isLogin ? 'Register' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
