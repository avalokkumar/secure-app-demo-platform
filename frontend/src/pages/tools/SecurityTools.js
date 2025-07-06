import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import CodeVulnerabilityScanner from '../../components/modules/CodeVulnerabilityScanner';
import PasswordAnalyzer from '../../components/modules/PasswordAnalyzer';
import EncryptionTools from '../../components/modules/EncryptionTools';
import HttpHeaderAnalyzer from '../../components/modules/HttpHeaderAnalyzer';

/**
 * Security Tools Page
 * 
 * A page containing various interactive security tools for educational purposes
 */
const SecurityTools = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Security Tools</h2>
      <p className="text-muted mb-4">
        Interactive security tools to help you understand and practice application security concepts.
      </p>

      <Tab.Container defaultActiveKey="vulnerability-scanner">
        <Row>
          <Col md={3} className="mb-4">
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="vulnerability-scanner">
                  <i className="bi bi-shield-check me-2"></i>
                  Code Vulnerability Scanner
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password-analyzer">
                  <i className="bi bi-key me-2"></i>
                  Password Strength Analyzer
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="encryption-tool">
                  <i className="bi bi-lock me-2"></i>
                  Encryption Tool
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="header-analyzer">
                  <i className="bi bi-file-earmark-code me-2"></i>
                  HTTP Header Analyzer
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="vulnerability-scanner">
                <CodeVulnerabilityScanner />
              </Tab.Pane>
              <Tab.Pane eventKey="password-analyzer">
                <PasswordAnalyzer />
              </Tab.Pane>
              <Tab.Pane eventKey="header-analyzer">
                <HttpHeaderAnalyzer />
              </Tab.Pane>
              <Tab.Pane eventKey="encryption-tool">
                <EncryptionTools />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default SecurityTools;
