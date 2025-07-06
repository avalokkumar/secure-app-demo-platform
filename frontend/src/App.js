import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import './styles/theme.css';
import './styles/achievements.css';

// Layout Components
import Layout from './components/layout/Layout';

// Authentication Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Content Pages
import Dashboard from './pages/Dashboard';
import ModulesList from './pages/modules/ModulesList';
import ModuleDetail from './pages/modules/ModuleDetail';
import LessonView from './pages/lessons/LessonView';
import ExerciseView from './pages/exercises/ExerciseView';
import SecurityTools from './pages/tools/SecurityTools';
import AchievementsPage from './pages/achievements/AchievementsPage';
import ApiDocs from './pages/docs/ApiDocs';

// Security Module Pages
import SQLInjectionModule from './pages/modules/sql-injection/SQLInjectionModule';
import XSSModule from './pages/modules/xss/XSSModule';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  // Initialize theme from localStorage on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="modules" element={<ModulesList />} />
        <Route path="modules/sql-injection" element={<SQLInjectionModule />} />
        <Route path="modules/xss" element={<XSSModule />} />
        <Route path="modules/:moduleId" element={<ModuleDetail />} />
        <Route path="lessons/:lessonId" element={<LessonView />} />
        <Route path="exercises/:exerciseId" element={<ExerciseView />} />
        <Route path="tools/security" element={<SecurityTools />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="api/docs" element={<ApiDocs />} />
      </Route>
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
