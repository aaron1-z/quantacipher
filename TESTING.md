# QuantaCipher Testing Guide

This document provides comprehensive instructions for manually testing the encryption, storage, and retrieval functionality of QuantaCipher.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)  
3. [Backend API Testing](#backend-api-testing)
4. [Frontend UI Testing](#frontend-ui-testing)
5. [Automated Test Execution](#automated-test-execution)
6. [Security Testing](#security-testing)
7. [Error Handling Testing](#error-handling-testing)
8. [Performance Testing](#performance-testing)

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (v6.0 or higher) or MongoDB Atlas access
- Git
- Postman or similar API testing tool (optional)
- Modern web browser (Chrome, Firefox, Safari)

### Required Knowledge
- Basic understanding of REST APIs
- Familiarity with JSON format
- Basic JavaScript knowledge
- Understanding of authentication tokens (JWT)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/aaron1-z/quantacipher.git
cd quantacipher

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend Setup (.env file):**
```bash
cd backend
cp .env.example .env  # Create from example if available
```

**Required environment variables:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### 3. Start Services

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Server should start on http://localhost:5000

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend  
npm run dev
```
Frontend should start on http://localhost:3000

### 4. Verify Setup

- Backend: Visit http://localhost:5000 - should show API status
- Frontend: Visit http://localhost:3000 - should show the application
- Database: Ensure MongoDB is connected (check backend console logs)

## Backend API Testing

### Authentication Testing

#### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Test Data:**
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "securepassword123"
}
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token for subsequent requests!**

### Data Storage Testing

#### 3. Store Encrypted Data

**Endpoint:** `POST /api/store/store`

**Test Data:**
```json
{
  "key": "personal_notes",
  "value": "This is my secret information"
}
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "key": "personal_notes", 
    "value": "This is my secret information"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Data stored successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6789abc123",
    "key": "personal_notes",
    "value": "This is my secret information",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Store Multiple Data Items

Test storing different types of data:

**Test Case 1 - JSON Data:**
```json
{
  "key": "user_preferences",
  "value": "{\"theme\":\"dark\",\"notifications\":true}"
}
```

**Test Case 2 - Sensitive Personal Data:**
```json
{
  "key": "payment_info",
  "value": "Credit Card: **** **** **** 1234, Exp: 12/25"
}
```

**Test Case 3 - Large Text Data:**
```json
{
  "key": "document_content",
  "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit... (large text block)"
}
```

### Data Retrieval Testing

#### 5. Retrieve All Data

**Endpoint:** `GET /api/retrieve/retrieve`

**Using curl:**
```bash
curl -X GET http://localhost:5000/api/retrieve/retrieve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1b2c3d4e5f6789abc123",
      "key": "personal_notes",
      "value": "This is my secret information",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "64f1b2c3d4e5f6789abc124", 
      "key": "user_preferences",
      "value": "{\"theme\":\"dark\",\"notifications\":true}",
      "createdAt": "2024-01-01T00:01:00.000Z"
    }
  ]
}
```

### Error Testing

#### 6. Test Unauthorized Access

**Without Authorization Header:**
```bash
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -d '{
    "key": "test",
    "value": "test"
  }'
```

**Expected Response:** `401 Unauthorized`

#### 7. Test Invalid JWT Token

**With Invalid Token:**
```bash
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_here" \
  -d '{
    "key": "test", 
    "value": "test"
  }'
```

**Expected Response:** `400 Bad Request` with "Token is not valid"

#### 8. Test Missing Required Fields

**Missing Key:**
```bash
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "value": "test value"
  }'
```

**Expected Response:** `500 Internal Server Error` (validation error)

## Frontend UI Testing

### User Registration and Login Testing

#### 9. Registration Form Testing

**Test Steps:**
1. Navigate to http://localhost:3000/register
2. Fill in the registration form:
   - Username: testuser2
   - Email: test2@example.com
   - Password: securepassword123
3. Click "Register" button
4. Verify successful registration (should redirect or show success)

**Edge Cases to Test:**
- Empty fields (should show validation errors)
- Invalid email format (should show error)
- Weak password (should show error)
- Existing email (should show "User already exists")

#### 10. Login Form Testing

**Test Steps:**
1. Navigate to http://localhost:3000/login
2. Fill in the login form:
   - Email: test2@example.com
   - Password: securepassword123
3. Click "Login" button
4. Verify successful login (should redirect to dashboard/store page)

**Edge Cases to Test:**
- Wrong password (should show "Invalid credentials")
- Non-existent email (should show "Invalid credentials")
- Empty fields (should show validation errors)

### Data Storage UI Testing

#### 11. Store Page Testing

**Test Steps:**
1. Navigate to http://localhost:3000/store
2. Verify the page loads with:
   - "Data Store" heading
   - Input field with "New Item" placeholder
   - "Add Item" button
   - Loading indicator initially (if applicable)

#### 12. Add New Data Items

**Test Case 1 - Basic Text:**
1. Enter "My first secret note" in the input field
2. Click "Add Item" button
3. Verify:
   - Input field clears
   - New item appears in the list
   - "Adding..." state shows briefly
   - Success state returns to normal

**Test Case 2 - Special Characters:**
1. Enter "Special chars: !@#$%^&*()_+{}|:"<>?"
2. Click "Add Item" button
3. Verify item is stored and displayed correctly

**Test Case 3 - Long Text:**
1. Enter a very long string (500+ characters)
2. Verify it's stored and displayed properly

#### 13. Form Validation Testing

**Empty Submission:**
1. Leave input field empty
2. Click "Add Item" button
3. Verify: No API call is made (form validation prevents it)

**Required Field Validation:**
1. Try to submit without filling required field
2. Verify browser validation or custom validation messages

### Data Retrieval UI Testing

#### 14. Retrieve Page Testing

**Initial Load:**
1. Navigate to http://localhost:3000/retrieve
2. Verify the page loads with:
   - "Retrieve Data" heading
   - Loading indicator initially
   - List of previously stored items after loading
   - Delete buttons for each item

#### 15. Data Display Testing

**Verify Data Display:**
1. Check that all previously stored items are displayed
2. Verify each item shows:
   - The stored text/value
   - Delete button
3. Verify proper formatting and styling

#### 16. Delete Functionality Testing

**Single Item Deletion:**
1. Click "Delete" button on one item
2. Verify:
   - Item disappears from list
   - API call is made to delete endpoint
   - List refreshes to show updated data

**Multiple Deletions:**
1. Delete several items in succession
2. Verify each deletion works independently
3. Verify list updates correctly after each deletion

### Error State Testing

#### 17. Network Error Simulation

**Store Page Errors:**
1. Disconnect from internet or stop backend server
2. Try to add a new item
3. Verify:
   - Error message displays ("Failed to add item")
   - Form remains functional
   - User can retry after connection restored

**Retrieve Page Errors:**
1. With network disconnected
2. Navigate to retrieve page
3. Verify:
   - Error message displays ("Failed to retrieve data")
   - No broken UI elements
   - Graceful degradation

#### 18. Authentication Error Testing

**Token Expiration:**
1. Wait for JWT token to expire (or manually remove from localStorage)
2. Try to perform store/retrieve operations
3. Verify:
   - Proper error handling
   - Redirect to login page (if implemented)
   - Clear error messages

## Automated Test Execution

### Backend Tests

#### 19. Unit Tests

**Encryption Utils Tests:**
```bash
cd backend
npm test -- --selectProjects unit
```

**Expected Output:**
- All encryption/decryption tests should pass
- Password generation tests should pass
- Error handling tests should pass

#### 20. Integration Tests

**API Integration Tests:**
```bash  
cd backend
npm test -- --selectProjects integration
```

**Expected Output:**
- Store API tests (success/error/auth) should pass
- Retrieve API tests should pass
- Authentication middleware tests should pass

### Frontend Tests

#### 21. Component Tests

**Store Component Tests:**
```bash
cd frontend
npm test -- Store.test.jsx
```

**Expected Output:**
- Loading state tests should pass
- Success state tests should pass
- Error state tests should pass
- Form interaction tests should pass

**Retrieve Component Tests:**
```bash
cd frontend
npm test -- Retrieve.test.jsx  
```

**Expected Output:**
- Data display tests should pass
- Delete functionality tests should pass
- Error handling tests should pass

#### 22. Full Test Suite

**Run All Tests:**
```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test -- --watchAll=false
```

## Security Testing

### 23. Encryption Verification

**Manual Encryption Test:**
```bash
cd backend
node -e "
const { encryptData, decryptData } = require('./utils/encryptionUtils');
const original = 'Sensitive test data';
const password = 'test123';
const encrypted = encryptData(original, password);
console.log('Original:', original);
console.log('Encrypted:', encrypted);
const decrypted = decryptData(encrypted, password);
console.log('Decrypted:', decrypted);
console.log('Match:', original === decrypted);
"
```

### 24. JWT Token Security

**Token Validation:**
1. Copy JWT token from login response
2. Decode using https://jwt.io or similar tool
3. Verify:
   - Proper structure (header.payload.signature)
   - Expiration time is set
   - User ID is included in payload

### 25. Password Security

**Test Password Hashing:**
1. Check database after user registration
2. Verify passwords are hashed (not plain text)
3. Verify same password produces different hashes (salt working)

## Error Handling Testing

### 26. Database Connection Errors

**Simulate Database Failure:**
1. Stop MongoDB service
2. Try API operations
3. Verify graceful error handling with meaningful messages

### 27. Invalid Data Testing

**Backend Validation:**
```bash
# Test with invalid JSON
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d 'invalid json'
```

### 28. Rate Limiting Testing

**Rapid Requests:**
```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/store/store \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{\"key\":\"test$i\",\"value\":\"value$i\"}" &
done
```

## Performance Testing

### 29. Large Data Testing

**Store Large Text:**
```bash
# Create large test string
LARGE_TEXT=$(head -c 10000 </dev/urandom | base64)
curl -X POST http://localhost:5000/api/store/store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"key\":\"large_data\",\"value\":\"$LARGE_TEXT\"}"
```

### 30. Multiple Items Testing

**Store Many Items:**
```bash
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/store/store \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{\"key\":\"item_$i\",\"value\":\"Test data item $i\"}"
done
```

## Test Checklist

### Pre-Testing
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000

### Backend API Tests
- [ ] User registration works
- [ ] User login works
- [ ] JWT token received and valid
- [ ] Store data with valid token works
- [ ] Store data without token fails (401)
- [ ] Store data with invalid token fails (400)
- [ ] Retrieve data with valid token works
- [ ] Retrieve data without token fails (401)
- [ ] Missing required fields return appropriate errors

### Frontend UI Tests
- [ ] Registration form works
- [ ] Login form works
- [ ] Store page loads correctly
- [ ] Can add new items successfully
- [ ] Input validation works
- [ ] Loading states display correctly
- [ ] Retrieve page loads correctly
- [ ] All stored items display
- [ ] Delete functionality works
- [ ] Error messages display appropriately

### Automated Tests
- [ ] Backend unit tests pass
- [ ] Backend integration tests pass
- [ ] Frontend component tests pass
- [ ] Test coverage is adequate (>80%)

### Security Tests
- [ ] Encryption/decryption works correctly
- [ ] Passwords are hashed in database
- [ ] JWT tokens are properly secured
- [ ] Unauthorized access is blocked

### Error Handling Tests
- [ ] Network errors handled gracefully
- [ ] Database errors handled gracefully
- [ ] Authentication errors handled properly
- [ ] Invalid input handled correctly

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check for port conflicts (5000 already in use)

**Frontend won't start:**
- Verify Node.js version (18+)
- Check for port conflicts (3000 already in use)
- Clear npm cache: `npm cache clean --force`

**Tests failing:**
- Ensure test database is separate from development
- Check for proper test setup/teardown
- Verify mock configurations

**Authentication issues:**
- Check JWT secret is set
- Verify token expiration settings
- Ensure proper authorization header format

### Getting Help

**Debug Logs:**
- Backend: Check console output for errors
- Frontend: Check browser developer console
- Database: Check MongoDB logs

**Test Coverage:**
```bash
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

**API Documentation:**
- Use tools like Postman or Insomnia
- Check network tab in browser developer tools
- Add logging to API endpoints for debugging

---

**Note:** This testing guide should be updated as the application evolves. Always test in a dedicated testing environment, never in production.