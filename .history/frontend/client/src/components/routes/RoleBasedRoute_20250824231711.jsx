// src/components/routes/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;         // Role không hợp lệ =>  redirect hoặc show message

  }

  return children;
};

export default RoleBasedRoute;
