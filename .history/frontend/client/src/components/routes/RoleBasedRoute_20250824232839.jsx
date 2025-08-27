// src/components/routes/RoleBasedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    toast.info('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || '').toLowerCase();

  if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    toast.warning('Bạn không có quyền truy cập trang này');

    switch (userRole) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;
