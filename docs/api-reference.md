# SADP API Reference

This document provides a comprehensive reference for all available API endpoints in the Secure Application Demo Platform (SADP).

## Base URL

All API requests should be prefixed with:

```
http://localhost:5001/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses are in JSON format. Successful responses typically include relevant data and a status code in the 2xx range. Error responses include an error message and an appropriate status code.

---

## Authentication Endpoints

### Login

Authenticates a user and returns access and refresh tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "message": "Login successful",
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string",
    "is_active": true,
    "created_at": "string",
    "last_login": "string"
  }
}
```

**Error Responses:**

- **Code:** 400 Bad Request
  - **Content:** `{"message": "Missing required fields"}`
- **Code:** 401 Unauthorized
  - **Content:** `{"message": "Invalid credentials"}`
- **Code:** 403 Forbidden
  - **Content:** `{"message": "Account is inactive"}`

### Register

Creates a new user account.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Success Response:**

- **Code:** 201 Created
- **Content:**

```json
{
  "message": "Registration successful",
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string",
    "is_active": true,
    "created_at": "string",
    "last_login": null
  }
}
```

**Error Responses:**

- **Code:** 400 Bad Request
  - **Content:** `{"message": "Missing required fields"}`
- **Code:** 409 Conflict
  - **Content:** `{"message": "Username already in use"}` or `{"message": "Email already in use"}`

### Refresh Token

Refreshes an expired access token using a valid refresh token.

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Auth Required:** Yes (Refresh token)

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "message": "Token refresh successful",
  "access_token": "string"
}
```

**Error Response:**

- **Code:** 401 Unauthorized
  - **Content:** `{"message": "Invalid refresh token"}`

### Logout

Invalidates the current user session.

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Auth Required:** Yes

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response:**

- **Code:** 200 OK
- **Content:** `{"message": "Successfully logged out"}`

---

## User Endpoints

### Get User Details

Retrieves details for a specific user.

- **URL:** `/users/<user_id>`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `user_id` - UUID of the user

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "string",
  "is_active": true,
  "created_at": "string",
  "last_login": "string"
}
```

**Error Responses:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "User not found"}`
- **Code:** 403 Forbidden
  - **Content:** `{"message": "Access denied"}`

### List Users

Retrieves a paginated list of users (admin only).

- **URL:** `/users`
- **Method:** `GET`
- **Auth Required:** Yes (Admin role)

**Query Parameters:**

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20)

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "role": "string",
      "is_active": true,
      "created_at": "string",
      "last_login": "string"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 100
  }
}
```

**Error Response:**

- **Code:** 403 Forbidden
  - **Content:** `{"message": "Access denied"}`

---

## Module Endpoints

### Get Module

Retrieves details for a specific module.

- **URL:** `/modules/<module_id>`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `module_id` - UUID of the module

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "difficulty": "string",
  "order_index": 1,
  "is_active": true,
  "created_at": "string",
  "updated_at": "string",
  "lesson_count": 5
}
```

**Error Response:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "Module not found"}`

### List Modules

Retrieves a paginated list of modules.

- **URL:** `/modules`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 9)
- `difficulty` - Filter by difficulty (optional)

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "difficulty": "string",
      "order_index": 1,
      "is_active": true,
      "created_at": "string",
      "updated_at": "string",
      "lesson_count": 5
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 9,
    "total_pages": 2,
    "total_items": 15
  }
}
```

---

## Lesson Endpoints

### Get Lesson

Retrieves details for a specific lesson.

- **URL:** `/lessons/<lesson_id>`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `lesson_id` - UUID of the lesson

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "id": "string",
  "module_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "content_type": "string",
  "content": {
    "blocks": [
      {
        "type": "string",
        "text": "string",
        "level": 2
      }
    ]
  },
  "order_index": 1,
  "is_active": true,
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "Lesson not found"}`

### List Module Lessons

Retrieves lessons for a specific module.

- **URL:** `/modules/<module_id>/lessons`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `module_id` - UUID of the module

**Query Parameters:**

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20)

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "data": [
    {
      "id": "string",
      "module_id": "string",
      "title": "string",
      "slug": "string",
      "description": "string",
      "content_type": "string",
      "order_index": 1,
      "is_active": true,
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "total_items": 5
  }
}
```

**Error Response:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "Module not found"}`

---

## Exercise Endpoints

### Get Exercise

Retrieves details for a specific exercise.

- **URL:** `/exercises/<exercise_id>`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `exercise_id` - UUID of the exercise

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "id": "string",
  "lesson_id": "string",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "starter_code": "string",
  "expected_output": "string",
  "hints": [
    "string"
  ],
  "difficulty": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Response:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "Exercise not found"}`

### Submit Exercise Solution

Submits a solution for an exercise.

- **URL:** `/exercises/<exercise_id>/submit`
- **Method:** `POST`
- **Auth Required:** Yes

**URL Parameters:**

- `exercise_id` - UUID of the exercise

**Request Body:**

```json
{
  "code": "string"
}
```

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "success": true,
  "score": 100,
  "feedback": "Great job! Your solution passes all test cases."
}
```

**Error Responses:**

- **Code:** 400 Bad Request
  - **Content:** `{"message": "Missing solution code"}`
- **Code:** 404 Not Found
  - **Content:** `{"message": "Exercise not found"}`

---

## Progress Tracking Endpoints

### Get User Progress

Retrieves progress for a specific user.

- **URL:** `/progress/user/<user_id>`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**

- `user_id` - UUID of the user

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "user_id": "string",
  "modules": [
    {
      "module_id": "string",
      "module_name": "string",
      "total_lessons": 5,
      "completed_lessons": 3,
      "completion_percentage": 60
    }
  ],
  "total_modules": 3,
  "completed_modules": 1,
  "overall_completion": 33.33
}
```

**Error Response:**

- **Code:** 404 Not Found
  - **Content:** `{"message": "User not found"}`

### Get Lesson Progress

Retrieves progress statistics for a specific lesson.

- **URL:** `/progress/lesson/<lesson_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Admin or Instructor only)

**URL Parameters:**

- `lesson_id` - UUID of the lesson

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "lesson_id": "string",
  "lesson_title": "string",
  "total_attempts": 50,
  "completion_rate": 80,
  "average_score": 85.5
}
```

**Error Responses:**

- **Code:** 403 Forbidden
  - **Content:** `{"message": "Access denied"}`
- **Code:** 404 Not Found
  - **Content:** `{"message": "Lesson not found"}`
