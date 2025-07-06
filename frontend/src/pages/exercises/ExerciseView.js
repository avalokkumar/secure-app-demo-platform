import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Spinner,
  Form,
  Tab,
  Nav
} from 'react-bootstrap';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useAuth } from '../../context/AuthContext';
import ExerciseService from '../../services/ExerciseService';

const ExerciseView = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch exercise data
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch exercise details
        const exerciseData = await ExerciseService.getExerciseById(exerciseId);
        setExercise(exerciseData.exercise);
        setSubmissions(exerciseData.submissions || []);
        
        // Set initial code if provided in exercise
        if (exerciseData.exercise.initial_code) {
          setCode(exerciseData.exercise.initial_code);
        } else {
          // Set default code based on language
          const language = exerciseData.exercise.sandbox_config?.language || 'python';
          setCode(getInitialCodeTemplate(language));
        }
      } catch (err) {
        console.error('Error fetching exercise data:', err);
        setError('Failed to load exercise. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (exerciseId && currentUser) {
      fetchExerciseData();
    }
  }, [exerciseId, currentUser]);

  // Submit code solution
  const handleSubmitCode = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setResult(null);
      
      // Submit code to the backend
      const response = await ExerciseService.submitExerciseSolution(exerciseId, { code });
      
      // Update submissions list
      setSubmissions([response.submission, ...submissions]);
      
      // Set result
      setResult({
        success: response.submission.is_successful,
        feedback: response.submission.feedback,
        executionTime: response.submission.execution_time
      });
      
      // If successful and this is part of a lesson, maybe mark the lesson as completed
      if (response.submission.is_successful && exercise.lesson_id) {
        // This would be handled by the backend when the submission is successful
      }
    } catch (err) {
      console.error('Error submitting code:', err);
      setError('Failed to submit your solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading exercise...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!exercise) {
    return <Alert variant="warning">Exercise not found or you don't have access to it.</Alert>;
  }

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(`/lessons/${exercise.lesson_id}`)}
        >
          &larr; Back to Lesson
        </Button>
      </div>
      
      <h2 className="mb-3">{exercise.title}</h2>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="mb-4">
            <Card.Header>Instructions</Card.Header>
            <Card.Body>
              <p>{exercise.description}</p>
              
              {exercise.instructions && (
                <div className="mt-3">
                  <h5>Task</h5>
                  <p>{exercise.instructions}</p>
                </div>
              )}
              
              {exercise.success_criteria && (
                <div className="mt-3">
                  <h5>Success Criteria</h5>
                  <p>{exercise.success_criteria}</p>
                </div>
              )}
              
              {exercise.hints && (
                <div className="mt-4 border-top pt-3">
                  <details>
                    <summary className="fw-bold text-primary mb-2" style={{ cursor: 'pointer' }}>
                      Hint
                    </summary>
                    <p>{exercise.hints}</p>
                  </details>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>Results</Card.Header>
            <Card.Body>
              {isSubmitting ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Running your code...</span>
                </div>
              ) : result ? (
                <div>
                  <Alert variant={result.success ? 'success' : 'danger'}>
                    <strong>{result.success ? 'Success!' : 'Not quite right.'}</strong>
                    <p className="mb-0">{result.feedback}</p>
                  </Alert>
                  
                  <div className="d-flex justify-content-between align-items-center text-muted small">
                    <span>Execution time: {result.executionTime.toFixed(2)}s</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">Submit your code to see the results.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Code Editor</h5>
              <div className="text-muted small">
                Language: {exercise.sandbox_config?.language || 'python'}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Form.Control
                as="textarea"
                rows={15}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="border-0 rounded-0 font-monospace"
                style={{ resize: 'vertical' }}
              />
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="primary" 
                onClick={handleSubmitCode}
                disabled={isSubmitting || !code.trim()}
                className="w-100"
              >
                {isSubmitting ? 'Running...' : 'Run Code'}
              </Button>
            </Card.Footer>
          </Card>
          
          {submissions.length > 0 && (
            <Card className="mt-4">
              <Card.Header>Previous Submissions</Card.Header>
              <Tab.Container defaultActiveKey="last">
                <Card.Body>
                  <Nav variant="pills" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="last">Latest</Nav.Link>
                    </Nav.Item>
                    {submissions.length > 1 && submissions.some(s => s.is_successful) && (
                      <Nav.Item>
                        <Nav.Link eventKey="successful">Successful</Nav.Link>
                      </Nav.Item>
                    )}
                  </Nav>
                  
                  <Tab.Content>
                    <Tab.Pane eventKey="last">
                      <div className="mb-2 d-flex justify-content-between">
                        <span className={submissions[0].is_successful ? "text-success" : "text-danger"}>
                          {submissions[0].is_successful ? "✓ Success" : "✗ Failed"}
                        </span>
                        <small className="text-muted">
                          Submitted {formatDate(submissions[0].created_at)}
                        </small>
                      </div>
                      
                      <SyntaxHighlighter 
                        language={exercise.sandbox_config?.language || 'python'}
                        style={docco}
                        customStyle={{
                          fontSize: '0.9rem',
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}
                      >
                        {submissions[0].submitted_code}
                      </SyntaxHighlighter>
                      
                      {submissions[0].feedback && (
                        <Alert variant={submissions[0].is_successful ? "success" : "danger"} className="mb-0 mt-2">
                          {submissions[0].feedback}
                        </Alert>
                      )}
                    </Tab.Pane>
                    
                    <Tab.Pane eventKey="successful">
                      {submissions.some(s => s.is_successful) ? (
                        <>
                          {(() => {
                            const successfulSubmission = submissions.find(s => s.is_successful);
                            return (
                              <>
                                <div className="mb-2 d-flex justify-content-between">
                                  <span className="text-success">✓ Success</span>
                                  <small className="text-muted">
                                    Submitted {formatDate(successfulSubmission.created_at)}
                                  </small>
                                </div>
                                
                                <SyntaxHighlighter 
                                  language={exercise.sandbox_config?.language || 'python'}
                                  style={docco}
                                  customStyle={{
                                    fontSize: '0.9rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                  }}
                                >
                                  {successfulSubmission.submitted_code}
                                </SyntaxHighlighter>
                                
                                {successfulSubmission.feedback && (
                                  <Alert variant="success" className="mb-0 mt-2">
                                    {successfulSubmission.feedback}
                                  </Alert>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <p className="text-muted">No successful submissions yet.</p>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Tab.Container>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

// Helper function to get initial code template based on language
const getInitialCodeTemplate = (language) => {
  switch (language?.toLowerCase()) {
    case 'python':
      return '# Write your code here\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()';
    case 'javascript':
    case 'js':
      return '// Write your code here\n\nfunction main() {\n    console.log("Hello, World!");\n}\n\nmain();';
    case 'java':
      return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';
    case 'c':
      return '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}';
    case 'cpp':
    case 'c++':
      return '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}';
    default:
      return '# Write your code here\n';
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString();
};

export default ExerciseView;
