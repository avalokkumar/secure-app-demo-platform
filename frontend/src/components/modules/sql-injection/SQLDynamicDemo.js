import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Table, Spinner } from 'react-bootstrap';
import SQLInjectionService from '../../../services/SQLInjectionService';

const SQLDynamicDemo = ({ setupComplete }) => {
  const [table, setTable] = useState('users');
  const [column, setColumn] = useState('username');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle dynamic query submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!table.trim() || !column.trim()) {
      setError('Please enter both table and column names');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SQLInjectionService.dynamicQuery(
        table, 
        column,
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

  // Render results table
  const renderResultsTable = (data) => {
    if (!data || data.length === 0) {
      return <Alert variant="info">No data found.</Alert>;
    }
    
    // Extract column names from first row
    const columns = Object.keys(data[0]);
    
    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{row[col]?.toString() || ''}</td>
              ))}
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
      <h3>Dynamic Queries Demo</h3>
      <p>
        SQL injection in dynamic table/column selection can allow attackers to extract data 
        from any table or even execute additional SQL commands. This is particularly dangerous 
        when table or column names are supplied by users or URL parameters.
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
                      This implementation directly concatenates table and column names into the SQL query
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try entering: <code>users; SELECT * FROM user_sessions</code> as the table name 
                      and <code>*</code> as the column to view sensitive data from another table.
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="vulnTable">
                            <Form.Label>Table Name:</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={table}
                              onChange={(e) => setTable(e.target.value)}
                              placeholder="Enter table name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="vulnColumn">
                            <Form.Label>Column Name:</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={column}
                              onChange={(e) => setColumn(e.target.value)}
                              placeholder="Enter column name or *"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Running Query...' : 'Run Query'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`const query = "SELECT " + column + " FROM " + table;`}
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
                      This implementation validates table and column names against a whitelist
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same injection and see if it works.</p>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="secureTable">
                            <Form.Label>Table Name:</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={table}
                              onChange={(e) => setTable(e.target.value)}
                              placeholder="Enter table name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="secureColumn">
                            <Form.Label>Column Name:</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={column}
                              onChange={(e) => setColumn(e.target.value)}
                              placeholder="Enter column name or *"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Running Query...' : 'Run Query'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Whitelist of allowed tables and columns
const allowedTables = ['users', 'products', 'categories'];
const allowedColumns = {
  users: ['id', 'username', 'email', 'full_name', 'role', '*'],
  products: ['id', 'name', 'price', 'description', '*'],
  categories: ['id', 'name', 'description', '*']
};

// Validate table and column against whitelists
if (!allowedTables.includes(table)) {
  throw new Error('Invalid table name');
}
if (!allowedColumns[table].includes(column)) {
  throw new Error('Invalid column name');
}

const query = "SELECT " + (column === '*' ? '*' : \`\${column}\`) + " FROM " + table;`}
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
          <Card.Header>Query Results</Card.Header>
          <Card.Body>
            {result.data ? renderResultsTable(result.data) : (
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
        In the vulnerable implementation, table and column names are directly concatenated into the SQL query.
        When you enter <code>users; SELECT * FROM user_sessions</code> as the table, the resulting query becomes:
      </p>
      <pre>
        <code>{`SELECT username FROM users; SELECT * FROM user_sessions`}</code>
      </pre>
      <p>
        This input changes the query to execute two statements instead of one, allowing an attacker
        to query data from any table in the database. This technique called "stacked queries" can be
        used to execute any SQL command, including data modification and deletion.
      </p>
      
      <p>
        In the secure implementation, table and column names are validated against a whitelist.
        This prevents attackers from injecting arbitrary table or column names.
      </p>
      
      <Alert variant="info" className="mt-3">
        <strong>Best Practice</strong>
        <p className="mb-0">
          For dynamic table and column references, a combination of whitelisting and
          proper escaping/quoting should be used. In many applications, it's best to avoid
          dynamic table and column references entirely if possible.
        </p>
      </Alert>
    </div>
  );
};

export default SQLDynamicDemo;
