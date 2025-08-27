import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;        // Chưa login => redirect về login
  }

  return children;            // Đã login => hiển thị nội dung

};

export default ProtectedRoute;
