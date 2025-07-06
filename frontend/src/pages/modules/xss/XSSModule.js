import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import XSSService from '../../../services/XSSService';
import ReflectedXSSDemo from '../../../components/modules/xss/ReflectedXSSDemo';
import StoredXSSDemo from '../../../components/modules/xss/StoredXSSDemo';
import DOMBasedXSSDemo from '../../../components/modules/xss/DOMBasedXSSDemo';
import XSSPreventionDemo from '../../../components/modules/xss/XSSPreventionDemo';

const XSSModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('intro');
  const [moduleInfo, setModuleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [environmentSetup, setEnvironmentSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  // Fetch module information on component mount
  useEffect(() => {
    const fetchModuleInfo = async () => {
      try {
        setLoading(true);
        const info = await XSSService.getModuleInfo();
        setModuleInfo(info);
        setLoading(false);
      } catch (err) {
        setError('Failed to load module information. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchModuleInfo();
  }, []);

  // Setup demo environment
  const handleSetupEnvironment = async () => {
    try {
      setSetupLoading(true);
      const result = await XSSService.setupEnvironment();
      if (result.success) {
        setEnvironmentSetup(true);
        setError(null);
      } else {
        setError('Failed to set up demo environment: ' + result.message);
      }
    } catch (err) {
      setError('An error occurred while setting up the demo environment.');
    } finally {
      setSetupLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading XSS module...</p>
      </Container>
    );
  }

  // Render error state
  if (error && !moduleInfo) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2>{moduleInfo?.name || 'Cross-Site Scripting (XSS)'}</h2>
          <p className="mb-0">{moduleInfo?.description || 'Learn about cross-site scripting vulnerabilities and how to prevent them'}</p>
        </Card.Header>
        
        <Row className="g-0">
          <Col md={3} className="border-end">
            <Nav className="flex-column py-3">
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'intro' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('intro')}>
                Introduction
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'reflected' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('reflected')}>
                Reflected XSS
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'stored' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('stored')}>
                Stored XSS
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'dom' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('dom')}>
                DOM-Based XSS
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'prevention' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('prevention')}>
                Prevention Techniques
              </Nav.Link>
            </Nav>
          </Col>

          <Col md={9}>
            <Card.Body className="p-4">
              {!environmentSetup && activeTab !== 'intro' && activeTab !== 'prevention' && (
                <Alert variant="info">
                  <Alert.Heading>Environment Setup Required</Alert.Heading>
                  <p>
                    Before using the XSS demos, you need to set up the demo environment.
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={handleSetupEnvironment}
                    disabled={setupLoading}
                  >
                    {setupLoading ? 'Setting up...' : 'Setup Demo Environment'}
                    {setupLoading && (
                      <Spinner animation="border" size="sm" className="ms-2" />
                    )}
                  </Button>
                </Alert>
              )}

              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              {/* Intro Tab */}
              {activeTab === 'intro' && (
                <div>
                  <h3>Cross-Site Scripting (XSS) Introduction</h3>
                  <p>
                    Cross-Site Scripting (XSS) is a security vulnerability that allows attackers 
                    to inject malicious client-side scripts into web pages viewed by other users. 
                    These attacks succeed when a web application includes untrusted data in a new 
                    web page without proper validation or encoding.
                  </p>
                  <h4>What You'll Learn</h4>
                  <ul>
                    <li>The three main types of XSS attacks: Reflected, Stored, and DOM-based</li>
                    <li>How each type of XSS vulnerability occurs in different contexts</li>
                    <li>Common attack techniques and payloads</li>
                    <li>Best practices for preventing XSS in your applications</li>
                  </ul>
                  
                  <h4>Impact of XSS Vulnerabilities</h4>
                  <p>
                    XSS attacks can have serious consequences:
                  </p>
                  <ul>
                    <li>Theft of session cookies and user credentials</li>
                    <li>Performing unauthorized actions on behalf of users</li>
                    <li>Defacement of websites</li>
                    <li>Distribution of malware</li>
                    <li>Keylogging and data theft</li>
                  </ul>
                  
                  <Alert variant="warning">
                    <Alert.Heading>Educational Purpose Only</Alert.Heading>
                    <p>
                      The examples in this module contain intentionally vulnerable code for educational 
                      purposes. Never use these techniques on systems without proper authorization.
                    </p>
                  </Alert>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      handleSetupEnvironment();
                      setActiveTab('reflected');
                    }}
                    disabled={setupLoading}
                  >
                    {setupLoading ? 'Setting up...' : 'Start Learning'}
                    {setupLoading && (
                      <Spinner animation="border" size="sm" className="ms-2" />
                    )}
                  </Button>
                </div>
              )}

              {/* Reflected XSS Tab */}
              {activeTab === 'reflected' && (
                <ReflectedXSSDemo setupComplete={environmentSetup} />
              )}

              {/* Stored XSS Tab */}
              {activeTab === 'stored' && (
                <StoredXSSDemo setupComplete={environmentSetup} />
              )}

              {/* DOM-Based XSS Tab */}
              {activeTab === 'dom' && (
                <DOMBasedXSSDemo setupComplete={environmentSetup} />
              )}

              {/* Prevention Techniques Tab */}
              {activeTab === 'prevention' && (
                <XSSPreventionDemo />
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default XSSModule;
