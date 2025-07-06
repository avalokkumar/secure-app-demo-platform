import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

/**
 * Dashboard Stats Component
 * 
 * Displays key metrics about user progress and available content 
 * 
 * @param {Object} props - Component props
 * @param {Array} props.moduleProgress - User's module progress data
 * @param {Object} props.stats - Additional statistics (totalModules, totalLessons, etc)
 */
const DashboardStats = ({ moduleProgress, stats = {} }) => {
  // Calculate statistics
  const calculateStats = () => {
    let completedLessons = 0;
    let totalLessons = 0;
    let completedExercises = 0;
    
    moduleProgress.forEach(item => {
      totalLessons += item.total_lessons || 0;
      completedLessons += item.completed_lessons || 0;
      // For exercises, we would typically get this from stats prop
    });
    
    return {
      totalModules: stats.totalModules || moduleProgress.length,
      inProgressModules: moduleProgress.filter(m => 
        m.completion_percentage > 0 && m.completion_percentage < 100
      ).length,
      completedModules: moduleProgress.filter(m => m.completion_percentage === 100).length,
      totalLessons: stats.totalLessons || totalLessons,
      completedLessons: stats.completedLessons || completedLessons,
      totalExercises: stats.totalExercises || 0,
      completedExercises: stats.completedExercises || completedExercises
    };
  };
  
  const calculatedStats = calculateStats();
  
  return (
    <Row className="mb-4">
      {/* Modules Stat Card */}
      <Col sm={6} xl={3} className="mb-3">
        <Card className="stat-card modules-stat h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon">
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </div>
            <div>
              <div className="stat-value">{calculatedStats.totalModules}</div>
              <div className="stat-label">Security Modules</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      {/* Lessons Stat Card */}
      <Col sm={6} xl={3} className="mb-3">
        <Card className="stat-card lessons-stat h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon">
              <i className="bi bi-journal-text"></i>
            </div>
            <div>
              <div className="stat-value">{calculatedStats.completedLessons}/{calculatedStats.totalLessons}</div>
              <div className="stat-label">Lessons Completed</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      {/* Exercises Stat Card */}
      <Col sm={6} xl={3} className="mb-3">
        <Card className="stat-card exercises-stat h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon">
              <i className="bi bi-code-square"></i>
            </div>
            <div>
              <div className="stat-value">{calculatedStats.completedExercises}/{calculatedStats.totalExercises}</div>
              <div className="stat-label">Exercises Completed</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      {/* Completed Modules Stat Card */}
      <Col sm={6} xl={3} className="mb-3">
        <Card className="stat-card completed-stat h-100">
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon">
              <i className="bi bi-check-circle"></i>
            </div>
            <div>
              <div className="stat-value">
                {calculatedStats.completedModules}/{calculatedStats.totalModules}
              </div>
              <div className="stat-label">Modules Completed</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;
