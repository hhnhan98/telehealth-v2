// src/components/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    toast.info('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
