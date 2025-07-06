import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner, ListGroup } from 'react-bootstrap';
import XSSService from '../../../services/XSSService';

const StoredXSSDemo = ({ setupComplete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [storedEntries, setStoredEntries] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');

  // Fetch stored content on mount and tab change
  useEffect(() => {
    if (setupComplete) {
      fetchStoredContent();
    }
  }, [setupComplete, activeTab]);

  // Fetch stored content
  const fetchStoredContent = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const response = await XSSService.getStoredContent(activeTab);
      if (response.entries) {
        setStoredEntries(response.entries);
      }
    } catch (err) {
      setError(`Error fetching stored content: ${err.message || 'Unknown error'}`);
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle content submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || !title.trim()) {
      setError('Please enter both title and content');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await XSSService.storeContent(content, title, activeTab);
      setTitle('');
      setContent('');
      fetchStoredContent(); // Refresh the list after submitting
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message || 'Unknown error occurred'}`);
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
      <h3>Stored XSS Demo</h3>
      <p>
        Stored XSS (also called Persistent XSS) occurs when an application stores user input 
        in a database and later displays it to users without proper sanitation. This type of 
        XSS is particularly dangerous because the malicious script is delivered to all users 
        who view the affected page.
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
                      This implementation stores and displays user input without sanitization
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try entering: <code>&lt;img src="x" onerror="alert('Stored XSS')"&gt;</code> in the content field.
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnTitle">
                        <Form.Label>Title:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter title"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="vulnContent">
                        <Form.Label>Content:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Enter content (HTML allowed)"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Content'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Server-side storage code:
app.post('/content', (req, res) => {
  const { title, content } = req.body;
  db.query('INSERT INTO entries (title, content) VALUES (?, ?)', 
    [title, content]);  // Content is stored as-is
  res.json({ success: true });
});

// Server-side rendering code:
app.get('/entries', (req, res) => {
  const entries = db.query('SELECT * FROM entries');
  res.render('entries', { entries }); // Content is rendered as-is
});

// Client-side rendering:
entries.forEach(entry => {
  document.write(\`<div class="entry">
    <h3>\${entry.title}</h3>
    <div>\${entry.content}</div>  // Content is inserted without encoding
  </div>\`);
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
                      This implementation properly sanitizes user input before storing and displaying it
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same script and see if it works.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureTitle">
                        <Form.Label>Title:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter title"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="secureContent">
                        <Form.Label>Content:</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Enter content (HTML will be sanitized)"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Content'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Server-side storage with sanitization:
app.post('/content', (req, res) => {
  const { title, content } = req.body;
  // Sanitize input before storing
  const sanitizedTitle = sanitizeHtml(title, { allowedTags: [] }); // Strip all HTML
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong'], // Allow limited safe tags only
    allowedAttributes: {}
  });
  
  db.query('INSERT INTO entries (title, content) VALUES (?, ?)', 
    [sanitizedTitle, sanitizedContent]);
  res.json({ success: true });
});

// Client-side rendering with encoding:
entries.forEach(entry => {
  const container = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = entry.title; // Automatically encoded
  
  const content = document.createElement('div');
  content.textContent = entry.content; // Automatically encoded
  
  container.appendChild(title);
  container.appendChild(content);
  document.body.appendChild(container);
});`}
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

      {/* Error display */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Stored content display */}
      <Card className="mt-4 mb-4">
        <Card.Header>
          <h4 className="mb-0">Stored Content</h4>
        </Card.Header>
        <Card.Body>
          {fetchLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading stored entries...</p>
            </div>
          ) : storedEntries.length === 0 ? (
            <Alert variant="info">No stored entries found. Add some content above.</Alert>
          ) : (
            <ListGroup>
              {storedEntries.map((entry, index) => (
                <ListGroup.Item key={index} className="p-3">
                  <h5>{entry.title}</h5>
                  {/* Note: This is intentionally vulnerable for demonstration purposes */}
                  {activeTab === 'vulnerable' ? (
                    <div dangerouslySetInnerHTML={createMarkup(entry.content)} />
                  ) : (
                    <p>{entry.content}</p>
                  )}
                  <small className="text-muted">ID: {entry.id} | Added: {new Date(entry.created_at).toLocaleString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
      
      <h4 className="mt-4">How Stored XSS Works</h4>
      <p>
        In a stored XSS attack, the malicious script is permanently stored on the target server,
        such as in a database, message forum, comment field, or visitor log. When other users 
        view the affected page, the malicious script is served as part of the page and executes
        in their browsers.
      </p>
      
      <h5 className="mt-3">Attack Scenario</h5>
      <ol>
        <li>An attacker submits a form that includes malicious JavaScript</li>
        <li>The application stores this submission in a database without proper sanitization</li>
        <li>When other users view a page that includes this stored data, the script executes</li>
        <li>The malicious script runs in the context of each victim's browser, with access to their cookies, session tokens, and other sensitive information</li>
      </ol>
      
      <Alert variant="danger" className="mt-3">
        <strong>Serious Threat</strong>
        <p className="mb-0">
          Stored XSS is considered more dangerous than reflected XSS because:
        </p>
        <ul className="mb-0">
          <li>It affects all users who visit the page, not just those who click a specific link</li>
          <li>It persists until the malicious content is removed from the server</li>
          <li>It can be used for persistent user tracking or to create self-propagating worms</li>
        </ul>
      </Alert>
      
      <Alert variant="success" className="mt-4">
        <strong>Prevention Techniques</strong>
        <ul className="mb-0">
          <li><strong>Input Validation:</strong> Validate user input on the server side</li>
          <li><strong>HTML Sanitization:</strong> Use libraries like DOMPurify to sanitize HTML</li>
          <li><strong>Context-Aware Output Encoding:</strong> Use different encoding methods based on where data is inserted (HTML, JavaScript, CSS, etc.)</li>
          <li><strong>Content Security Policy (CSP):</strong> Use CSP headers to restrict which scripts can execute on your page</li>
        </ul>
      </Alert>
    </div>
  );
};

export default StoredXSSDemo;
