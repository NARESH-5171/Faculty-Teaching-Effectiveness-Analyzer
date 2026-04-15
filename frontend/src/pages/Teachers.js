import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBarChart2 } from 'react-icons/fi';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (department) params.department = department;
      const { data } = await api.get('/teachers', { params });
      setTeachers(data.teachers);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [page, department]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Teachers</h2>
        <Link to="/teachers/add" className="btn-primary"><FiPlus /> Add Teacher</Link>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-icon">
            <FiSearch />
            <input
              type="text" placeholder="Search by name or department..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="English">English</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : teachers.length === 0 ? (
        <div className="empty-state card">
          <p>No teachers found. <Link to="/teachers/add">Add your first teacher</Link></p>
        </div>
      ) : (
        <>
          <div className="teachers-grid">
            {teachers.map((t) => (
              <div key={t._id} className="teacher-card">
                <div className="teacher-avatar">{t.userId?.name?.[0]?.toUpperCase()}</div>
                <h4>{t.userId?.name}</h4>
                <p className="dept-badge">{t.department}</p>
                <p className="teacher-meta">{t.experience} yrs exp - {t.subjects?.join(', ')}</p>
                <div className="teacher-actions">
                  <Link to={`/analytics/teacher/${t.userId?._id}`} className="btn-icon" title="Analytics">
                    <FiBarChart2 />
                  </Link>
                  <Link to={`/teachers/edit/${t.userId?._id}`} className="btn-icon" title="Edit">
                    <FiEdit2 />
                  </Link>
                  <button onClick={() => handleDelete(t.userId?._id)} className="btn-icon danger" title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
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
  );
};

export default Teachers;
