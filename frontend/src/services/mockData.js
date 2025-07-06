/**
 * Mock data for development when backend is unavailable
 */

// Generate a UUID for consistent IDs
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Mock User Data
export const mockUsers = {
  admin: {
    id: generateUUID(),
    username: 'admin',
    email: 'admin@sadp.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    last_login: '2025-06-21T08:00:00Z'
  },
  instructor: {
    id: generateUUID(),
    username: 'instructor',
    email: 'instructor@sadp.com',
    first_name: 'Instructor',
    last_name: 'User',
    role: 'instructor',
    is_active: true,
    created_at: '2025-01-15T00:00:00Z',
    last_login: '2025-06-20T08:00:00Z'
  },
  user: {
    id: generateUUID(),
    username: 'user',
    email: 'user@sadp.com',
    first_name: 'Regular',
    last_name: 'User',
    role: 'user',
    is_active: true,
    created_at: '2025-02-01T00:00:00Z',
    last_login: '2025-06-19T08:00:00Z'
  }
};

// Mock Modules
export const mockModules = [
  {
    id: generateUUID(),
    name: 'SQL Injection',
    slug: 'sql-injection',
    description: 'Learn how to identify and prevent SQL injection vulnerabilities',
    difficulty: 'beginner',
    order_index: 1,
    is_active: true,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-05-15T00:00:00Z',
    lesson_count: 5
  },
  {
    id: generateUUID(),
    name: 'Cross-Site Scripting (XSS)',
    slug: 'cross-site-scripting',
    description: 'Understand how XSS attacks work and how to defend against them',
    difficulty: 'intermediate',
    order_index: 2,
    is_active: true,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-05-20T00:00:00Z',
    lesson_count: 4
  },
  {
    id: generateUUID(),
    name: 'Cross-Site Request Forgery (CSRF)',
    slug: 'csrf',
    description: 'Learn about CSRF vulnerabilities and prevention techniques',
    difficulty: 'intermediate',
    order_index: 3,
    is_active: true,
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-05-25T00:00:00Z',
    lesson_count: 3
  },
  {
    id: generateUUID(),
    name: 'Authentication Vulnerabilities',
    slug: 'authentication-vulnerabilities',
    description: 'Explore common authentication vulnerabilities and secure practices',
    difficulty: 'advanced',
    order_index: 4,
    is_active: true,
    created_at: '2025-01-25T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    lesson_count: 6
  }
];

// Mock Lessons for SQL Injection module
export const mockLessons = {
  'sql-injection': [
    {
      id: generateUUID(),
      module_id: mockModules[0].id,
      title: 'Introduction to SQL Injection',
      slug: 'introduction-to-sql-injection',
      description: 'Understanding the basics of SQL injection vulnerabilities',
      content_type: 'theory',
      content: JSON.stringify({
        blocks: [
          {
            type: 'paragraph',
            text: 'SQL injection is a code injection technique that exploits vulnerabilities in applications that interact with databases. It allows attackers to execute malicious SQL statements to gain unauthorized access to databases.'
          },
          {
            type: 'heading',
            level: 2,
            text: 'How SQL Injection Works'
          },
          {
            type: 'paragraph',
            text: 'SQL injection typically occurs when user input is incorrectly filtered or sanitized before being used in SQL statements. This allows attackers to insert malicious SQL code that can alter the intended behavior of the application\'s database queries.'
          }
        ]
      }),
      order_index: 1,
      is_active: true,
      created_at: '2025-01-10T00:00:00Z',
      updated_at: '2025-05-15T00:00:00Z',
    },
    {
      id: generateUUID(),
      module_id: mockModules[0].id,
      title: 'Types of SQL Injection Attacks',
      slug: 'types-of-sql-injection',
      description: 'Exploring different SQL injection attack techniques',
      content_type: 'theory',
      content: JSON.stringify({
        blocks: [
          {
            type: 'paragraph',
            text: 'There are several types of SQL injection techniques that attackers may use to exploit vulnerable applications.'
          },
          {
            type: 'heading',
            level: 2,
            text: 'Error-based SQL Injection'
          },
          {
            type: 'paragraph',
            text: 'Error-based SQL injection is a technique where attackers force the database to generate error messages that reveal information about the database structure or data.'
          }
        ]
      }),
      order_index: 2,
      is_active: true,
      created_at: '2025-01-11T00:00:00Z',
      updated_at: '2025-05-16T00:00:00Z',
    },
    {
      id: generateUUID(),
      module_id: mockModules[0].id,
      title: 'SQL Injection Prevention',
      slug: 'sql-injection-prevention',
      description: 'Best practices for preventing SQL injection vulnerabilities',
      content_type: 'theory',
      content: JSON.stringify({
        blocks: [
          {
            type: 'paragraph',
            text: 'Preventing SQL injection is essential for maintaining secure applications that interact with databases.'
          },
          {
            type: 'heading',
            level: 2,
            text: 'Parameterized Queries'
          },
          {
            type: 'paragraph',
            text: 'Parameterized queries, also known as prepared statements, are the most effective way to prevent SQL injection. They work by separating the SQL code from the data input.'
          }
        ]
      }),
      order_index: 3,
      is_active: true,
      created_at: '2025-01-12T00:00:00Z',
      updated_at: '2025-05-17T00:00:00Z',
    },
    {
      id: generateUUID(),
      module_id: mockModules[0].id,
      title: 'Practical SQL Injection Exercise',
      slug: 'sql-injection-exercise',
      description: 'Hands-on exercise to identify and fix SQL injection vulnerabilities',
      content_type: 'exercise',
      content: JSON.stringify({
        blocks: [
          {
            type: 'paragraph',
            text: 'In this exercise, you will practice identifying and fixing SQL injection vulnerabilities in a login form.'
          },
          {
            type: 'paragraph',
            text: 'Review the code and identify the vulnerability, then implement a fix using parameterized queries.'
          }
        ]
      }),
      order_index: 4,
      is_active: true,
      created_at: '2025-01-13T00:00:00Z',
      updated_at: '2025-05-18T00:00:00Z',
      exercise_id: generateUUID()
    }
  ]
};

// Mock Exercise for SQL Injection
export const mockExercise = {
  id: mockLessons['sql-injection'][3].exercise_id,
  lesson_id: mockLessons['sql-injection'][3].id,
  title: 'Fix SQL Injection in Login Function',
  description: 'Identify and fix the SQL injection vulnerability in the login function',
  instructions: 'Review the login function below that is vulnerable to SQL injection. Modify the code to use parameterized queries instead of string concatenation.',
  sandbox_config: {
    language: 'python',
    timeout: 30,
    memory_limit: 128,
    enable_network: false
  },
  initial_code: "def login(username, password):\n    # VULNERABLE CODE: Direct string concatenation\n    query = \"SELECT * FROM users WHERE username = '\" + username + \"' AND password = '\" + password + \"'\"\n    \n    # Execute query\n    cursor.execute(query)\n    user = cursor.fetchone()\n    \n    if user:\n        return True  # Login successful\n    else:\n        return False  # Login failed\n\n# Your task is to rewrite this function to prevent SQL injection",
  success_criteria: 'Use parameterized queries to prevent SQL injection',
  hints: 'Instead of concatenating the username and password directly into the SQL query, use placeholders (? or named parameters) and pass the values separately.',
  created_at: '2025-01-13T00:00:00Z',
  updated_at: '2025-05-18T00:00:00Z'
};

// Mock Code Snippets for SQL Injection lessons
export const mockCodeSnippets = [
  {
    id: generateUUID(),
    lesson_id: mockLessons['sql-injection'][0].id,
    title: 'Vulnerable Login Function',
    description: 'A simple login function vulnerable to SQL injection',
    vulnerable_code: "def login(username, password):\n    query = \"SELECT * FROM users WHERE username = '\" + username + \"' AND password = '\" + password + \"'\"\n    result = db.execute(query)\n    return result.fetchone() is not None",
    secure_code: "def login(username, password):\n    query = \"SELECT * FROM users WHERE username = ? AND password = ?\"\n    result = db.execute(query, (username, password))\n    return result.fetchone() is not None",
    language: 'python',
    explanation: 'The vulnerable code directly concatenates user input into the SQL query, allowing attackers to manipulate the query structure. The secure version uses parameterized queries with placeholders, which safely separates the SQL code from the data input.',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-05-15T00:00:00Z'
  },
  {
    id: generateUUID(),
    lesson_id: mockLessons['sql-injection'][2].id,
    title: 'SQL Injection in Search Feature',
    description: 'A product search function vulnerable to SQL injection',
    vulnerable_code: "function searchProducts(searchTerm) {\n    const query = \"SELECT * FROM products WHERE name LIKE '%\" + searchTerm + \"%' OR description LIKE '%\" + searchTerm + \"%'\";\n    return db.query(query);\n}",
    secure_code: "function searchProducts(searchTerm) {\n    const query = \"SELECT * FROM products WHERE name LIKE ? OR description LIKE ?\";\n    const params = [`%${searchTerm}%`, `%${searchTerm}%`];\n    return db.query(query, params);\n}",
    language: 'javascript',
    explanation: 'The vulnerable code directly interpolates the search term into the SQL query, which could allow an attacker to inject malicious SQL. The secure version uses parameterized queries with placeholders, preventing SQL injection by properly escaping the input.',
    created_at: '2025-01-12T00:00:00Z',
    updated_at: '2025-05-17T00:00:00Z'
  }
];

// Mock user progress data
export const mockProgress = {
  user: {
    moduleProgress: [
      {
        module: mockModules[0],
        total_lessons: 4,
        completed_lessons: 2,
        completion_percentage: 50,
        progress_details: [
          {
            lesson_id: mockLessons['sql-injection'][0].id,
            status: 'completed',
            score: null,
            attempts: 1,
            last_attempt_at: '2025-06-19T10:00:00Z',
            completed_at: '2025-06-19T10:05:00Z'
          },
          {
            lesson_id: mockLessons['sql-injection'][1].id,
            status: 'completed',
            score: null,
            attempts: 1,
            last_attempt_at: '2025-06-19T10:15:00Z',
            completed_at: '2025-06-19T10:25:00Z'
          },
          {
            lesson_id: mockLessons['sql-injection'][2].id,
            status: 'in_progress',
            score: null,
            attempts: 1,
            last_attempt_at: '2025-06-19T10:35:00Z',
            completed_at: null
          }
        ]
      },
      {
        module: mockModules[1],
        total_lessons: 4,
        completed_lessons: 0,
        completion_percentage: 0,
        progress_details: []
      }
    ]
  }
};

// Mock exercise submissions
export const mockSubmissions = {
  [mockExercise.id]: [
    {
      id: generateUUID(),
      user_id: mockUsers.user.id,
      exercise_id: mockExercise.id,
      submitted_code: "def login(username, password):\n    # SECURE CODE: Using parameterized queries\n    query = \"SELECT * FROM users WHERE username = ? AND password = ?\"\n    \n    # Execute query with parameters\n    cursor.execute(query, (username, password))\n    user = cursor.fetchone()\n    \n    if user:\n        return True  # Login successful\n    else:\n        return False  # Login failed",
      is_successful: true,
      feedback: 'Great job! You correctly used parameterized queries to prevent SQL injection.',
      execution_time: 0.45,
      created_at: '2025-06-19T11:05:00Z'
    },
    {
      id: generateUUID(),
      user_id: mockUsers.user.id,
      exercise_id: mockExercise.id,
      submitted_code: "def login(username, password):\n    # ATTEMPT: Escaping quotes but still vulnerable\n    username = username.replace(\"'\", \"''\")\n    password = password.replace(\"'\", \"''\")\n    query = \"SELECT * FROM users WHERE username = '\" + username + \"' AND password = '\" + password + \"'\"\n    \n    # Execute query\n    cursor.execute(query)\n    user = cursor.fetchone()\n    \n    if user:\n        return True  # Login successful\n    else:\n        return False  # Login failed",
      is_successful: false,
      feedback: 'While escaping quotes is a step in the right direction, it\'s not sufficient to prevent all SQL injection attacks. You should use parameterized queries instead.',
      execution_time: 0.42,
      created_at: '2025-06-19T11:00:00Z'
    }
  ]
};

// Helper function to simulate backend response delay
export const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Check if the backend API is available
export const isBackendAvailable = async () => {
  try {
    // Always return true to force using the backend instead of mock data
    return true;
    
    // Original check (commented out)
    /*
    const response = await fetch('/api/health-check', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Short timeout to quickly check if backend is reachable
      signal: AbortSignal.timeout(1000)
    });
    return response.ok;
    */
  } catch (error) {
    console.warn('Backend API not available, using mock data');
    return false;
  }
};
