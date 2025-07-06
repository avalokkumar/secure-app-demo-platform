import React, { useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco, a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeSnippetDisplay = ({ snippet }) => {
  const [activeTab, setActiveTab] = useState('vulnerable');
  
  // Determine language for syntax highlighting
  const getLanguage = () => {
    const lang = snippet?.language?.toLowerCase() || 'javascript';
    
    // Map language to syntax highlighter language
    switch (lang) {
      case 'python':
      case 'py':
        return 'python';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'java':
        return 'java';
      case 'php':
        return 'php';
      case 'csharp':
      case 'cs':
        return 'csharp';
      case 'c':
        return 'c';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'sql':
        return 'sql';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'javascript';
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between">
          <h5 className="mb-0">{snippet.title || 'Code Example'}</h5>
          <span className="text-muted">{snippet.language}</span>
        </div>
      </Card.Header>
      
      {snippet.description && (
        <Card.Body>
          <p>{snippet.description}</p>
        </Card.Body>
      )}
      
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="px-3 pt-2">
          <Nav.Item>
            <Nav.Link 
              eventKey="vulnerable"
              className="text-danger"
            >
              Vulnerable Code
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="secure"
              className="text-success"
            >
              Secure Code
            </Nav.Link>
          </Nav.Item>
          {snippet.explanation && (
            <Nav.Item>
              <Nav.Link eventKey="explanation">
                Explanation
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="vulnerable">
            <Card.Body className="bg-light p-0">
              <SyntaxHighlighter 
                language={getLanguage()}
                style={a11yDark}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 0.25rem 0.25rem',
                  padding: '1.5rem'
                }}
              >
                {snippet.vulnerable_code || '// No vulnerable code provided'}
              </SyntaxHighlighter>
              
              <div className="p-3 bg-danger bg-opacity-10 border-top border-danger">
                <div className="d-flex">
                  <div className="me-2">
                    <span className="text-danger">⚠️</span>
                  </div>
                  <div>
                    <strong className="text-danger">Vulnerable Code Warning:</strong>
                    <p className="mb-0 small">
                      This code contains security vulnerabilities. Do not use in production applications.
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Tab.Pane>
          
          <Tab.Pane eventKey="secure">
            <Card.Body className="bg-light p-0">
              <SyntaxHighlighter 
                language={getLanguage()}
                style={docco}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 0.25rem 0.25rem',
                  padding: '1.5rem'
                }}
              >
                {snippet.secure_code || '// No secure code provided'}
              </SyntaxHighlighter>
              
              <div className="p-3 bg-success bg-opacity-10 border-top border-success">
                <div className="d-flex">
                  <div className="me-2">
                    <span className="text-success">✓</span>
                  </div>
                  <div>
                    <strong className="text-success">Secure Implementation:</strong>
                    <p className="mb-0 small">
                      This code implements security best practices to mitigate the vulnerabilities.
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Tab.Pane>
          
          {snippet.explanation && (
            <Tab.Pane eventKey="explanation">
              <Card.Body>
                <h6>What's happening here?</h6>
                <p>{snippet.explanation}</p>
              </Card.Body>
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>
    </Card>
  );
};

export default CodeSnippetDisplay;
