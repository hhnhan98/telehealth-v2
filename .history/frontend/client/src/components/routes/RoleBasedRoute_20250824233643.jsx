// src/components/routes/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    // ProtectedRoute nên chặn trước, nhưng vẫn an toàn nếu user null
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    toast.error('Bạn không có quyền truy cập trang này!');
    // Redirect về trang dashboard mặc định theo role
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
