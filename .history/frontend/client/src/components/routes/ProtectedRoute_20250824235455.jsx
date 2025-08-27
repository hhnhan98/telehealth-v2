// src/components/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const [redirect, setRedirect] = useState(false);
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  const location = useLocation();

  useEffect(() => {
    if (!user || !token) {
      toast.warning('Vui lòng đăng nhập để tiếp tục!');
      // Delay redirect 100ms để toast hiển thị
      const timer = setTimeout(() => setRedirect(true), 100);
      return () => clearTimeout(timer);
    }
  }, [user, token]);

  if (!user || !token) {
    return redirect ? (
      <Navigate to="/login" replace state={{ from: location }} />
    ) : null; // render null trong khi chờ toast hiển thị
  }

  return children;
};

export default ProtectedRoute;
