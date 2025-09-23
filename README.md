# Quantacipher

> "Where Information is Power and Your Privacy is our Priority" - Aditya Singh, Quantacipher

## Overview

Quantacipher is a secure data storage and retrieval application that empowers individuals and businesses with innovative data security solutions. Built with cutting-edge encryption technologies, it provides a robust platform for storing and accessing sensitive information with fortified security measures.

## Features

- **🔐 Fortified Security**: Utilizing cutting-edge encryption technologies to protect your sensitive data
- **📊 Efficient Data Handling**: Streamlined processes for storing and retrieving information with ease
- **🌍 Global Accessibility**: Access your data securely from anywhere in the world, at any time
- **🔑 JWT Authentication**: Secure user authentication with JSON Web Tokens
- **💾 MongoDB Integration**: Reliable data persistence with MongoDB database
- **⚡ Modern Tech Stack**: React frontend with Node.js/Express backend

## Architecture

- **Frontend**: React 18 with Vite, React Router, Tailwind CSS
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **Security**: CORS enabled, password hashing with bcryptjs

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaron1-z/quantacipher.git
   cd quantacipher
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

2. **Frontend Environment Variables**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   # Or for production: npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Building for Production

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   npm start
   ```

## Usage Examples

### Authentication Flow

1. **User Registration**
   ```javascript
   // POST /api/auth/register
   const response = await fetch('/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       username: 'johndoe',
       email: 'john@example.com',
       password: 'securePassword123'
     })
   });
   ```

2. **User Login**
   ```javascript
   // POST /api/auth/login
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'john@example.com',
       password: 'securePassword123'
     })
   });
   const { token } = await response.json();
   localStorage.setItem('token', token);
   ```

### Data Operations

1. **Store Data**
   ```javascript
   // POST /api/store/store
   const response = await fetch('/api/store/store', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       key: 'mySecretData',
       value: 'This is my encrypted data'
     })
   });
   ```

2. **Retrieve Data**
   ```javascript
   // GET /api/retrieve/retrieve
   const response = await fetch('/api/retrieve/retrieve', {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   const data = await response.json();
   ```

## API Documentation

For detailed API documentation, see [API.md](./API.md).

## Testing

For comprehensive testing instructions, see [TESTING.md](./TESTING.md).

### Running Tests

Currently, no automated test suite is configured. Testing relies on manual verification and linting.

```bash
# Frontend linting (note: may show some warnings/errors)
cd frontend
npm run lint

# Frontend build test
npm run build

# Backend manual testing
cd backend
npm run dev
# Test API endpoints using curl or Postman (see API.md)
```

**Note**: The project currently has some linting warnings that don't affect functionality. These are primarily related to unused React imports in JSX files, which is normal for React 17+ with the new JSX transform.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to understand the standards we expect from our community.

## Project Structure

```
quantacipher/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── index.js            # Entry point
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API configuration
│   │   └── App.jsx         # Main app component
│   ├── index.html          # HTML template
│   └── package.json        # Frontend dependencies
├── README.md               # This file
├── API.md                  # API documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── TESTING.md              # Testing instructions
└── CODE_OF_CONDUCT.md      # Community standards
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, CORS
- **Development**: nodemon

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Linting**: ESLint

## License

This project is licensed under the ISC License.

## Support

If you have any questions or need support, please:

1. Check the [API documentation](./API.md)
2. Review [Contributing Guidelines](./CONTRIBUTING.md)
3. Open an issue on GitHub

## Acknowledgments

- Built with modern web technologies
- Inspired by the need for secure data storage solutions
- Community-driven development approach

---

**Quantacipher** - Empowering secure data management for everyone.