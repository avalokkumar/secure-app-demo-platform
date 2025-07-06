import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import LessonService from '../../services/LessonService';
import ProgressService from '../../services/ProgressService';
import CodeSnippetDisplay from '../../components/lessons/CodeSnippetDisplay';

const LessonView = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch lesson details
        const lessonData = await LessonService.getLessonById(lessonId);
        setLesson(lessonData.lesson);
        
        // If this is a lesson with code snippets, fetch them
        if (lessonData.lesson.content_type === 'theory') {
          const snippetsData = await LessonService.getLessonCodeSnippets(lessonId);
          setCodeSnippets(snippetsData.code_snippets || []);
        }
        
        // Mark lesson as in progress if not already completed
        const progressUpdate = await ProgressService.updateLessonProgress(lessonId, {
          status: 'in_progress'
        });
        setUserProgress(progressUpdate.progress);
        
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId && currentUser) {
      fetchLessonData();
    }
  }, [lessonId, currentUser]);

  // Handle navigation to next lesson
  const handleNextLesson = async () => {
    try {
      // Get next lesson ID from the current module
      if (!lesson || !lesson.module_id) return;
      
      const moduleLessons = await LessonService.getModuleLessons(lesson.module_id);
      
      // Find current lesson index
      const currentIndex = moduleLessons.items.findIndex(l => l.id === lesson.id);
      
      // If there's a next lesson, navigate to it
      if (currentIndex >= 0 && currentIndex < moduleLessons.items.length - 1) {
        const nextLesson = moduleLessons.items[currentIndex + 1];
        navigate(`/lessons/${nextLesson.id}`);
      } else {
        // If this was the last lesson, go back to module view
        navigate(`/modules/${lesson.module_id}`);
      }
    } catch (err) {
      console.error('Error navigating to next lesson:', err);
    }
  };

  // Handle marking lesson as complete
  const handleCompleteLesson = async () => {
    try {
      setIsUpdatingProgress(true);
      
      // Update lesson progress to completed
      const progressUpdate = await ProgressService.updateLessonProgress(lessonId, {
        status: 'completed'
      });
      
      setUserProgress(progressUpdate.progress);
      
      // If this is an exercise lesson with an associated exercise, navigate to it
      if (lesson.content_type === 'exercise' && lesson.exercise_id) {
        navigate(`/exercises/${lesson.exercise_id}`);
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      setError('Failed to update progress. Please try again.');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!lesson) {
    return <Alert variant="warning">Lesson not found or you don't have access to it.</Alert>;
  }

  // Parse lesson content based on its type
  const renderLessonContent = () => {
    if (lesson.content_type === 'theory' || lesson.content_type === 'exercise') {
      try {
        const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
        
        // Check if content is in the expected format
        if (content && content.blocks) {
          return (
            <div className="lesson-content">
              {content.blocks.map((block, index) => {
                if (block.type === 'paragraph' || !block.type) {
                  return <ReactMarkdown key={index}>{block.text}</ReactMarkdown>;
                } else if (block.type === 'heading') {
                  const HeadingTag = `h${block.level || 3}`;
                  return <HeadingTag key={index}>{block.text}</HeadingTag>;
                } else if (block.type === 'code') {
                  return (
                    <pre key={index} className="bg-light p-3 rounded">
                      <code>{block.text}</code>
                    </pre>
                  );
                } else if (block.type === 'image' && block.url) {
                  return <img key={index} src={block.url} alt={block.alt || ''} className="img-fluid my-3" />;
                }
                return <ReactMarkdown key={index}>{block.text}</ReactMarkdown>;
              })}
            </div>
          );
        } else {
          // Fallback to simple content display
          return <ReactMarkdown>{lesson.content}</ReactMarkdown>;
        }
      } catch (e) {
        console.error('Error parsing lesson content:', e);
        // Fallback to displaying raw content
        return <ReactMarkdown>{lesson.content}</ReactMarkdown>;
      }
    }
    
    return <p className="text-muted">No content available for this lesson type.</p>;
  };

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(`/modules/${lesson.module_id}`)}
        >
          &larr; Back to Module
        </Button>
        
        {userProgress?.status === 'completed' ? (
          <span className="badge bg-success py-2 px-3">Completed</span>
        ) : (
          <Button
            variant="success"
            onClick={handleCompleteLesson}
            disabled={isUpdatingProgress}
          >
            {isUpdatingProgress ? 'Updating...' : 'Mark as Complete'}
          </Button>
        )}
      </div>
      
      <h2 className="mb-3">{lesson.title}</h2>
      
      {lesson.description && (
        <p className="text-muted mb-4">{lesson.description}</p>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          {renderLessonContent()}
        </Card.Body>
      </Card>
      
      {/* Code snippets section */}
      {codeSnippets.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-3">Code Examples</h3>
          {codeSnippets.map(snippet => (
            <CodeSnippetDisplay key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
      
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant={userProgress?.status === 'completed' ? 'primary' : 'outline-primary'}
          onClick={handleNextLesson}
        >
          {userProgress?.status === 'completed' ? 'Next Lesson' : 'Skip to Next Lesson'}
        </Button>
        
        {userProgress?.status !== 'completed' && (
          <Button
            variant="success"
            onClick={handleCompleteLesson}
            disabled={isUpdatingProgress}
          >
            {isUpdatingProgress ? 'Updating...' : 'Mark as Complete'}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default LessonView;
