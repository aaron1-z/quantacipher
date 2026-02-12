# Testing Guide

This document provides comprehensive testing instructions and guidelines for the Quantacipher project.

## Table of Contents

- [Overview](#overview)
- [Manual Testing](#manual-testing)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [API Testing](#api-testing)
- [Security Testing](#security-testing)
- [Performance Testing](#performance-testing)
- [Testing Best Practices](#testing-best-practices)
- [Future Testing Implementation](#future-testing-implementation)

## Overview

Currently, Quantacipher relies primarily on manual testing. This guide provides systematic approaches to test all application functionality and ensure reliability.

## Manual Testing

### Prerequisites

Before testing, ensure you have:

1. **Development Environment Set Up**
   ```bash
   # Backend setup
   cd backend
   npm install
   npm run dev

   # Frontend setup (in another terminal)
   cd frontend
   npm install
   npm run dev
   ```

2. **MongoDB Running**
   - Local MongoDB instance, or
   - MongoDB Atlas connection configured

3. **Environment Variables Configured**
   - Backend `.env` file with proper MongoDB URI and JWT secret
   - Frontend `.env` file with correct API base URL

### Core Functionality Testing

#### 1. User Authentication Testing

**Registration Flow:**
```bash
# Test Case 1: Successful Registration
1. Navigate to http://localhost:5173/register
2. Fill in valid user details:
   - Username: testuser
   - Email: test@example.com
   - Password: SecurePass123
3. Submit form
4. Verify: Success message and redirect to dashboard/home

# Test Case 2: Duplicate Email Registration
1. Try to register with the same email again
2. Verify: Error message "User already exists"

# Test Case 3: Invalid Input Validation
1. Try registration with:
   - Empty fields
   - Invalid email format
   - Weak password
2. Verify: Appropriate validation errors
```

**Login Flow:**
```bash
# Test Case 1: Successful Login
1. Navigate to http://localhost:5173/login
2. Enter valid credentials
3. Submit form
4. Verify: Success message and redirect to dashboard

# Test Case 2: Invalid Credentials
1. Try login with wrong password
2. Verify: Error message "Invalid credentials"

# Test Case 3: Non-existent User
1. Try login with unregistered email
2. Verify: Error message "Invalid credentials"
```

#### 2. Data Storage Testing

**Store Data Flow:**
```bash
# Test Case 1: Successful Data Storage
1. Login to the application
2. Navigate to /store page
3. Enter test data:
   - Key: "test-key-1"
   - Value: "This is test data"
4. Submit form
5. Verify: Success message and data appears in list

# Test Case 2: Empty Fields Validation
1. Try to submit with empty key or value
2. Verify: Validation error messages

# Test Case 3: Large Data Storage
1. Try storing data with very long strings
2. Verify: Data is stored correctly or appropriate limits enforced
```

**Retrieve Data Flow:**
```bash
# Test Case 1: Successful Data Retrieval
1. Navigate to /retrieve page while logged in
2. Verify: All previously stored data is displayed

# Test Case 2: Empty Data State
1. With a new user account (no stored data)
2. Navigate to /retrieve page
3. Verify: Appropriate "no data" message

# Test Case 3: Data Integrity
1. Compare stored vs. retrieved data
2. Verify: All data matches exactly
```

#### 3. Navigation and UI Testing

```bash
# Test Case 1: Navigation Bar
1. Test all navigation links:
   - Home (/)
   - About (/about)
   - Store (/store)
   - Retrieve (/retrieve)
   - Login (/login)
   - Register (/register)
2. Verify: All pages load correctly

# Test Case 2: Protected Routes
1. Try accessing /store and /retrieve without login
2. Verify: Redirect to login page or access denied

# Test Case 3: Responsive Design
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. Verify: UI adapts appropriately
```

## Backend Testing

### API Endpoint Testing

You can test API endpoints directly using curl or a tool like Postman:

#### Authentication Endpoints

```bash
# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Expected: 201 status with JWT token

# Login User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Expected: 200 status with JWT token
```

#### Data Storage Endpoints

```bash
# Store Data (replace TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "key": "test-key",
    "value": "test-value"
  }'

# Expected: 201 status with success message

# Retrieve Data
curl -X GET http://localhost:5000/api/retrieve/retrieve \
  -H "Authorization: Bearer TOKEN"

# Expected: 200 status with array of data
```

### Database Testing

```bash
# Test Case 1: MongoDB Connection
1. Start the backend server
2. Check console for "MongoDB connected" message
3. If connection fails, verify MONGODB_URI in .env

# Test Case 2: Data Persistence
1. Store data via API
2. Restart the backend server
3. Retrieve data via API
4. Verify: Data persists after restart

# Test Case 3: Data Validation
1. Try storing invalid data (missing fields)
2. Verify: Proper validation errors returned
```

## Frontend Testing

### Component Testing

#### Forms Testing
```bash
# Test Case 1: Form Validation
1. Test each form with:
   - Valid inputs
   - Empty fields
   - Invalid data formats
2. Verify: Appropriate validation messages

# Test Case 2: Loading States
1. Submit forms and observe loading states
2. Verify: Loading indicators appear/disappear correctly

# Test Case 3: Error Handling
1. Disconnect backend or cause server errors
2. Submit forms
3. Verify: Error messages display properly
```

#### State Management Testing
```bash
# Test Case 1: Authentication State
1. Login and verify token is stored in localStorage
2. Refresh page and verify user stays logged in
3. Logout and verify token is removed

# Test Case 2: Data State
1. Store data and verify it appears in UI immediately
2. Navigate between pages
3. Verify: Data state persists during navigation
```

### Browser Compatibility Testing

Test on multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

```bash
# Test Case 1: Core Functionality
1. Test login/register on each browser
2. Test data store/retrieve operations
3. Verify: All functions work consistently

# Test Case 2: UI Consistency
1. Check visual consistency across browsers
2. Test responsive design on each browser
3. Verify: No layout issues
```

## API Testing

### Using Postman

1. **Import Collection**
   - Create a new collection "Quantacipher API"
   - Add requests for all endpoints

2. **Environment Variables**
   ```
   baseUrl: http://localhost:5000/api
   token: (to be set after login)
   ```

3. **Test Scenarios**
   - Authentication flow (register → login → store → retrieve)
   - Error cases (invalid input, unauthorized access)
   - Edge cases (empty data, large payloads)

### Using Automated Scripts

Create a test script to verify API functionality:

```javascript
// test-api.js
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const api = axios.create({ baseURL });

async function testAPI() {
  try {
    console.log('Testing user registration...');
    const registerRes = await api.post('/auth/register', {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'SecurePass123'
    });
    console.log('✓ Registration successful');
    
    const token = registerRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('Testing data storage...');
    const storeRes = await api.post('/store/store', {
      key: 'test-key',
      value: 'test-value'
    });
    console.log('✓ Data storage successful');
    
    console.log('Testing data retrieval...');
    const retrieveRes = await api.get('/retrieve/retrieve');
    console.log('✓ Data retrieval successful');
    console.log(`Retrieved ${retrieveRes.data.data.length} items`);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

Run the test:
```bash
node test-api.js
```

## Security Testing

### Authentication Security

```bash
# Test Case 1: JWT Token Validation
1. Try accessing protected routes without token
2. Try with invalid/expired tokens
3. Verify: Proper 401 responses

# Test Case 2: Password Security
1. Verify passwords are hashed in database
2. Test password requirements enforcement
3. Check for password in API responses (should not be present)

# Test Case 3: CORS Testing
1. Make requests from different origins
2. Verify: CORS policy is properly enforced
```

### Input Validation Testing

```bash
# Test Case 1: SQL Injection Attempts
1. Try injecting MongoDB query operators in inputs
2. Verify: Inputs are properly sanitized

# Test Case 2: XSS Prevention
1. Try storing HTML/JavaScript in data fields
2. Verify: Content is properly escaped in UI

# Test Case 3: Input Length Limits
1. Test extremely long strings in all fields
2. Verify: Appropriate limits are enforced
```

## Performance Testing

### Load Testing

```bash
# Test Case 1: Concurrent Users
1. Simulate multiple users logging in simultaneously
2. Measure response times
3. Verify: System handles load gracefully

# Test Case 2: Data Volume
1. Store large amounts of data
2. Test retrieval performance
3. Verify: Acceptable response times maintained
```

### Frontend Performance

```bash
# Test Case 1: Bundle Size
1. Run `npm run build` in frontend
2. Check bundle size in dist folder
3. Verify: Reasonable bundle sizes

# Test Case 2: Loading Performance
1. Use browser dev tools to measure:
   - First Contentful Paint
   - Time to Interactive
   - Largest Contentful Paint
2. Verify: Good performance metrics
```

## Testing Best Practices

### General Guidelines

1. **Test Early and Often**
   - Test after each feature implementation
   - Don't wait until the end to test

2. **Test All User Flows**
   - Happy path scenarios
   - Error cases
   - Edge cases

3. **Document Test Results**
   - Keep track of what's been tested
   - Note any issues found
   - Record test data used

4. **Environment Consistency**
   - Test in environments similar to production
   - Use consistent test data
   - Document environment setup

### Test Data Management

```bash
# Create consistent test data
{
  "users": [
    {
      "username": "testuser1",
      "email": "test1@example.com",
      "password": "SecurePass123"
    },
    {
      "username": "testuser2", 
      "email": "test2@example.com",
      "password": "SecurePass123"
    }
  ],
  "testData": [
    {
      "key": "sample-key-1",
      "value": "Sample value 1"
    },
    {
      "key": "sample-key-2",
      "value": "Sample value 2"
    }
  ]
}
```

## Future Testing Implementation

### Planned Testing Infrastructure

1. **Backend Unit Tests**
   ```bash
   # Jest + Supertest
   npm install --save-dev jest supertest
   
   # Example test structure
   tests/
   ├── unit/
   │   ├── controllers/
   │   ├── models/
   │   └── utils/
   ├── integration/
   │   └── api/
   └── fixtures/
       └── testData.js
   ```

2. **Frontend Testing**
   ```bash
   # Jest + React Testing Library
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   
   # Example test structure
   src/
   ├── __tests__/
   │   ├── components/
   │   ├── pages/
   │   └── utils/
   └── test-utils/
       └── testHelpers.js
   ```

3. **End-to-End Testing**
   ```bash
   # Playwright or Cypress
   npm install --save-dev @playwright/test
   
   # Example E2E test structure
   e2e/
   ├── tests/
   │   ├── auth.spec.js
   │   ├── store.spec.js
   │   └── retrieve.spec.js
   └── fixtures/
   ```

### CI/CD Integration

Future pipeline will include:
- Automated linting
- Unit test execution
- Integration test execution
- Security scanning
- Performance benchmarking

## Troubleshooting Common Issues

### Backend Issues

```bash
# MongoDB Connection Issues
- Check MONGODB_URI in .env
- Verify MongoDB is running
- Check network connectivity

# JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Validate token format
```

### Frontend Issues

```bash
# API Connection Issues
- Check VITE_API_BASE_URL
- Verify backend is running
- Check CORS configuration

# Build Issues
- Clear node_modules and reinstall
- Check for dependency conflicts
- Verify Node.js version compatibility
```

---

For more information, see the [API Documentation](./API.md) or [Contributing Guidelines](./CONTRIBUTING.md).