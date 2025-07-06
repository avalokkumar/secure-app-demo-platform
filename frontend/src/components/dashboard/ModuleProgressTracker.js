import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ModuleService from '../../services/ModuleService';
import ProgressService from '../../services/ProgressService';
import AchievementService from '../../services/AchievementService';
import { useAuth } from '../../context/AuthContext';
import './ModuleProgressTracker.css';

const ModuleProgressTracker = () => {
  const [modules, setModules] = useState([]);
  const [accessibleModules, setAccessibleModules] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();

  // Fetch all modules
  const fetchModules = useCallback(async () => {
    try {
      const response = await ModuleService.getModules();
      setModules(response.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules. Please try again later.');
    }
  }, []);

  // Fetch accessible modules for the current user
  const fetchAccessibleModules = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await AchievementService.getAccessibleModules();
      setAccessibleModules(response.modules || []);
    } catch (err) {
      console.error('Error fetching accessible modules:', err);
      setError('Failed to load module access information.');
    }
  }, [currentUser]);

  // Fetch user achievements
  const fetchAchievements = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await AchievementService.getUserAchievements(currentUser.id);
      setAchievements(response.achievements || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      // Don't set error state for achievements - they're not critical
    }
  }, [currentUser]);

  // Fetch module progress
  const fetchProgress = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const updatedModules = [...modules];
      
      for (let module of updatedModules) {
        try {
          const progressResponse = await ProgressService.getModuleProgress(currentUser.id, module.id);
          module.progress = progressResponse.progress || {
            completion_percentage: 0,
            completed_lessons: 0,
            total_lessons: module.lesson_count
          };
        } catch (progressErr) {
          console.error(`Error fetching progress for module ${module.id}:`, progressErr);
          // Set default progress
          module.progress = {
            completion_percentage: 0,
            completed_lessons: 0,
            total_lessons: module.lesson_count
          };
        }
      }
      
      setModules(updatedModules);
    } catch (err) {
      console.error('Error updating module progress:', err);
      setError('Failed to load module progress. Please try again later.');
    }
  }, [currentUser, modules]);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      await fetchModules();
      await fetchAccessibleModules();
      await fetchAchievements();
      
      setLoading(false);
    };
    
    loadData();
  }, [fetchModules, fetchAccessibleModules, fetchAchievements]);

  // Update progress after modules are loaded
  useEffect(() => {
    if (modules.length > 0 && currentUser) {
      fetchProgress();
    }
  }, [modules, currentUser, fetchProgress]);

  // Check if a module is accessible
  const isModuleAccessible = useCallback((moduleId) => {
    return accessibleModules.some(module => module.id === moduleId);
  }, [accessibleModules]);

  // Get achievement status for a module
  const getModuleAchievements = useCallback((moduleId) => {
    return achievements.filter(
      achievement => achievement.entity_type === 'module' && achievement.entity_id === moduleId
    );
  }, [achievements]);

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle starting a module
  const handleStartModule = async (moduleId) => {
    try {
      // Redirect to the first lesson of the module
      window.location.href = `/modules/${moduleId}`;
    } catch (err) {
      console.error('Error starting module:', err);
      setError('Failed to start module. Please try again.');
    }
  };

  // Render achievement badges
  const renderAchievementBadges = (moduleId) => {
    const moduleAchievements = getModuleAchievements(moduleId);
    
    return moduleAchievements.map((achievement, index) => (
      <Badge 
        key={achievement.id || index} 
        bg={achievement.achievement_type === 'module_completed' ? 'success' : 'info'}
        className="me-2 mb-2"
      >
        {achievement.achievement_type === 'module_completed' ? 'Completed' : 'Started'}
        {achievement.granted_at && ` (${formatDate(achievement.granted_at)})`}
      </Badge>
    ));
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading modules and progress...</p>
      </div>
    );
  }

  return (
    <div className="module-progress-tracker">
      <h2>Security Modules Progress</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}
      
      <Row className="mt-4">
        {modules.map((module) => (
          <Col key={module.id} lg={6} className="mb-4">
            <Card className={`module-card ${isModuleAccessible(module.id) ? '' : 'locked'}`}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{module.name}</h5>
                  <Badge bg={module.difficulty === 'beginner' ? 'success' : module.difficulty === 'intermediate' ? 'warning' : 'danger'}>
                    {module.difficulty}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <p>{module.description}</p>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small>Progress</small>
                    <small>
                      {module.progress ? `${module.progress.completed_lessons || 0}/${module.progress.total_lessons || module.lesson_count}` : `0/${module.lesson_count}`}
                    </small>
                  </div>
                  <ProgressBar 
                    now={module.progress ? module.progress.completion_percentage : 0}
                    variant={
                      (module.progress && module.progress.completion_percentage === 100) ? 'success' : 'primary'
                    }
                  />
                </div>
                
                {renderAchievementBadges(module.id)}
                
                <div className="mt-3">
                  {isModuleAccessible(module.id) ? (
                    <Button 
                      variant="primary" 
                      onClick={() => handleStartModule(module.id)}
                    >
                      {module.progress && module.progress.completed_lessons > 0 ? 'Continue' : 'Start'} Module
                    </Button>
                  ) : (
                    <div className="locked-message">
                      <i className="bi bi-lock-fill me-2"></i>
                      <span>Complete previous modules to unlock</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {modules.length === 0 && !loading && !error && (
        <Alert variant="info">
          No security modules found. Please check back later.
        </Alert>
      )}
    </div>
  );
};

export default ModuleProgressTracker;
