import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import SQLInjectionService from '../../../services/SQLInjectionService';

const SQLLoginDemo = ({ setupComplete }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle login attempt
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SQLInjectionService.attemptLogin(
        username, 
        password, 
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
      <h3>Authentication Bypass Demo</h3>
      <p>
        SQL injection in login forms can allow attackers to bypass authentication without
        knowing valid credentials. Try using SQL injection to log in as admin without the password!
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
                      This implementation directly concatenates user input into SQL queries
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering: <code>admin' --</code> as the username with any password.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnUsername">
                        <Form.Label>Username:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="vulnPassword">
                        <Form.Label>Password:</Form.Label>
                        <Form.Control 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";`}
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
                    <p>Try entering the same SQL injection: <code>admin' --</code> as the username with any password.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureUsername">
                        <Form.Label>Username:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="securePassword">
                        <Form.Label>Password:</Form.Label>
                        <Form.Control 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT * FROM users WHERE username = ? AND password = ?";
const statement = connection.prepareStatement(query);
statement.setString(1, username);
statement.setString(2, password);`}
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
          <Card.Header>Results</Card.Header>
          <Card.Body>
            <pre className="mb-0">
              <code>{JSON.stringify(result, null, 2)}</code>
            </pre>
          </Card.Body>
        </Card>
      )}
      
      <h4 className="mt-4">How It Works</h4>
      <p>
        In the vulnerable implementation, user input is directly concatenated into the SQL query string.
        When you enter <code>admin' --</code> as the username, the resulting query becomes:
      </p>
      <pre>
        <code>{`SELECT * FROM users WHERE username = 'admin' --' AND password = 'anything'`}</code>
      </pre>
      <p>
        The <code>--</code> is a SQL comment that causes everything after it to be ignored.
        This effectively changes the query to only check if the username is 'admin', bypassing
        the password check entirely.
      </p>
      
      <p>
        In the secure implementation, parameterized queries are used. The database treats the
        input as data rather than executable code, preventing SQL injection attacks.
      </p>
    </div>
  );
};

export default SQLLoginDemo;
