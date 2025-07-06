import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Table, Spinner } from 'react-bootstrap';
import SQLInjectionService from '../../../services/SQLInjectionService';

const SQLSearchDemo = ({ setupComplete }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SQLInjectionService.searchUsers(
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

  // Render users table
  const renderUsersTable = (users) => {
    if (!users || users.length === 0) {
      return <Alert variant="info">No users found matching your search.</Alert>;
    }
    
    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.id || index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
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
      <h3>Data Extraction Demo</h3>
      <p>
        SQL injection in search functionality can allow attackers to extract data from 
        database tables they shouldn't have access to. Try using SQL injection techniques 
        to extract information about all users!
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
                    <p>Try entering: <code>' OR '1'='1</code> to return all users.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnSearchQuery">
                        <Form.Label>Search Users:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter name or email to search"
                        />
                        <Form.Text className="text-muted">
                          This will search for users with matching name or email.
                        </Form.Text>
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Searching...' : 'Search'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT * FROM users WHERE full_name LIKE '%" + searchQuery + "%' OR email LIKE '%" + searchQuery + "%'";`}
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
                    <p>Try entering the same SQL injection: <code>' OR '1'='1</code> and see the difference.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureSearchQuery">
                        <Form.Label>Search Users:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter name or email to search"
                        />
                        <Form.Text className="text-muted">
                          This will search for users with matching name or email.
                        </Form.Text>
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Searching...' : 'Search'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT * FROM users WHERE full_name LIKE ? OR email LIKE ?";
const statement = connection.prepareStatement(query);
statement.setString(1, "%" + searchQuery + "%");
statement.setString(2, "%" + searchQuery + "%");`}
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
          <Card.Header>Search Results</Card.Header>
          <Card.Body>
            {result.users ? renderUsersTable(result.users) : (
              <pre className="mb-0">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            )}
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
        When you enter <code>' OR '1'='1</code> as the search query, the resulting query becomes:
      </p>
      <pre>
        <code>{`SELECT * FROM users WHERE full_name LIKE '%' OR '1'='1%' OR email LIKE '%' OR '1'='1%'`}</code>
      </pre>
      <p>
        Since <code>'1'='1'</code> is always true, this condition matches all rows in the table.
        This allows an attacker to bypass the search filter and see all user data in the database.
      </p>
      
      <p>
        In the secure implementation, parameterized queries are used. The database treats the
        input as data rather than executable code, preventing SQL injection attacks.
      </p>
      
      <Alert variant="info" className="mt-3">
        <strong>Advanced Attacks</strong>
        <p className="mb-0">
          Advanced SQL injection techniques can extract data from other tables using UNION queries,
          such as <code>' UNION SELECT id, username, password, email, role FROM users WHERE '1'='1</code>.
          These allow attackers to access sensitive information like password hashes.
        </p>
      </Alert>
    </div>
  );
};

export default SQLSearchDemo;
