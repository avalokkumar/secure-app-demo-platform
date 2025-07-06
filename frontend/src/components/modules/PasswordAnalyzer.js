import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ProgressBar, ListGroup, Badge } from 'react-bootstrap';

/**
 * Password Analyzer Component
 * 
 * Interactive tool to analyze password strength and security
 * with detailed feedback and recommendations
 */
const PasswordAnalyzer = () => {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [timeToBreak, setTimeToBreak] = useState('');

  // Analyze password whenever it changes
  useEffect(() => {
    analyzePassword(password);
  }, [password]);

  // Password strength analyzer
  const analyzePassword = (pass) => {
    // Reset if empty
    if (!pass) {
      setScore(0);
      setFeedback([]);
      setTimeToBreak('');
      return;
    }

    let newScore = 0;
    const newFeedback = [];

    // Length check (up to 40%)
    const lengthScore = Math.min(Math.floor(pass.length * 4), 40);
    newScore += lengthScore;
    
    if (pass.length < 8) {
      newFeedback.push({
        type: 'danger',
        message: 'Password is too short (minimum 8 characters recommended)',
      });
    } else if (pass.length >= 12) {
      newFeedback.push({
        type: 'success',
        message: 'Good password length',
      });
    } else {
      newFeedback.push({
        type: 'warning',
        message: 'Consider using a longer password (12+ characters recommended)',
      });
    }

    // Check for numbers (10%)
    const hasNumber = /[0-9]/.test(pass);
    if (hasNumber) {
      newScore += 10;
      newFeedback.push({
        type: 'success',
        message: 'Contains numbers',
      });
    } else {
      newFeedback.push({
        type: 'warning',
        message: 'Add numbers for stronger password',
      });
    }

    // Check for special characters (15%)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass);
    if (hasSpecial) {
      newScore += 15;
      newFeedback.push({
        type: 'success',
        message: 'Contains special characters',
      });
    } else {
      newFeedback.push({
        type: 'warning',
        message: 'Add special characters for stronger password',
      });
    }

    // Check for mixed case (15%)
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    if (hasUppercase && hasLowercase) {
      newScore += 15;
      newFeedback.push({
        type: 'success',
        message: 'Contains mixed case letters',
      });
    } else {
      newFeedback.push({
        type: 'warning',
        message: 'Add both uppercase and lowercase letters',
      });
    }

    // Check for common patterns (negative 20%)
    const hasCommonPattern = /password|123456|qwerty|admin|welcome|letmein/i.test(pass);
    if (hasCommonPattern) {
      newScore = Math.max(0, newScore - 20);
      newFeedback.push({
        type: 'danger',
        message: 'Contains common password patterns',
      });
    }

    // Check for sequences (negative 10%)
    const hasSequence = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789/i.test(pass);
    if (hasSequence) {
      newScore = Math.max(0, newScore - 10);
      newFeedback.push({
        type: 'danger',
        message: 'Contains sequential patterns (abc, 123, etc.)',
      });
    }

    // Additional security checks (positive 20%)
    const hasGoodLength = pass.length >= 12;
    const hasGoodVariety = hasNumber && hasSpecial && hasUppercase && hasLowercase;
    if (hasGoodLength && hasGoodVariety && !hasCommonPattern && !hasSequence) {
      newScore += 20;
      newFeedback.push({
        type: 'success',
        message: 'Excellent password complexity',
      });
    }

    // Cap score at 100%
    newScore = Math.min(newScore, 100);
    setScore(newScore);
    setFeedback(newFeedback);

    // Calculate estimated time to break
    calculateBreakTime(pass, newScore);
  };

  // Estimate time to crack the password based on score and complexity
  const calculateBreakTime = (pass, passwordScore) => {
    if (!pass) {
      setTimeToBreak('');
      return;
    }

    let time;
    const length = pass.length;
    const hasComplex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass) &&
                      /[A-Z]/.test(pass) && 
                      /[a-z]/.test(pass) && 
                      /[0-9]/.test(pass);

    if (passwordScore < 20) {
      time = 'Instantly';
    } else if (passwordScore < 40) {
      time = length < 8 ? 'Minutes to hours' : 'Hours to days';
    } else if (passwordScore < 60) {
      time = hasComplex ? 'Weeks to months' : 'Days to weeks';
    } else if (passwordScore < 80) {
      time = hasComplex ? 'Years to decades' : 'Months to years';
    } else {
      time = length > 12 && hasComplex ? 'Centuries' : 'Decades to centuries';
    }

    setTimeToBreak(time);
  };

  // Get color variant based on score
  const getScoreVariant = () => {
    if (score < 20) return 'danger';
    if (score < 40) return 'warning';
    if (score < 60) return 'info';
    if (score < 80) return 'primary';
    return 'success';
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset the form
    setPassword('');
  };

  // Generate a secure password
  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let newPassword = '';
    
    // Ensure we have at least one character from each category
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 52)];
    newPassword += '0123456789'[Math.floor(Math.random() * 10)];
    newPassword += '!@#$%^&*()_+~`|}{[]:;?><,./-='[Math.floor(Math.random() * 29)];
    
    // Fill the rest randomly
    for (let i = 3; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(newPassword);
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Password Strength Analyzer</h5>
        <Button variant="outline-secondary" size="sm" onClick={generatePassword}>
          Generate Secure Password
        </Button>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Enter a password to check its strength</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to analyze"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
            </div>
            <Form.Text className="text-muted">
              We don't store your password. All analysis is done in your browser.
            </Form.Text>
          </Form.Group>

          {password && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <div>Password Strength</div>
                <div>{score}%</div>
              </div>
              <ProgressBar
                now={score}
                variant={getScoreVariant()}
                className="mb-2"
              />
              {timeToBreak && (
                <div className="text-end text-muted small">
                  <i className="bi bi-clock me-1"></i>
                  Estimated time to crack: <strong>{timeToBreak}</strong>
                </div>
              )}
            </div>
          )}

          {feedback.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">Analysis Results:</h6>
              <ListGroup>
                {feedback.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-center py-2"
                    variant={item.type}
                  >
                    <i className={`bi bi-${item.type === 'success' ? 'check-circle' : item.type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
                    {item.message}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {password && score >= 80 && (
            <div className="p-3 bg-success bg-opacity-10 border border-success rounded mb-3">
              <h6 className="text-success">
                <i className="bi bi-shield-check me-2"></i>
                Great Password!
              </h6>
              <p className="mb-0">
                This password is strong and would be difficult for attackers to crack.
              </p>
            </div>
          )}

          {password && score > 0 && score < 40 && (
            <div className="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-3">
              <h6 className="text-danger">
                <i className="bi bi-shield-exclamation me-2"></i>
                Weak Password!
              </h6>
              <p className="mb-0">
                This password is vulnerable and could be easily compromised. Consider using a stronger password.
              </p>
            </div>
          )}

          <div className="mt-4">
            <h6 className="mb-3">Best Practices for Secure Passwords:</h6>
            <ListGroup variant="flush">
              <ListGroup.Item className="py-2">
                <Badge bg="primary" className="me-2">1</Badge>
                Use at least 12-16 characters
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Badge bg="primary" className="me-2">2</Badge>
                Mix uppercase, lowercase, numbers and special characters
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Badge bg="primary" className="me-2">3</Badge>
                Avoid dictionary words, names, and common patterns
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Badge bg="primary" className="me-2">4</Badge>
                Don't reuse passwords across different accounts
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Badge bg="primary" className="me-2">5</Badge>
                Consider using a password manager
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PasswordAnalyzer;
