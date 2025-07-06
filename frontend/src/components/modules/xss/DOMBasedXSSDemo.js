import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Card, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import XSSService from '../../../services/XSSService';

const DOMBasedXSSDemo = ({ setupComplete }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vulnerable');
  
  // References to result containers
  const vulnerableResultRef = useRef(null);
  const secureResultRef = useRef(null);

  // Handle demonstration of DOM-based XSS
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Please enter some text to demonstrate');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous results
      if (vulnerableResultRef.current) vulnerableResultRef.current.innerHTML = '';
      if (secureResultRef.current) secureResultRef.current.textContent = '';
      
      // For the vulnerable implementation
      if (activeTab === 'vulnerable') {
        // Dangerous: directly using innerHTML with user input
        if (vulnerableResultRef.current) {
          vulnerableResultRef.current.innerHTML = `<div class="search-result">You searched for: ${input}</div>`;
        }
      } 
      // For the secure implementation
      else {
        // Safe: creating text nodes
        if (secureResultRef.current) {
          const prefix = document.createTextNode("You searched for: ");
          secureResultRef.current.appendChild(prefix);
          secureResultRef.current.appendChild(document.createTextNode(input));
        }
      }
      
      // Optional: Call to backend for additional demonstration or logging
      await XSSService.testDOMBasedXSS(input, activeTab);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
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
      <h3>DOM-Based XSS Demo</h3>
      <p>
        DOM-based XSS occurs when client-side JavaScript manipulates the Document Object Model (DOM) 
        in an unsafe way, allowing malicious scripts to be inserted and executed. 
        Unlike reflected and stored XSS, DOM-based XSS happens entirely in the browser 
        and may not involve any server requests.
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
                      This implementation uses innerHTML to insert user input into the DOM
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Try entering: <code>&lt;img src="x" onerror="alert('DOM XSS')"&gt;</code>
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="vulnInput">
                        <Form.Label>Search Query:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Enter search query"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Search'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="warning" className="mt-3">
                      <strong>Vulnerable Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Client-side JavaScript:
document.getElementById('search-button').addEventListener('click', () => {
  const userInput = document.getElementById('search-input').value;
  
  // Dangerous: Directly inserting user input into innerHTML
  document.getElementById('results').innerHTML = 
    '<div class="result">You searched for: ' + userInput + '</div>';
});`}
                        </code>
                      </pre>
                    </Alert>
                    
                    <div className="mt-4 p-3 border rounded bg-light">
                      <h5>Results:</h5>
                      <div ref={vulnerableResultRef}></div>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="secure">
                <Card className="mb-4">
                  <Card.Header className="bg-success text-white">
                    <strong>Secure Implementation</strong>
                    <p className="mb-0 small">
                      This implementation uses textContent or DOM methods to safely insert user input
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <p>Try entering the same script and see if it works.</p>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="secureInput">
                        <Form.Label>Search Query:</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Enter search query"
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Search'}
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                      </Button>
                    </Form>
                    
                    <Alert variant="success" className="mt-3">
                      <strong>Secure Code:</strong>
                      <pre className="mt-2 mb-0">
                        <code>
                          {`// Client-side JavaScript:
document.getElementById('search-button').addEventListener('click', () => {
  const userInput = document.getElementById('search-input').value;
  
  // Safe: Using textContent which automatically escapes HTML
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  
  // Option 1: Using textContent
  resultDiv.textContent = 'You searched for: ' + userInput;
  
  // Option 2: Using DOM methods
  // const textNode = document.createTextNode('You searched for: ' + userInput);
  // resultDiv.appendChild(textNode);
  
  // Clear previous results and append new
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';
  resultsContainer.appendChild(resultDiv);
});`}
                        </code>
                      </pre>
                    </Alert>
                    
                    <div className="mt-4 p-3 border rounded bg-light">
                      <h5>Results:</h5>
                      <div ref={secureResultRef}></div>
                    </div>
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
      
      <h4 className="mt-4">How DOM-Based XSS Works</h4>
      <p>
        DOM-based XSS occurs when JavaScript takes data from an attacker-controllable source
        (like the URL) and passes it to a sink that supports dynamic code execution.
        Common sources include:
      </p>
      <ul>
        <li>URL parameters (e.g., <code>document.location.href</code>)</li>
        <li>Fragment identifiers (e.g., <code>window.location.hash</code>)</li>
        <li>Web Storage (e.g., <code>localStorage</code>, <code>sessionStorage</code>)</li>
        <li>User input fields</li>
      </ul>
      
      <p>Common dangerous sinks include:</p>
      <ul>
        <li><code>innerHTML</code>, <code>outerHTML</code>, <code>document.write()</code></li>
        <li><code>eval()</code>, <code>setTimeout()</code>, <code>setInterval()</code> with string arguments</li>
        <li><code>location</code> when assigning a value</li>
        <li>jQuery's <code>$(...)</code>, <code>.html()</code>, etc.</li>
      </ul>
      
      <h5 className="mt-3">Attack Scenario</h5>
      <ol>
        <li>An application uses JavaScript to read data from a URL parameter</li>
        <li>This data is inserted into the page using a dangerous sink like <code>innerHTML</code></li>
        <li>An attacker crafts a URL with malicious JavaScript in the parameter</li>
        <li>When a victim opens the URL, the malicious script executes in their browser</li>
      </ol>
      
      <Alert variant="info" className="mt-3">
        <strong>Hidden Danger</strong>
        <p className="mb-0">
          DOM-based XSS can be harder to detect than other XSS types because:
        </p>
        <ul className="mb-0">
          <li>The vulnerability exists entirely in client-side code</li>
          <li>Server-side security measures and WAFs can't protect against it</li>
          <li>The payload may not be visible in network traffic if it comes from sources like <code>location.hash</code></li>
        </ul>
      </Alert>
      
      <Alert variant="success" className="mt-4">
        <strong>Prevention Techniques</strong>
        <ul className="mb-0">
          <li><strong>Use Safe Methods:</strong> Prefer <code>textContent</code> over <code>innerHTML</code></li>
          <li><strong>DOM Purification:</strong> Use libraries like DOMPurify to sanitize HTML before inserting it</li>
          <li><strong>Avoid Dangerous Methods:</strong> Don't use <code>eval()</code> or similar functions with user input</li>
          <li><strong>Content Security Policy:</strong> Use CSP headers to restrict inline scripts and <code>eval()</code></li>
          <li><strong>Input Validation:</strong> Validate client-side input before processing</li>
        </ul>
      </Alert>
    </div>
  );
};

export default DOMBasedXSSDemo;
