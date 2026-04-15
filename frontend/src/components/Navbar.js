import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBarChart2, FiUsers, FiMessageSquare } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FiBarChart2 /> Faculty Analyzer
      </Link>
      <div className="navbar-links">
        {user?.role === 'admin' && (
          <>
            <Link to="/dashboard"><FiBarChart2 /> Dashboard</Link>
            <Link to="/teachers"><FiUsers /> Teachers</Link>
            <Link to="/analytics"><FiBarChart2 /> Analytics</Link>
          </>
        )}
        {user?.role === 'teacher' && (    
          <Link to="/teacher-dashboard"><FiUser /> My Dashboard</Link> 
        )}
        {user?.role === 'student' && (
          <Link to="/feedback"><FiMessageSquare /> Submit Feedback</Link>
        )}
      </div>
      <div className="navbar-right">
        <span className="user-name"><FiUser /> {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout"><FiLogOut /> Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
