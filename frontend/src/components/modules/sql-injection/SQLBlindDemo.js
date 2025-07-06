import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import SQLInjectionService from '../../../services/SQLInjectionService';

const SQLBlindDemo = ({ setupComplete }) => {
  const [query, setQuery] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle blind SQL injection test
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a test condition');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SQLInjectionService.blindTest(
        query, 
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
      <h3>Blind SQL Injection Demo</h3>
      <p>
        In a blind SQL injection attack, the attacker doesn't get direct feedback about 
        the query results. Instead, they must infer information based on the application's 
        behavior or response time. This demo simulates a feature that returns "true" or "false" 
        based on a condition.
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
                      This implementation directly concatenates user input into a condition check
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try these injections:
                    </p>
                    <ul>
                      <li><code>1=1</code> (Always true)</li>
                      <li><code>1=2</code> (Always false)</li>
                      <li><code>1=1 AND (SELECT COUNT(*) FROM users WHERE username='admin')=1</code> (Checks if admin user exists)</li>
                      <li><code>1=1 AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='a'</code> (Tries to guess first letter of admin's password)</li>
                    </ul>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnQuery">
                        <Form.Label>Test Condition:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter condition to test"
                        />
                        <Form.Text className="text-muted">
                          Enter a SQL condition that evaluates to true or false.
                        </Form.Text>
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Testing...' : 'Test Condition'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT CASE WHEN " + condition + " THEN 'true' ELSE 'false' END AS result";`}
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
                      This implementation uses parameterized queries and input validation
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same SQL injections and see if they work.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureQuery">
                        <Form.Label>Test Condition:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter condition to test"
                        />
                        <Form.Text className="text-muted">
                          Only simple numeric comparisons are allowed (e.g., '1=1', '5&gt;3').
                        </Form.Text>
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Testing...' : 'Test Condition'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Validate input using a strict pattern
const validPattern = /^[0-9\\s=<>!()+-]*$/;
if (!validPattern.test(condition)) {
  throw new Error('Invalid condition. Only simple numeric comparisons allowed.');
}

const result = eval(condition) ? 'true' : 'false';`}
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
          <Card.Header>Test Results</Card.Header>
          <Card.Body>
            {result.result === 'true' ? (
              <Alert variant="success" className="mb-0">The condition evaluated to <strong>TRUE</strong></Alert>
            ) : (
              <Alert variant="secondary" className="mb-0">The condition evaluated to <strong>FALSE</strong></Alert>
            )}
          </Card.Body>
          {result.query && (
            <Card.Footer className="bg-light">
              <small><strong>Query executed:</strong> {result.query}</small>
            </Card.Footer>
          )}
        </Card>
      )}
      
      <h4 className="mt-4">How Blind SQL Injection Works</h4>
      <p>
        Blind SQL injection occurs when an application is vulnerable to SQL injection but doesn't 
        directly display query results. Instead, attackers must use indirect methods to extract information:
      </p>
      
      <h5 className="mt-3">Boolean-Based (Content-Based)</h5>
      <p>
        In this approach, attackers craft SQL conditions that evaluate to TRUE or FALSE, then observe
        changes in the application's behavior. By asking a series of yes/no questions, they can systematically
        extract data one bit at a time.
      </p>
      <pre>
        <code>{`' OR (SELECT SUBSTRING(username, 1, 1) FROM users WHERE id=1) = 'a`}</code>
      </pre>
      
      <h5 className="mt-3">Time-Based</h5>
      <p>
        Here, attackers use SQL functions that introduce delays when a condition is true,
        then measure response times to infer information.
      </p>
      <pre>
        <code>{`' OR IF((SELECT COUNT(*) FROM users WHERE username='admin')=1, SLEEP(5), 0) -- `}</code>
      </pre>
      
      <Alert variant="info" className="mt-3">
        <strong>Real-World Impact</strong>
        <p className="mb-0">
          Blind SQL injection is particularly dangerous because it can be used to extract
          sensitive data even when direct data extraction is not possible. It's also harder to detect
          than regular SQL injection because error messages are often suppressed in production environments.
        </p>
      </Alert>
      
      <Alert variant="warning" className="mt-4">
        <strong>Defense in Depth</strong>
        <p className="mb-0">
          To protect against blind SQL injection, use the same defenses as regular SQL injection:
          parameterized queries, input validation, and least privilege principles. Additionally,
          consider implementing rate limiting to prevent automated exploitation attempts.
        </p>
      </Alert>
    </div>
  );
};

export default SQLBlindDemo;
