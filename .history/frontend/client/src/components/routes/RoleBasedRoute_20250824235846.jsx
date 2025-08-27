// src/components/routes/RoleBasedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast, Slide } from 'react-toastify';
import authService from '../../services/authService';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const [redirect, setRedirect] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase();
      const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

      if (!isAllowed) {
        toast.error('Bạn không có quyền truy cập trang này!', {
          autoClose: 4000,
          transition: Slide,
        });
        const timer = setTimeout(() => setRedirect(true), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [user, allowedRoles]);

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  if (!isAllowed) {
    // Redirect sau khi toast
    if (!redirect) return null;
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
