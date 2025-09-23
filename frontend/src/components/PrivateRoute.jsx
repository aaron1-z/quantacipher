import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute Component
 * Protects routes by checking for valid JWT token in localStorage
 * Redirects unauthenticated users to login page
 */
const PrivateRoute = ({ element: Component, ...rest }) => {
  // Check for JWT token in localStorage (consistent with api.js)
  const isAuthenticated = localStorage.getItem('jwtToken') !== null;

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
