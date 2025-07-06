import React from 'react';
import { Card, Alert, Table } from 'react-bootstrap';

const XSSPreventionDemo = () => {
  return (
    <div>
      <h3>XSS Prevention Guide</h3>
      <p>
        Cross-Site Scripting (XSS) attacks can be prevented through a combination of proper 
        input validation, output encoding, and security headers. This guide covers best practices
        for protecting your web applications from XSS vulnerabilities.
      </p>

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Defense in Depth Strategy</h4>
        </Card.Header>
        <Card.Body>
          <p>
            A comprehensive XSS prevention strategy should employ multiple layers of defense:
          </p>
          
          <h5 className="mt-4">1. Input Validation</h5>
          <p>
            Validate user input on the server side using an allow-list approach. Reject any input that 
            doesn't conform to the expected format, rather than trying to "fix" malicious input.
          </p>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// Example input validation for an email field
function isValidEmail(email) {
  // Use a strict regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Example input validation for a numeric field
function isValidNumber(value) {
  // Ensure it's a number and within acceptable range
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 100;
}`}
                </code>
              </pre>
            </Card.Body>
          </Card>

          <h5 className="mt-4">2. Output Encoding</h5>
          <p>
            Always encode user-supplied data before inserting it into HTML, JavaScript, CSS, 
            or URL contexts. Different contexts require different encoding methods.
          </p>
          
          <Table striped bordered hover className="mb-3">
            <thead>
              <tr>
                <th>Context</th>
                <th>Encoding Method</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HTML Body</td>
                <td>HTML Entity Encoding</td>
                <td><code>{"&lt;script&gt;"}</code> → <code>{"&amp;lt;script&amp;gt;"}</code></td>
              </tr>
              <tr>
                <td>HTML Attribute</td>
                <td>HTML Attribute Encoding</td>
                <td><code>{"x\" onclick=\"alert(1)"}</code> → <code>{"x&quot; onclick=&quot;alert(1)"}</code></td>
              </tr>
              <tr>
                <td>JavaScript</td>
                <td>JavaScript Encoding</td>
                <td><code>{"';alert(1);//"}</code> → <code>{"\\';\\u0061lert(1);//"}</code></td>
              </tr>
              <tr>
                <td>URL Parameters</td>
                <td>URL Encoding</td>
                <td><code>{"<script>"}</code> → <code>"%3Cscript%3E"</code></td>
              </tr>
              <tr>
                <td>CSS</td>
                <td>CSS Encoding</td>
                <td><code>{"{}*/"}</code> → <code>{"\\7B\\7D\\2A\\2F"}</code></td>
              </tr>
            </tbody>
          </Table>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// Example of context-aware encoding
function safeInsertUserData(data) {
  // For HTML body context
  const htmlElement = document.createElement('div');
  htmlElement.textContent = data;  // Automatic HTML encoding
  
  // For JavaScript context
  const script = document.createElement('script');
  script.textContent = \`const safeData = "\${data.replace(/[\\\\"\\'\\n\\r\\u2028\\u2029]/g, 
    char => \`\\\\u\${('0000' + char.charCodeAt(0).toString(16)).slice(-4)}\`)}"\`;
  
  // For URL context
  const url = \`https://example.com/search?q=\${encodeURIComponent(data)}\`;
}`}
                </code>
              </pre>
            </Card.Body>
          </Card>

          <h5 className="mt-4">3. Content Security Policy (CSP)</h5>
          <p>
            Implement Content Security Policy headers to control which resources can be loaded and executed by the browser.
          </p>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// Example CSP header
Content-Security-Policy: default-src 'self';
                       script-src 'self' https://trusted-cdn.com;
                       style-src 'self' https://trusted-cdn.com;
                       img-src 'self' https://trusted-cdn.com data:;
                       font-src 'self' https://trusted-cdn.com;
                       connect-src 'self' https://api.trusted-site.com;
                       frame-src 'none';
                       object-src 'none'`}
                </code>
              </pre>
            </Card.Body>
          </Card>

          <h5 className="mt-4">4. XSS Protection Headers</h5>
          <p>
            Modern browsers have built-in XSS protection mechanisms that can be controlled via HTTP headers:
          </p>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// X-XSS-Protection header (for legacy browsers)
X-XSS-Protection: 1; mode=block

// Note: Modern browsers rely more on CSP`}
                </code>
              </pre>
            </Card.Body>
          </Card>

          <h5 className="mt-4">5. HTML Sanitization</h5>
          <p>
            When you need to allow some HTML (e.g., rich text inputs), use a proper HTML sanitization library:
          </p>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// Example using DOMPurify
import DOMPurify from 'dompurify';

function renderUserHtml(userHtml) {
  // Sanitize HTML to remove dangerous elements and attributes
  const sanitizedHtml = DOMPurify.sanitize(userHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'target'], // Only allow specific attributes
    ALLOW_DATA_ATTR: false, // Disable data attributes
    USE_PROFILES: { html: true } // Use HTML profile
  });
  
  // Now safe to insert
  return sanitizedHtml;
}`}
                </code>
              </pre>
            </Card.Body>
          </Card>

          <h5 className="mt-4">6. Cookie Security</h5>
          <p>
            Secure cookies to prevent session hijacking via XSS:
          </p>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <pre className="mb-0">
                <code>
{`// Secure cookie settings
Set-Cookie: sessionid=abc123; Path=/; HttpOnly; Secure; SameSite=Strict`}
                </code>
              </pre>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header className="bg-warning">
          <h4 className="mb-0">Common Mistakes to Avoid</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <h5>Dangerous Practices</h5>
            <ol className="mb-0">
              <li>Using <code>innerHTML</code>, <code>outerHTML</code>, or <code>document.write()</code> with user input</li>
              <li>Handling JSON responses as HTML (e.g., using <code>eval()</code> on JSONP responses)</li>
              <li>Using <code>eval()</code>, <code>setTimeout()</code>, <code>setInterval()</code> with string arguments containing user input</li>
              <li>Directly embedding user input in JavaScript event handlers (e.g., <code>onclick</code>, <code>onerror</code>)</li>
              <li>Relying solely on client-side validation</li>
              <li>Using blacklist-based sanitization instead of allowlists</li>
              <li>Bypassing built-in framework protections (e.g., React's automatic encoding)</li>
            </ol>
          </Alert>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">Framework-Specific Prevention Techniques</h4>
        </Card.Header>
        <Card.Body>
          <h5>React</h5>
          <p>
            React automatically escapes values rendered in JSX, providing protection against most XSS attacks:
          </p>
          <pre>
            <code>
{`// Safe in React - values are automatically escaped
function UserGreeting({ name }) {
  return <div>Hello, {name}!</div>;  // name is safely escaped
}

// Dangerous - bypassing React's protections
function UnsafeRendering({ content }) {
  // Avoid dangerouslySetInnerHTML unless content is sanitized
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}`}
            </code>
          </pre>

          <h5 className="mt-3">Angular</h5>
          <p>
            Angular provides built-in XSS protection by automatically sanitizing HTML, styles, and URLs:
          </p>
          <pre>
            <code>
{`<!-- Safe in Angular - values are automatically escaped -->
<div>{{ userContent }}</div>

<!-- Dangerous - bypassing Angular's protections -->
<div [innerHTML]="userContent"></div>`}
            </code>
          </pre>

          <h5 className="mt-3">Vue</h5>
          <p>
            Vue automatically escapes HTML in templates but provides ways to bypass this protection:
          </p>
          <pre>
            <code>
{`<!-- Safe in Vue - values are automatically escaped -->
<div>{{ userContent }}</div>

<!-- Dangerous - bypassing Vue's protections -->
<div v-html="userContent"></div>`}
            </code>
          </pre>
        </Card.Body>
      </Card>
      
      <Alert variant="info" className="mt-4">
        <h4>Additional Resources</h4>
        <ul className="mb-0">
          <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP XSS Prevention Cheat Sheet</a></li>
          <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" target="_blank" rel="noopener noreferrer">MDN Content Security Policy</a></li>
          <li><a href="https://github.com/cure53/DOMPurify" target="_blank" rel="noopener noreferrer">DOMPurify - HTML Sanitization Library</a></li>
          <li><a href="https://www.w3.org/TR/html5/syntax.html#the-rules-for-writing-html-documents" target="_blank" rel="noopener noreferrer">HTML5 Specification - Character References</a></li>
        </ul>
      </Alert>
    </div>
  );
};

export default XSSPreventionDemo;
