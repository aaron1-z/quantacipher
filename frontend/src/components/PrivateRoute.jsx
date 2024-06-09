import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null; // Example logic

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
