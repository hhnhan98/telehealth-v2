import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    // Chưa login → redirect về login
    return <Navigate to="/login" replace />;
  }

  // Đã login → hiển thị nội dung
  return children;
};

export default ProtectedRoute;
