import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, userRole, loading } = useAuth();

  console.log('🛡️ AdminRoute verificando acceso:', {
    currentUser: currentUser?.email,
    userRole,
    isAdmin: isAdmin(),
    loading
  });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 AdminRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    console.log('🚫 AdminRoute: Usuario no es admin, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ AdminRoute: Acceso permitido');
  return children;
};

export default AdminRoute;
