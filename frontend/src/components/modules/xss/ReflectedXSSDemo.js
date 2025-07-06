import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import XSSService from '../../../services/XSSService';

const ReflectedXSSDemo = ({ setupComplete }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || !name.trim()) {
      setError('Please enter both name and comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await XSSService.postComment(
        comment, 
        name,
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

  // Create a container where XSS can be executed (for demonstration purposes only)
  const createMarkup = (html) => {
    return { __html: html };
  };

  // If environment setup is not complete, show a message
  if (!setupComplete) {
    return (
      <Alert variant="warning">
        Please set up the demo environment first.
      </Alert>
    );
  }

  return (
    <div>
      <h3>Reflected XSS Demo</h3>
      <p>
        Reflected XSS occurs when an application takes user input and includes it in the 
        response without proper validation or encoding. The injected script is reflected 
        off the web server, such as in search results or error messages.
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
                      This implementation directly inserts user input into HTML without any sanitization
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try entering: <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> in the comment field.
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnName">
                        <Form.Label>Your Name:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="vulnComment">
                        <Form.Label>Comment:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter your comment"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Posting...' : 'Post Comment'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Server-side code:
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(\`<h2>Search results for: \${query}</h2>\`); // Directly inserting user input
});`}
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
                      This implementation properly encodes user input before inserting it into HTML
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same script and see if it works.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureName">
                        <Form.Label>Your Name:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="secureComment">
                        <Form.Label>Comment:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter your comment"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Posting...' : 'Post Comment'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Server-side code:
app.get('/search', (req, res) => {
  const query = req.query.q;
  const encodedQuery = escapeHtml(query); // Properly encode user input
  res.send(\`<h2>Search results for: \${encodedQuery}</h2>\`);
});

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}`}
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
          <Card.Header>Comment Result</Card.Header>
          <Card.Body>
            <div className="p-3 bg-light border rounded">
              <h5>Comment from: {result.name}</h5>
              
              {/* Note: This is intentionally vulnerable for demonstration purposes */}
              {activeTab === 'vulnerable' ? (
                <div dangerouslySetInnerHTML={createMarkup(result.html)} />
              ) : (
                <p>{result.comment}</p>
              )}
            </div>
            
            {result.html && (
              <div className="mt-3">
                <h6>HTML Generated:</h6>
                <pre className="p-2 bg-light border">
                  <code>{result.html}</code>
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      <h4 className="mt-4">How Reflected XSS Works</h4>
      <p>
        In a reflected XSS attack, the malicious script is reflected off the web server,
        such as in an error message, search result, or any other response that includes
        part of the request sent to the server. The attack is delivered to victims through
        another route, typically a link that contains the malicious script.
      </p>
      
      <h5 className="mt-3">Attack Scenario</h5>
      <ol>
        <li>An attacker crafts a URL with a malicious script embedded in a parameter</li>
        <li>The URL is distributed through email, social media, or other means</li>
        <li>A victim clicks the link and sends the request to the vulnerable website</li>
        <li>The website reflects the malicious script back in the response</li>
        <li>The victim's browser executes the script in the context of the vulnerable site</li>
      </ol>
      
      <Alert variant="info" className="mt-3">
        <strong>Real-World Impact</strong>
        <p className="mb-0">
          Reflected XSS can lead to cookie theft, credential stealing, and session hijacking.
          Though it requires victim interaction, it remains one of the most common web vulnerabilities.
        </p>
      </Alert>
      
      <Alert variant="success" className="mt-4">
        <strong>Prevention Techniques</strong>
        <ul className="mb-0">
          <li><strong>Output Encoding:</strong> Convert characters like &lt; and &gt; to their HTML entity equivalents</li>
          <li><strong>Content Security Policy (CSP):</strong> Restrict which scripts can execute on your page</li>
          <li><strong>Input Validation:</strong> Validate user input against an allowlist of acceptable values</li>
          <li><strong>X-XSS-Protection Header:</strong> Enable built-in browser XSS filters</li>
        </ul>
      </Alert>
    </div>
  );
};

export default ReflectedXSSDemo;
