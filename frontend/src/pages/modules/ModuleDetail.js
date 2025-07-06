import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Alert, 
  ProgressBar,
  ListGroup
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import ModuleService from '../../services/ModuleService';
import ProgressService from '../../services/ProgressService';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch module details
        const moduleData = await ModuleService.getModuleById(moduleId);
        setModule(moduleData.module);
        
        // Fetch lessons for this module
        const lessonsData = await ModuleService.getModuleLessons(moduleId);
        setLessons(lessonsData.items);
        
        // Fetch user progress for this module
        const progressData = await ProgressService.getModuleProgress(
          currentUser.id, 
          moduleId
        );
        setProgress(progressData.progress);
      } catch (err) {
        console.error('Error fetching module data:', err);
        setError('Failed to load module. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId && currentUser) {
      fetchModuleData();
    }
  }, [moduleId, currentUser]);

  const navigateToLesson = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading module details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (!module) {
    return (
      <Alert variant="warning">
        Module not found. It may have been removed or you don't have access to it.
      </Alert>
    );
  }

  // Calculate progress percentage
  const completedLessons = progress ? progress.completed_lessons : 0;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div>
      <Button 
        variant="outline-secondary" 
        className="mb-3"
        onClick={() => navigate('/modules')}
      >
        &larr; Back to Modules
      </Button>

      <div className="mb-4">
        <h2>{module.name}</h2>
        <div className="d-flex align-items-center mb-2">
          <Badge 
            bg={getBadgeColor(module.difficulty)}
            className="text-capitalize me-2"
          >
            {module.difficulty}
          </Badge>
          <span className="text-muted">{totalLessons} lessons</span>
        </div>
        <p>{module.description}</p>
      </div>

      {/* Progress bar */}
      <Card className="mb-4">
        <Card.Body>
          <h5>Your Progress</h5>
          <div className="d-flex justify-content-between mb-1">
            <span>Completion</span>
            <span>{completedLessons} of {totalLessons} lessons completed</span>
          </div>
          <ProgressBar 
            now={progressPercentage} 
            label={`${progressPercentage}%`}
            variant={progressPercentage === 100 ? 'success' : 'primary'} 
          />
        </Card.Body>
      </Card>

      {/* Lessons list */}
      <h4 className="mb-3">Lessons</h4>
      {lessons.length === 0 ? (
        <Alert variant="info">
          This module doesn't have any lessons yet. Check back later!
        </Alert>
      ) : (
        <ListGroup className="lessons-list">
          {lessons.map((lesson, index) => {
            // Find progress data for this lesson
            const lessonProgress = progress?.progress_details?.find(
              p => p.lesson_id === lesson.id
            );
            
            // Determine lesson status
            const isCompleted = lessonProgress?.status === 'completed';
            const isInProgress = lessonProgress?.status === 'in_progress';
            const isAvailable = index === 0 || lessons[index - 1].id in 
              (progress?.progress_details?.filter(p => p.status === 'completed')
                .map(p => p.lesson_id) || []);
            
            return (
              <ListGroup.Item 
                key={lesson.id}
                className="d-flex align-items-center"
              >
                <div className="lesson-number me-3">
                  {isCompleted ? (
                    <span className="lesson-completed">✓</span>
                  ) : (
                    <span className="lesson-number-circle">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-grow-1">
                  <h5 className="mb-1">{lesson.title}</h5>
                  <div className="d-flex align-items-center text-muted">
                    <span className="text-capitalize me-2">{lesson.content_type}</span>
                    {isCompleted && <Badge bg="success">Completed</Badge>}
                    {isInProgress && <Badge bg="info">In Progress</Badge>}
                  </div>
                </div>
                
                <Button
                  variant={isCompleted ? "outline-success" : "primary"}
                  onClick={() => navigateToLesson(lesson.id)}
                  disabled={!isAvailable && !isCompleted && !isInProgress}
                >
                  {isCompleted ? "Review" : isInProgress ? "Continue" : "Start"}
                </Button>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
};

// Helper function to get badge color based on difficulty
const getBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'danger';
    default:
      return 'primary';
  }
};

export default ModuleDetail;
