# Contributing to Quantacipher

Thank you for your interest in contributing to Quantacipher! We welcome contributions from developers of all skill levels. This document outlines the process for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Conventions](#code-conventions)
- [Testing Guidelines](#testing-guidelines)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- MongoDB (local or Atlas)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/quantacipher.git
   cd quantacipher
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/aaron1-z/quantacipher.git
   ```

### Development Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` in both `backend` and `frontend` directories
   - Update the environment variables as needed

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## Development Workflow

### Branching Strategy

We use a feature branch workflow:

1. **Create a feature branch from main**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Branch Naming Convention**
   - `feature/description` - New features
   - `bugfix/description` - Bug fixes
   - `docs/description` - Documentation updates
   - `refactor/description` - Code refactoring
   - `test/description` - Test additions/updates

### Making Changes

1. **Keep changes focused**: One feature or fix per branch
2. **Write clear commit messages**: Follow the format below
3. **Test your changes**: Ensure all tests pass
4. **Update documentation**: Include relevant documentation updates

### Commit Message Format

```
type(scope): brief description

Detailed explanation of changes (if needed)

- List specific changes
- Use bullet points for multiple items

Closes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add JWT token refresh functionality

- Implement token refresh endpoint
- Add automatic token renewal in frontend
- Update authentication middleware

Closes #45

fix(store): resolve data validation error

- Fix key validation in store controller
- Add proper error handling
- Update API documentation

Closes #67
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature-name
   git merge main
   ```

2. **Run all checks**
   ```bash
   # Frontend linting
   cd frontend
   npm run lint

   # Test your changes manually
   npm run dev
   ```

3. **Update documentation** if needed

### Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR
   - Use the PR template provided
   - Link relevant issues
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] All existing tests pass
- [ ] I have added tests for new functionality

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
```

### Review Process

1. **Automated Checks**: All PRs must pass linting and builds
2. **Code Review**: At least one maintainer must review
3. **Testing**: Changes should be tested manually
4. **Documentation**: Ensure docs are updated if needed

## Code Conventions

### JavaScript/Node.js (Backend)

```javascript
// Use modern ES6+ syntax
const express = require('express');
const { validationResult } = require('express-validator');

// Function naming: camelCase
const getUserData = async (req, res) => {
  try {
    // Use const/let, avoid var
    const { id } = req.params;
    
    // Consistent error handling
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Async/await preferred over promises
    const user = await User.findById(id);
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
```

### React/JSX (Frontend)

```javascript
import React, { useState, useEffect } from 'react';
import axios from '../api';

// Component names: PascalCase
const UserProfile = ({ userId }) => {
  // Hooks at the top
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect for side effects
  useEffect(() => {
    fetchUser();
  }, [userId]);

  // Function naming: camelCase
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Early returns for loading/error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      {/* Rest of component */}
    </div>
  );
};

export default UserProfile;
```

### CSS/Styling

- Use Tailwind CSS classes when possible
- Follow BEM methodology for custom CSS
- Use semantic class names
- Maintain responsive design principles

```css
/* BEM naming convention */
.user-card {
  /* Block */
}

.user-card__header {
  /* Element */
}

.user-card--featured {
  /* Modifier */
}
```

### File Organization

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
└── index.js         # Entry point

frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── hooks/       # Custom hooks
│   ├── utils/       # Utility functions
│   └── api.js       # API configuration
```

## Testing Guidelines

### Manual Testing

Since automated tests are not yet implemented, please:

1. **Test all affected functionality**
2. **Test error cases**
3. **Test with different user roles**
4. **Test responsive design**
5. **Test API endpoints with different inputs**

### Future Testing Implementation

We plan to implement:
- **Backend**: Jest + Supertest for API testing
- **Frontend**: Jest + React Testing Library
- **E2E**: Playwright or Cypress

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Test with the latest version**

### Bug Reports

Use the bug report template and include:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. Scroll to...

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js version:
- npm version:

## Screenshots
Add screenshots if applicable

## Additional Context
Any other context about the problem
```

### Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:
1. Email the maintainers directly
2. Provide detailed information about the vulnerability
3. Allow time for the issue to be addressed before disclosure

## Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the proposed feature

## Problem/Use Case
What problem does this solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Mockups, examples, or other context
```

## Community Guidelines

### Communication

- Be respectful and professional
- Provide constructive feedback
- Help newcomers get started
- Share knowledge and best practices

### Code Reviews

When reviewing code:
- Focus on the code, not the person
- Provide specific, actionable feedback
- Acknowledge good work
- Suggest improvements when possible

### Getting Help

- Check the [README.md](./README.md) and [API.md](./API.md)
- Search existing issues and discussions
- Ask questions in issues or discussions
- Be patient and helpful to others

## Recognition

Contributors will be recognized in:
- The README.md contributors section
- Release notes for significant contributions
- Special recognition for major features or fixes

Thank you for contributing to Quantacipher! 🎉

---

For more information, see our [Code of Conduct](./CODE_OF_CONDUCT.md) or the main [README.md](./README.md).