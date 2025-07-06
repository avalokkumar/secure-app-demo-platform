import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import SQLInjectionService from '../../../services/SQLInjectionService';

const SQLProfileDemo = ({ setupComplete }) => {
  const [userId, setUserId] = useState('1');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bio.trim()) {
      setError('Please enter a bio update');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SQLInjectionService.updateProfile(
        userId,
        { bio },
        activeTab
      );
      setResult(response);
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message || 'Unknown error occurred'}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // If database setup is not complete, show a message
  if (!setupComplete) {
    return (
      <Alert variant="warning">
        Please set up the demo database first.
      </Alert>
    );
  }

  return (
    <div>
      <h3>Data Modification Demo</h3>
      <p>
        SQL injection in profile update forms can allow attackers to modify data they shouldn't 
        have access to. Try using SQL injection to modify other users' profiles!
      </p>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col md={12}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="vulnerable">Vulnerable Implementation</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="secure">Secure Implementation</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Tab.Content>
              <Tab.Pane eventKey="vulnerable">
                <Card className="mb-4">
                  <Card.Header className="bg-danger text-white">
                    <strong>Vulnerable Implementation</strong>
                    <p className="mb-0 small">
                      This implementation directly concatenates user input into SQL UPDATE statements
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try entering: <code>test', role='admin' WHERE id='2</code> to change user 2's role to admin.
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnUserId">
                        <Form.Label>User ID:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="Your user ID"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="vulnBio">
                        <Form.Label>Update Bio:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Enter your new bio"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "UPDATE users SET bio = '" + bio + "' WHERE id = " + userId;`}
                        </code>
                      </pre>
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="secure">
                <Card className="mb-4">
                  <Card.Header className="bg-success text-white">
                    <strong>Secure Implementation</strong>
                    <p className="mb-0 small">
                      This implementation uses parameterized queries to prevent SQL injection
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same SQL injection and see if it works.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureUserId">
                        <Form.Label>User ID:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="Your user ID"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="secureBio">
                        <Form.Label>Update Bio:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Enter your new bio"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "UPDATE users SET bio = ? WHERE id = ?";
const statement = connection.prepareStatement(query);
statement.setString(1, bio);
statement.setInt(2, userId);`}
                        </code>
                      </pre>
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Results display */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {result && (
        <Card className="mt-3 mb-4">
          <Card.Header>Update Results</Card.Header>
          <Card.Body>
            <pre className="mb-0">
              <code>{JSON.stringify(result, null, 2)}</code>
            </pre>
          </Card.Body>
          {result.query && (
            <Card.Footer className="bg-light">
              <small><strong>Query executed:</strong> {result.query}</small>
            </Card.Footer>
          )}
        </Card>
      )}
      
      <h4 className="mt-4">How It Works</h4>
      <p>
        In the vulnerable implementation, user input is directly concatenated into the SQL query string.
        When you enter <code>test', role='admin' WHERE id='2</code> as the bio, the resulting query becomes:
      </p>
      <pre>
        <code>{`UPDATE users SET bio = 'test', role='admin' WHERE id='2' WHERE id = 1`}</code>
      </pre>
      <p>
        This malicious input changes the query structure to update multiple columns instead of just the bio.
        It also changes the WHERE clause to target user ID 2 instead of the current user's ID (1).
        This allows an attacker to modify data they shouldn't have access to, including sensitive fields like role.
      </p>
      
      <p>
        In the secure implementation, parameterized queries are used. The database treats the
        input as data rather than executable code, preventing SQL injection attacks.
      </p>
      
      <Alert variant="danger" className="mt-3">
        <strong>Real-world Impact</strong>
        <p className="mb-0">
          SQL injection in update statements can lead to privilege escalation (changing user roles),
          data tampering, and even complete database destruction using commands like DROP TABLE.
        </p>
      </Alert>
    </div>
  );
};

export default SQLProfileDemo;
