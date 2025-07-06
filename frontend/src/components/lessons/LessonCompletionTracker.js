import React, { useState } from 'react';
import { Button, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProgressService from '../../services/ProgressService';
import AchievementService from '../../services/AchievementService';
import './LessonCompletionTracker.css';

/**
 * Component for tracking lesson completion and allowing users to mark lessons as completed.
 * This component handles updating progress, granting achievements, and navigation to the next lesson.
 */
const LessonCompletionTracker = ({ 
  lessonId, 
  moduleId, 
  isLessonCompleted = false, 
  hasNextLesson = false,
  nextLessonId = null,
  onProgressUpdated = () => {} 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
  /**
   * Mark the current lesson as completed
   */
  const handleMarkAsCompleted = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update lesson progress to 'completed'
      const progressResponse = await ProgressService.updateLessonProgress(lessonId, {
        status: 'completed'
      });
      
      console.log('Lesson marked as completed:', progressResponse);
      
      // Grant achievement for completing the lesson
      try {
        await AchievementService.grantAchievement({
          achievement_type: 'lesson_completed',
          entity_type: 'lesson',
          entity_id: lessonId
        });
        
        // Check if all lessons in the module are completed
        await AchievementService.grantAchievement({
          achievement_type: 'module_check',
          entity_type: 'module',
          entity_id: moduleId
        });
      } catch (achievementError) {
        console.error('Error granting achievement:', achievementError);
        // Non-critical error, don't show to user
      }
      
      setSuccess('Lesson completed! Your progress has been saved.');
      onProgressUpdated(true);
      
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      setError('Could not update your progress. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  /**
   * Navigate to the next lesson
   */
  const handleNextLesson = () => {
    if (nextLessonId) {
      navigate(`/lessons/${nextLessonId}`);
    }
  };
  
  return (
    <div className="lesson-completion-tracker">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <div className="progress-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Lesson Progress</h5>
          <span className={`badge bg-${isLessonCompleted ? 'success' : 'warning'}`}>
            {isLessonCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
        
        <ProgressBar 
          now={isLessonCompleted ? 100 : 50} 
          variant={isLessonCompleted ? 'success' : 'primary'}
          className="mb-3"
        />
        
        <div className="d-flex flex-column flex-md-row gap-2 justify-content-between">
          {!isLessonCompleted && (
            <Button 
              variant="primary" 
              onClick={handleMarkAsCompleted}
              disabled={isUpdating}
              className="flex-fill"
            >
              {isUpdating ? 'Updating...' : 'Mark as Completed'}
            </Button>
          )}
          
          {(isLessonCompleted && hasNextLesson) && (
            <Button 
              variant="outline-primary" 
              onClick={handleNextLesson}
              className="flex-fill"
            >
              Next Lesson
            </Button>
          )}
          
          {(isLessonCompleted && !hasNextLesson) && (
            <Button 
              variant="outline-success" 
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex-fill"
            >
              Back to Module
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCompletionTracker;
