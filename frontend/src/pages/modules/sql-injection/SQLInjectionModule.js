import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import SQLInjectionService from '../../../services/SQLInjectionService';
import SQLLoginDemo from '../../../components/modules/sql-injection/SQLLoginDemo';
import SQLSearchDemo from '../../../components/modules/sql-injection/SQLSearchDemo';
import SQLProfileDemo from '../../../components/modules/sql-injection/SQLProfileDemo';
import SQLDynamicDemo from '../../../components/modules/sql-injection/SQLDynamicDemo';
import SQLBlindDemo from '../../../components/modules/sql-injection/SQLBlindDemo';

const SQLInjectionModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('intro');
  const [moduleInfo, setModuleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [databaseSetup, setDatabaseSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  // Fetch module information on component mount
  useEffect(() => {
    const fetchModuleInfo = async () => {
      try {
        setLoading(true);
        const info = await SQLInjectionService.getModuleInfo();
        setModuleInfo(info);
        setLoading(false);
      } catch (err) {
        setError('Failed to load module information. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchModuleInfo();
  }, []);

  // Setup demo database
  const handleSetupDatabase = async () => {
    try {
      setSetupLoading(true);
      const result = await SQLInjectionService.setupDatabase();
      if (result.success) {
        setDatabaseSetup(true);
        setError(null);
      } else {
        setError('Failed to set up demo database: ' + result.message);
      }
    } catch (err) {
      setError('An error occurred while setting up the demo database.');
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
        <p className="mt-3">Loading SQL Injection module...</p>
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
          <h2>{moduleInfo?.name || 'SQL Injection'}</h2>
          <p className="mb-0">{moduleInfo?.description || 'Learn about SQL injection vulnerabilities and how to prevent them'}</p>
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
                className={`px-3 py-2 ${activeTab === 'login' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('login')}>
                Authentication Bypass
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'search' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('search')}>
                Data Extraction
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'profile' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('profile')}>
                Data Modification
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'dynamic' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('dynamic')}>
                Dynamic Queries
              </Nav.Link>
              <Nav.Link 
                className={`px-3 py-2 ${activeTab === 'blind' ? 'bg-light fw-bold' : ''}`} 
                onClick={() => setActiveTab('blind')}>
                Blind SQL Injection
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
              {!databaseSetup && activeTab !== 'intro' && activeTab !== 'prevention' && (
                <Alert variant="info">
                  <Alert.Heading>Database Setup Required</Alert.Heading>
                  <p>
                    Before using the SQL injection demos, you need to set up the demo database.
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={handleSetupDatabase}
                    disabled={setupLoading}
                  >
                    {setupLoading ? 'Setting up...' : 'Setup Demo Database'}
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
                  <h3>SQL Injection Introduction</h3>
                  <p>
                    SQL Injection is a code injection technique that exploits vulnerabilities in an 
                    application's software that processes SQL statements. Attackers can insert or 
                    "inject" malicious SQL statements into entry fields for execution by the underlying 
                    SQL database.
                  </p>
                  <h4>What You'll Learn</h4>
                  <ul>
                    <li>How SQL injection vulnerabilities occur in different contexts</li>
                    <li>Common attack techniques including authentication bypass and data extraction</li>
                    <li>Advanced techniques like blind SQL injection</li>
                    <li>Best practices for preventing SQL injection in your applications</li>
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
                      handleSetupDatabase();
                      setActiveTab('login');
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

              {/* Login Demo Tab */}
              {activeTab === 'login' && (
                <SQLLoginDemo setupComplete={databaseSetup} />
              )}

              {/* Search Demo Tab */}
              {activeTab === 'search' && (
                <SQLSearchDemo setupComplete={databaseSetup} />
              )}

              {/* Profile Demo Tab */}
              {activeTab === 'profile' && (
                <SQLProfileDemo setupComplete={databaseSetup} />
              )}

              {/* Dynamic Queries Demo Tab */}
              {activeTab === 'dynamic' && (
                <SQLDynamicDemo setupComplete={databaseSetup} />
              )}

              {/* Blind SQL Injection Demo Tab */}
              {activeTab === 'blind' && (
                <SQLBlindDemo setupComplete={databaseSetup} />
              )}

              {/* Prevention Techniques Tab */}
              {activeTab === 'prevention' && (
                <div>
                  <h3>SQL Injection Prevention</h3>
                  <p>
                    SQL injection vulnerabilities can be prevented by using secure coding practices.
                    Here are some key techniques to protect your applications:
                  </p>
                  
                  <h4 className="mt-4">1. Use Parameterized Queries</h4>
                  <p>
                    Parameterized queries (prepared statements) separate SQL logic from data,
                    ensuring that user input is treated strictly as data and not executable code.
                  </p>
                  <Card className="bg-light mb-3">
                    <Card.Body>
                      <pre className="mb-0">
                        <code>
                          {`// Vulnerable code\nconst query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";`}
                        </code>
                      </pre>
                    </Card.Body>
                  </Card>
                  <Card className="bg-light mb-3">
                    <Card.Body>
                      <pre className="mb-0">
                        <code>
                          {`// Secure code\nconst query = "SELECT * FROM users WHERE username = ? AND password = ?";
const statement = connection.prepareStatement(query);
statement.setString(1, username);
statement.setString(2, password);`}
                        </code>
                      </pre>
                    </Card.Body>
                  </Card>

                  <h4 className="mt-4">2. Use ORM Libraries</h4>
                  <p>
                    Object-Relational Mapping (ORM) libraries typically implement parameterized 
                    queries by default, providing an additional layer of security.
                  </p>
                  
                  <h4 className="mt-4">3. Input Validation</h4>
                  <p>
                    Always validate and sanitize user input on the server side. Client-side 
                    validation is easily bypassed and should not be relied upon for security.
                  </p>
                  
                  <h4 className="mt-4">4. Principle of Least Privilege</h4>
                  <p>
                    Database accounts used by applications should have the minimum privileges 
                    necessary to perform their functions.
                  </p>
                  
                  <h4 className="mt-4">5. Use Stored Procedures</h4>
                  <p>
                    Stored procedures provide an additional layer of abstraction and security
                    by allowing you to control permissions at the procedure level.
                  </p>
                  
                  <h4 className="mt-4">6. Keep Software Updated</h4>
                  <p>
                    Keep database software, web servers, and application frameworks updated with
                    the latest security patches.
                  </p>
                  
                  <Alert variant="success" className="mt-4">
                    <Alert.Heading>Remember!</Alert.Heading>
                    <p>
                      Defense in depth is key. Implement multiple layers of protection instead 
                      of relying on a single security measure.
                    </p>
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default SQLInjectionModule;
