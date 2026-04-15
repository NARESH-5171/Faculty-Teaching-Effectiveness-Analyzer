import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import TeacherForm from './pages/TeacherForm';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackForm from './pages/FeedbackForm';
import TeacherDashboard from './pages/TeacherDashboard';
import './App.css';

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Navigate to="/login/student" replace />} />
        <Route path="/login/:role" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/teachers" element={
          <ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>
        } />
        <Route path="/teachers/add" element={
          <ProtectedRoute roles={['admin']}><TeacherForm mode="add" /></ProtectedRoute>
        } />
        <Route path="/teachers/edit/:id" element={
          <ProtectedRoute roles={['admin']}><TeacherForm mode="edit" /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>
        } />
        <Route path="/analytics/teacher/:teacherId" element={
          <ProtectedRoute roles={['admin', 'teacher']}><AnalyticsPage /></ProtectedRoute>
        } />
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute roles={['student']}><FeedbackForm /></ProtectedRoute>
        } />

        <Route
          path="/"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/dashboard' : user.role === 'teacher' ? '/teacher-dashboard' : '/feedback'} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/unauthorized"
          element={<div className="page-container"><div className="card empty-state"><h3>403 - Access Denied</h3></div></div>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
