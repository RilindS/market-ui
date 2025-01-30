import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ roles, component: Component }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/" />;
  }

  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const userRole = decodedToken?.role;

  if (!roles || !Array.isArray(roles)) {
    console.error('Roles are undefined or not an array');
    return <Navigate to="/unauthorized" />;
  }

  if (roles.includes(userRole)) {
    return <Component />;
  }

  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
