import React, { useState } from 'react';
import { Card, Form, Button, Alert, Tab, Nav, Row, Col, Spinner } from 'react-bootstrap';
import CryptoJS from 'crypto-js';

/**
 * Encryption Tools Component
 * 
 * Interactive tool for demonstrating various encryption/hashing algorithms
 * with educational explanations and examples
 */
const EncryptionTools = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState('aes');
  const [operation, setOperation] = useState('encrypt');

  // Handle encryption or hashing based on selected algorithm
  const handleProcess = () => {
    if (!input) {
      setError('Please enter text to process');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      setTimeout(() => {
        if (['md5', 'sha1', 'sha256', 'sha512'].includes(algorithm)) {
          // Handle one-way hashing algorithms
          performHashing();
        } else {
          // Handle encryption algorithms
          if (algorithm === 'aes' && !key && operation === 'encrypt') {
            setError('Please enter an encryption key');
            setIsLoading(false);
            return;
          }
          performEncryption();
        }
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Perform one-way hashing
  const performHashing = () => {
    let result = '';

    switch (algorithm) {
      case 'md5':
        result = CryptoJS.MD5(input).toString();
        break;
      case 'sha1':
        result = CryptoJS.SHA1(input).toString();
        break;
      case 'sha256':
        result = CryptoJS.SHA256(input).toString();
        break;
      case 'sha512':
        result = CryptoJS.SHA512(input).toString();
        break;
      default:
        throw new Error('Unsupported hashing algorithm');
    }

    setOutput(result);
  };

  // Perform encryption/decryption
  const performEncryption = () => {
    let result = '';

    switch (algorithm) {
      case 'aes':
        if (operation === 'encrypt') {
          result = CryptoJS.AES.encrypt(input, key).toString();
        } else {
          try {
            const bytes = CryptoJS.AES.decrypt(input, key);
            result = bytes.toString(CryptoJS.enc.Utf8);
            if (!result) {
              throw new Error('Decryption failed. Check your key and ciphertext.');
            }
          } catch (e) {
            throw new Error('Decryption failed. Check your key and ciphertext.');
          }
        }
        break;
      case 'des':
        if (operation === 'encrypt') {
          result = CryptoJS.DES.encrypt(input, key).toString();
        } else {
          try {
            const bytes = CryptoJS.DES.decrypt(input, key);
            result = bytes.toString(CryptoJS.enc.Utf8);
            if (!result) {
              throw new Error('Decryption failed. Check your key and ciphertext.');
            }
          } catch (e) {
            throw new Error('Decryption failed. Check your key and ciphertext.');
          }
        }
        break;
      case 'rabbit':
        if (operation === 'encrypt') {
          result = CryptoJS.Rabbit.encrypt(input, key).toString();
        } else {
          try {
            const bytes = CryptoJS.Rabbit.decrypt(input, key);
            result = bytes.toString(CryptoJS.enc.Utf8);
            if (!result) {
              throw new Error('Decryption failed. Check your key and ciphertext.');
            }
          } catch (e) {
            throw new Error('Decryption failed. Check your key and ciphertext.');
          }
        }
        break;
      case 'base64':
        if (operation === 'encrypt') {
          // Base64 encoding
          result = btoa(input);
        } else {
          try {
            // Base64 decoding
            result = atob(input);
          } catch (e) {
            throw new Error('Invalid Base64 input');
          }
        }
        break;
      default:
        throw new Error('Unsupported encryption algorithm');
    }

    setOutput(result);
  };

  // Clear all fields
  const handleClear = () => {
    setInput('');
    setOutput('');
    setKey('');
    setError('');
  };

  // Get algorithm description
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'aes':
        return 'AES (Advanced Encryption Standard) is a symmetric encryption algorithm using block cipher with key lengths of 128, 192, or 256 bits. It is widely used and considered highly secure.';
      case 'des':
        return 'DES (Data Encryption Standard) is an older symmetric encryption algorithm with a 56-bit key. It is no longer considered secure for sensitive data due to its small key size.';
      case 'rabbit':
        return 'Rabbit is a high-speed stream cipher with a 128-bit key. It is designed for software implementations and offers good security with higher performance than block ciphers.';
      case 'base64':
        return 'Base64 is an encoding scheme that represents binary data in an ASCII string format. It is not encryption (it provides no security) but is commonly used for transmitting binary data.';
      case 'md5':
        return 'MD5 is a widely used hash function that produces a 128-bit hash value. It is considered cryptographically broken and unsuitable for security purposes due to vulnerabilities.';
      case 'sha1':
        return 'SHA-1 produces a 160-bit hash value. It is considered cryptographically broken due to collision vulnerabilities and should not be used for security applications.';
      case 'sha256':
        return 'SHA-256 produces a 256-bit hash value and is part of the SHA-2 family. It is widely used and still considered secure for most applications.';
      case 'sha512':
        return 'SHA-512 produces a 512-bit hash value and is part of the SHA-2 family. It provides stronger security than SHA-256 but is computationally more intensive.';
      default:
        return 'Select an algorithm to see its description.';
    }
  };

  // Get example uses
  const getAlgorithmUses = () => {
    switch (algorithm) {
      case 'aes':
        return 'Securing sensitive data, file encryption, secure communications, VPNs, and password storage systems.';
      case 'des':
        return 'Legacy systems, backward compatibility with older applications (not recommended for new implementations).';
      case 'rabbit':
        return 'Real-time encryption, streaming applications, IoT devices with limited processing power.';
      case 'base64':
        return 'Email attachments (MIME), image embedding in HTML/CSS, data URIs, JSON web tokens (JWT).';
      case 'md5':
        return 'File integrity checks, non-security hash tables (not recommended for security purposes).';
      case 'sha1':
        return 'Legacy systems, backward compatibility (not recommended for security purposes).';
      case 'sha256':
        return 'Digital signatures, file integrity verification, password storage (with proper salting), SSL certificates.';
      case 'sha512':
        return 'Applications requiring high security, password storage systems, blockchain implementations.';
      default:
        return '';
    }
  };

  // Determine if algorithm is a hash function (one-way)
  const isHashAlgorithm = ['md5', 'sha1', 'sha256', 'sha512'].includes(algorithm);

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Encryption & Hashing Tools</h5>
      </Card.Header>
      <Card.Body>
        <Tab.Container defaultActiveKey="tool">
          <Row>
            <Col md={12}>
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="tool">Tool</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="learn">Learn</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            
            <Col md={12}>
              <Tab.Content>
                {/* Encryption Tool Tab */}
                <Tab.Pane eventKey="tool">
                  <Form>
                    <Row className="mb-3">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Group>
                          <Form.Label>Select Algorithm</Form.Label>
                          <Form.Select
                            value={algorithm}
                            onChange={(e) => {
                              setAlgorithm(e.target.value);
                              setOutput('');
                              setError('');
                            }}
                          >
                            <optgroup label="Encryption (Two-way)">
                              <option value="aes">AES (Advanced Encryption Standard)</option>
                              <option value="des">DES (Data Encryption Standard)</option>
                              <option value="rabbit">Rabbit Cipher</option>
                              <option value="base64">Base64 (Encoding)</option>
                            </optgroup>
                            <optgroup label="Hashing (One-way)">
                              <option value="md5">MD5</option>
                              <option value="sha1">SHA-1</option>
                              <option value="sha256">SHA-256</option>
                              <option value="sha512">SHA-512</option>
                            </optgroup>
                          </Form.Select>
                          <Form.Text className="text-muted">
                            {isHashAlgorithm ? 'Hashing is one-way and cannot be reversed' : 'Encryption can be reversed with the correct key'}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      {!isHashAlgorithm && (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Operation</Form.Label>
                            <div>
                              <Form.Check
                                inline
                                type="radio"
                                id="encrypt-radio"
                                label="Encrypt"
                                checked={operation === 'encrypt'}
                                onChange={() => {
                                  setOperation('encrypt');
                                  setOutput('');
                                  setError('');
                                }}
                              />
                              <Form.Check
                                inline
                                type="radio"
                                id="decrypt-radio"
                                label="Decrypt"
                                checked={operation === 'decrypt'}
                                onChange={() => {
                                  setOperation('decrypt');
                                  setOutput('');
                                  setError('');
                                }}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      )}
                    </Row>

                    {(algorithm !== 'base64' && !isHashAlgorithm) && (
                      <Form.Group className="mb-3">
                        <Form.Label>Encryption Key</Form.Label>
                        <Form.Control
                          type="text"
                          value={key}
                          onChange={(e) => setKey(e.target.value)}
                          placeholder="Enter encryption key"
                        />
                        <Form.Text className="text-muted">
                          A strong key should be at least 16 characters with a mix of letters, numbers, and special characters.
                        </Form.Text>
                      </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>
                        {isHashAlgorithm
                          ? 'Text to Hash'
                          : operation === 'encrypt'
                          ? 'Text to Encrypt'
                          : 'Text to Decrypt'}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isHashAlgorithm
                          ? 'Enter text to hash'
                          : operation === 'encrypt'
                          ? 'Enter text to encrypt'
                          : 'Enter text to decrypt'}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2 mb-3">
                      <Button
                        variant="primary"
                        onClick={handleProcess}
                        disabled={isLoading || !input}
                      >
                        {isLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />{' '}
                            Processing...
                          </>
                        ) : isHashAlgorithm ? (
                          'Generate Hash'
                        ) : operation === 'encrypt' ? (
                          'Encrypt'
                        ) : (
                          'Decrypt'
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleClear}
                        disabled={isLoading}
                      >
                        Clear
                      </Button>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {output && (
                      <Form.Group>
                        <Form.Label>
                          {isHashAlgorithm
                            ? 'Hash Result'
                            : operation === 'encrypt'
                            ? 'Encrypted Text'
                            : 'Decrypted Text'}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={output}
                          readOnly
                        />
                        <div className="d-flex justify-content-end mt-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(output)}
                          >
                            <i className="bi bi-clipboard me-1"></i>
                            Copy to Clipboard
                          </Button>
                        </div>
                      </Form.Group>
                    )}
                  </Form>
                </Tab.Pane>

                {/* Learn Tab */}
                <Tab.Pane eventKey="learn">
                  <div>
                    <h5>{algorithm.toUpperCase()} - Overview</h5>
                    <p>{getAlgorithmDescription()}</p>
                    
                    <h6>Common Uses:</h6>
                    <p>{getAlgorithmUses()}</p>
                    
                    <Card className="mb-3 bg-light">
                      <Card.Body>
                        <h6 className="mb-3">Security Considerations:</h6>
                        {algorithm === 'aes' && (
                          <ul className="mb-0">
                            <li>Use a strong, random encryption key</li>
                            <li>AES-256 is preferred over AES-128 for sensitive data</li>
                            <li>Consider using authenticated encryption modes like GCM</li>
                            <li>Never reuse initialization vectors (IVs)</li>
                          </ul>
                        )}
                        
                        {algorithm === 'des' && (
                          <ul className="mb-0">
                            <li>DES is considered insecure due to small key size (56 bits)</li>
                            <li>Vulnerable to brute force attacks with modern computing power</li>
                            <li>Should not be used for new applications</li>
                            <li>Consider AES as a more secure alternative</li>
                          </ul>
                        )}
                        
                        {algorithm === 'rabbit' && (
                          <ul className="mb-0">
                            <li>Use a strong, random encryption key</li>
                            <li>Stream ciphers are vulnerable if keys are reused</li>
                            <li>Ensure proper key management</li>
                            <li>Less widely reviewed than AES</li>
                          </ul>
                        )}
                        
                        {algorithm === 'base64' && (
                          <ul className="mb-0">
                            <li>Base64 is NOT encryption - it provides no security</li>
                            <li>Anyone can decode Base64 without a key</li>
                            <li>Only use for encoding binary data for text-based protocols</li>
                            <li>Never use for hiding or protecting sensitive information</li>
                          </ul>
                        )}
                        
                        {algorithm === 'md5' && (
                          <ul className="mb-0">
                            <li>MD5 is cryptographically broken</li>
                            <li>Vulnerable to collision attacks</li>
                            <li>Should not be used for security purposes</li>
                            <li>Consider SHA-256 or SHA-3 for secure applications</li>
                          </ul>
                        )}
                        
                        {algorithm === 'sha1' && (
                          <ul className="mb-0">
                            <li>SHA-1 is cryptographically broken</li>
                            <li>Collision attacks are practical</li>
                            <li>Not recommended for security applications</li>
                            <li>Use SHA-256 or SHA-3 instead</li>
                          </ul>
                        )}
                        
                        {algorithm === 'sha256' && (
                          <ul className="mb-0">
                            <li>Currently considered secure for most applications</li>
                            <li>Always use salting when hashing passwords</li>
                            <li>Consider using specialized password hashing functions like Argon2 or bcrypt</li>
                            <li>SHA-256 alone is not suitable for password storage</li>
                          </ul>
                        )}
                        
                        {algorithm === 'sha512' && (
                          <ul className="mb-0">
                            <li>Provides stronger security than SHA-256</li>
                            <li>More computationally intensive</li>
                            <li>Always use salting when hashing passwords</li>
                            <li>Consider specialized password hashing functions like Argon2 or bcrypt</li>
                          </ul>
                        )}
                      </Card.Body>
                    </Card>
                    
                    <div className="alert alert-info">
                      <h6><i className="bi bi-info-circle me-2"></i>Educational Note</h6>
                      <p className="mb-0">
                        This tool is for educational purposes only. For real security applications, use established cryptographic libraries and consult with security professionals.
                      </p>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default EncryptionTools;
