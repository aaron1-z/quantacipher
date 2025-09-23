# API Documentation

This document provides comprehensive documentation for the Quantacipher API endpoints.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
```

## Authentication

Quantacipher uses JWT (JSON Web Tokens) for authentication. After successful login or registration, include the token in the Authorization header for protected routes.

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

### Common HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Invalid or missing authentication
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "message": "User already exists"
}
```

### Login User

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "message": "Invalid credentials"
}
```

## Data Storage Endpoints

### Store Data

Store encrypted data securely.

**Endpoint:** `POST /store/store`

**Authentication:** Required

**Request Body:**
```json
{
  "key": "string",
  "value": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "key": "mySecretData",
    "value": "This is my encrypted data"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Data stored successfully",
  "data": {
    "_id": "64f8b1234567890abcdef123",
    "key": "mySecretData",
    "value": "This is my encrypted data",
    "__v": 0
  }
}
```

**Error Response (401):**
```json
{
  "message": "Access denied. No token provided."
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "An error occurred while storing data",
  "error": "Validation error: key is required"
}
```

## Data Retrieval Endpoints

### Retrieve Data

Retrieve all stored data for the authenticated user.

**Endpoint:** `GET /retrieve/retrieve`

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/retrieve/retrieve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8b1234567890abcdef123",
      "key": "mySecretData",
      "value": "This is my encrypted data",
      "__v": 0
    },
    {
      "_id": "64f8b1234567890abcdef124",
      "key": "anotherKey",
      "value": "Another piece of data",
      "__v": 0
    }
  ]
}
```

**Error Response (401):**
```json
{
  "message": "Access denied. No token provided."
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "An error occurred while retrieving data",
  "error": "Database connection error"
}
```

## Data Models

### User Model

```javascript
{
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}
```

### Data Model

```javascript
{
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
}
```

## Frontend API Integration

### Using Axios (Recommended)

The frontend includes a pre-configured Axios instance at `frontend/src/api.js`:

```javascript
import api from '../api';

// Login
const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

// Store data
const storeData = async (key, value) => {
  try {
    const response = await api.post('/store/store', { key, value });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Store operation failed';
  }
};

// Retrieve data
const retrieveData = async () => {
  try {
    const response = await api.get('/retrieve/retrieve');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Retrieve operation failed';
  }
};
```

### Token Management

The Axios instance automatically:
- Adds JWT token to requests when available
- Redirects to login on 401 responses
- Handles token storage/removal

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing:

- Request rate limiting per IP
- User-specific rate limiting
- API key authentication for additional security

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Expiration**: JWT tokens should have reasonable expiration times
3. **Password Security**: Passwords are hashed using bcryptjs
4. **CORS**: Configure CORS appropriately for your domain
5. **Input Validation**: Validate all input data on the server side
6. **SQL Injection**: MongoDB queries should use proper validation

## Testing the API

### Using cURL

All examples above use cURL commands. Replace `localhost:5000` with your actual API URL.

### Using Postman

1. Import the following collection structure:
   - Auth folder: Register, Login
   - Store folder: Store Data
   - Retrieve folder: Retrieve Data

2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: `{{token}}` (auto-populated after login)

### Testing Authentication Flow

1. Register a new user
2. Login with credentials to get token
3. Store some data using the token
4. Retrieve the stored data

## Environment Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/quantacipher

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Development
VITE_NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend domain
2. **401 Unauthorized**: Check if JWT token is included in requests
3. **500 Server Error**: Check MongoDB connection and server logs
4. **Network Errors**: Verify API base URL configuration

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=app:*
NODE_ENV=development
```

---

For more information, see the main [README.md](./README.md) or [Contributing Guidelines](./CONTRIBUTING.md).