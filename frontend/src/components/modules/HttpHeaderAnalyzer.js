import React, { useState } from 'react';
import { 
  Form, 
  Button, 
  Card, 
  Row, 
  Col, 
  Alert, 
  Spinner, 
  Badge, 
  ProgressBar, 
  Accordion,
  Table
} from 'react-bootstrap';

/**
 * HTTP Header Analyzer Component
 * 
 * An interactive tool to analyze HTTP headers for security issues and best practices.
 * Allows users to analyze headers by URL or by manual input.
 */
const HttpHeaderAnalyzer = () => {
  // States
  const [mode, setMode] = useState('url'); // 'url' or 'manual'
  const [url, setUrl] = useState('');
  const [manualHeaders, setManualHeaders] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [allowInsecure, setAllowInsecure] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      let response;
      
      if (mode === 'url') {
        // Fetch headers from URL
        response = await fetch('/api/modules/http-headers/fetch-headers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            url: url,
            allow_insecure: allowInsecure
          }),
        });
      } else {
        // Parse manual headers
        try {
          const headerLines = manualHeaders.split('\n').filter(line => line.trim());
          const headersObject = {};
          
          headerLines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              const value = valueParts.join(':').trim();
              headersObject[key.trim()] = value;
            }
          });
          
          // Analyze manually provided headers
          response = await fetch('/api/modules/http-headers/analyze-headers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ headers: headersObject }),
          });
        } catch (err) {
          throw new Error('Invalid header format. Please check your input.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze headers');
      }

      const data = await response.json();
      setAnalysis(data.analysis || (data.success ? data : null));
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to get score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  // Header value display with truncation for long values
  const HeaderValue = ({ value }) => {
    const [expanded, setExpanded] = useState(false);
    
    if (!value || value.length <= 50) return <span>{value}</span>;
    
    return (
      <div>
        {expanded ? value : `${value.substring(0, 50)}...`}
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="p-0 ms-2"
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      </div>
    );
  };

  return (
    <div className="http-header-analyzer">
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">HTTP Header Analyzer</h5>
        </Card.Header>
        <Card.Body>
          <p className="card-text">
            Analyze HTTP headers for security issues and best practices. You can fetch headers from a URL or analyze headers manually.
          </p>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Analysis Mode</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="url-mode"
                  name="mode"
                  label="Analyze URL"
                  checked={mode === 'url'}
                  onChange={() => setMode('url')}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="manual-mode"
                  name="mode"
                  label="Manual Headers"
                  checked={mode === 'manual'}
                  onChange={() => setMode('manual')}
                />
              </div>
            </Form.Group>

            {mode === 'url' ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>URL to analyze</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter a URL to fetch and analyze its HTTP headers
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="allow-insecure"
                    label="Allow insecure certificates (not recommended)"
                    checked={allowInsecure}
                    onChange={(e) => setAllowInsecure(e.target.checked)}
                  />
                </Form.Group>
              </>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>HTTP Headers</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="Content-Type: text/html; charset=UTF-8
Server: nginx/1.18.0
Strict-Transport-Security: max-age=31536000"
                  value={manualHeaders}
                  onChange={(e) => setManualHeaders(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Enter headers in the format "Header-Name: header value", one per line
                </Form.Text>
              </Form.Group>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || (mode === 'url' && !url) || (mode === 'manual' && !manualHeaders)}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Analyzing...</span>
                </>
              ) : 'Analyze Headers'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Analyzing headers...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="analysis-results">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Analysis Results</h5>
              {analysis.score !== undefined && (
                <Badge 
                  bg={getScoreColor(analysis.score)}
                  className="fs-6 py-2 px-3"
                >
                  Score: {analysis.score}/100
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              {analysis.summary && (
                <div className="mb-4">
                  <h6>Summary</h6>
                  <Row>
                    <Col sm={6} md={3} className="mb-3">
                      <Card className="h-100">
                        <Card.Body className="text-center">
                          <div className="fs-1 mb-2">{analysis.summary.total_headers || 0}</div>
                          <div className="text-muted">Total Headers</div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} md={3} className="mb-3">
                      <Card className="h-100">
                        <Card.Body className="text-center">
                          <div className="fs-1 mb-2">{analysis.summary.implemented_security_headers || 0}</div>
                          <div className="text-muted">Security Headers</div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} md={3} className="mb-3">
                      <Card className="h-100 border-warning">
                        <Card.Body className="text-center">
                          <div className="fs-1 mb-2">{analysis.summary.missing_security_headers || 0}</div>
                          <div className="text-muted">Missing Headers</div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} md={3} className="mb-3">
                      <Card className="h-100 border-danger">
                        <Card.Body className="text-center">
                          <div className="fs-1 mb-2">{analysis.summary.risky_headers || 0}</div>
                          <div className="text-muted">Risky Headers</div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {analysis.score !== undefined && (
                    <div className="mt-3">
                      <label className="form-label d-flex justify-content-between">
                        <span>Security Score</span>
                        <span>{analysis.score}/100</span>
                      </label>
                      <ProgressBar 
                        now={analysis.score} 
                        variant={getScoreColor(analysis.score)}
                        className="mb-3" 
                        style={{ height: '10px' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="mb-4">
                  <h6>Recommendations</h6>
                  <Accordion>
                    {analysis.recommendations.map((rec, index) => (
                      <Accordion.Item key={index} eventKey={index.toString()}>
                        <Accordion.Header>
                          <div className="d-flex w-100 justify-content-between align-items-center">
                            <span>{rec.title}</span>
                            <Badge 
                              bg={rec.priority === 'High' ? 'danger' : rec.priority === 'Medium' ? 'warning' : 'info'}
                              className="ms-2"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <p>{rec.description}</p>
                          {rec.headers && rec.headers.length > 0 && (
                            <div>
                              <strong>Affected Headers:</strong>
                              <ul className="mb-0">
                                {rec.headers.map((header, i) => (
                                  <li key={i}>{header}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {rec.issues && rec.issues.length > 0 && (
                            <div>
                              <strong>Issues:</strong>
                              <ul className="mb-0">
                                {rec.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Missing Security Headers */}
              {analysis.missing_headers && analysis.missing_headers.length > 0 && (
                <div className="mb-4">
                  <h6>Missing Security Headers</h6>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Header</th>
                        <th>Description</th>
                        <th>Impact</th>
                        <th>Recommended Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.missing_headers.map((header, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{header.name}</strong>
                          </td>
                          <td>{header.description}</td>
                          <td>
                            <Badge 
                              bg={header.security_impact === 'High' ? 'danger' : 
                                 header.security_impact === 'Medium' ? 'warning' : 'info'}
                            >
                              {header.security_impact}
                            </Badge>
                          </td>
                          <td><code>{header.recommended_value}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Implemented Headers */}
              {analysis.implemented_headers && analysis.implemented_headers.length > 0 && (
                <div className="mb-4">
                  <h6>Implemented Headers</h6>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Header</th>
                        <th>Value</th>
                        <th>Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.implemented_headers.map((header, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{header.name}</strong>
                            <div className="text-muted small">{header.description}</div>
                          </td>
                          <td>
                            <code><HeaderValue value={header.value} /></code>
                          </td>
                          <td>
                            {header.issues && header.issues.length > 0 ? (
                              <ul className="mb-0 ps-3">
                                {header.issues.map((issue, i) => (
                                  <li key={i} className="text-danger">{issue}</li>
                                ))}
                                {header.recommendation && (
                                  <li className="text-info">{header.recommendation}</li>
                                )}
                              </ul>
                            ) : (
                              <Badge bg="success">No issues</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Risky Headers */}
              {analysis.risky_headers && analysis.risky_headers.length > 0 && (
                <div className="mb-4">
                  <h6>Risky Headers</h6>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Header</th>
                        <th>Value</th>
                        <th>Risk</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.risky_headers.map((header, index) => (
                        <tr key={index}>
                          <td><strong>{header.name}</strong></td>
                          <td><code><HeaderValue value={header.value} /></code></td>
                          <td>{header.risk}</td>
                          <td>{header.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Educational section */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Security Headers Guide</h5>
            </Card.Header>
            <Card.Body>
              <h6>What are Security Headers?</h6>
              <p>
                HTTP security headers are a crucial component of website security. By implementing these headers, 
                you can protect your site from various attacks like XSS, clickjacking, and data injection.
              </p>
              
              <h6>Key Security Headers</h6>
              <ul>
                <li>
                  <strong>Strict-Transport-Security (HSTS)</strong>: Forces browsers to use HTTPS instead of HTTP
                </li>
                <li>
                  <strong>Content-Security-Policy (CSP)</strong>: Restricts which resources can be loaded by the browser
                </li>
                <li>
                  <strong>X-Content-Type-Options</strong>: Prevents MIME type sniffing
                </li>
                <li>
                  <strong>X-Frame-Options</strong>: Protects against clickjacking by controlling frame embedding
                </li>
                <li>
                  <strong>Referrer-Policy</strong>: Controls how much referrer information is included with requests
                </li>
              </ul>
              
              <h6>Best Practices</h6>
              <ol>
                <li>Enable HTTPS and implement HSTS</li>
                <li>Use a Content Security Policy to restrict resource loading</li>
                <li>Set X-Content-Type-Options to 'nosniff'</li>
                <li>Set X-Frame-Options to 'DENY' or 'SAMEORIGIN'</li>
                <li>Use SameSite cookies with Secure and HttpOnly flags</li>
              </ol>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HttpHeaderAnalyzer;
