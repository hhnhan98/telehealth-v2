import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  const location = useLocation();

  if (!user || !token) {
    toast.warning('Vui lòng đăng nhập để tiếp tục!');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
