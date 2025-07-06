import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModuleService from '../services/ModuleService';
import ProgressService from '../services/ProgressService';
import SecuritySkillsOverview from '../components/dashboard/SecuritySkillsOverview';
import DashboardStats from '../components/dashboard/DashboardStats';
import ModuleProgressTracker from '../components/dashboard/ModuleProgressTracker';

// Import dashboard styles
import '../styles/dashboard.css';

const Dashboard = () => {
  const [moduleProgress, setModuleProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user progress data
        const progressData = await ProgressService.getUserProgress(currentUser.id);
        setModuleProgress(progressData.progress);
      } catch (err) {
        console.error('Error fetching user progress:', err);
        setError('Failed to load your progress data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProgress();
    }
  }, [currentUser]);

  const handleContinueModule = (moduleId) => {
    navigate(`/modules/${moduleId}`);
  };

  const handleStartModule = (moduleId) => {
    navigate(`/modules/${moduleId}`);
  };
  
  // Helper function for badge color
  const getBadgeColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2>Welcome{currentUser?.first_name ? `, ${currentUser.first_name}` : ''}!</h2>
        <p className="text-muted">
          Track your progress and continue learning about web security vulnerabilities.
        </p>
      </div>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Dashboard Stats */}
      {!isLoading && moduleProgress.length > 0 && (
        <DashboardStats moduleProgress={moduleProgress} />
      )}
      
      {/* Security Skills Overview Widget */}
      {!isLoading && moduleProgress.length > 0 && (
        <section className="mb-5">
          <SecuritySkillsOverview moduleProgress={moduleProgress} />
        </section>
      )}

      <section className="mb-5">
        <h3 className="mb-4">Security Modules</h3>
        
        <Tabs defaultActiveKey="progress" id="dashboard-tabs" className="mb-4">
          {/* Progress Tracker Tab */}
          <Tab eventKey="progress" title="Module Progress">
            <ModuleProgressTracker />
          </Tab>
          
          {/* Your Modules Tab */}
          <Tab eventKey="modules" title="Your Active Modules">
            {isLoading ? (
              <p>Loading your progress...</p>
            ) : moduleProgress.length === 0 ? (
              <Alert variant="info">
                You haven't started any modules yet. Explore the Module Progress tab to begin learning.
              </Alert>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {moduleProgress.map((module) => (
                  <Col key={module.module.id}>
                    <Card className="h-100 module-progress-card">
                      <Card.Body>
                        <div className="mb-2">
                          <span className={`badge bg-${getBadgeColor(module.module.difficulty)}`}>
                            {module.module.difficulty}
                          </span>
                        </div>
                        <Card.Title>{module.module.name}</Card.Title>
                        <Card.Text className="text-muted small">
                          {module.total_lessons} lessons
                        </Card.Text>
                        
                        <div className="mt-2 mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Progress</small>
                            <small>
                              {module.completed_lessons} / {module.total_lessons} lessons
                            </small>
                          </div>
                          <ProgressBar 
                            now={module.completion_percentage} 
                            variant={module.completion_percentage === 100 ? 'success' : 'primary'} 
                          />
                        </div>
                        
                        <div className="d-grid gap-2">
                          {module.completion_percentage > 0 ? (
                            <Button 
                              variant="primary" 
                              onClick={() => handleContinueModule(module.module.id)}
                            >
                              Continue Learning
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-primary" 
                              onClick={() => handleStartModule(module.module.id)}
                            >
                              Start Module
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      </section>
    </div>
  );
};

export default Dashboard;
