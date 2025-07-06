# Authentication API

This document describes the authentication API endpoints for the LapFutsal application.

## Base URL

All API endpoints are prefixed with `/api/auth`.

## Endpoints

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer" // optional, defaults to 'customer'
}
```

**Success Response (201 Created):**
```json
{
  "user": {
    "_id": "60d5ec9f5823f01b7ce5f3f3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2023-06-27T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "_id": "60d5ec9f5823f01b7ce5f3f3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2023-06-27T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "_id": "60d5ec9f5823f01b7ce5f3f3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2023-06-27T10:00:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Email already in use"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 500 Internal Server Error
```json
{
  "message": "Registration failed",
  "error": "Error message details"
}
```

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Authentication Flow

1. User registers with name, email, and password
2. Server creates a new user and returns a JWT token
3. Client stores the token (typically in localStorage or httpOnly cookie)
4. For subsequent requests, client includes the token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```
5. Server verifies the token on protected routes and grants access if valid
