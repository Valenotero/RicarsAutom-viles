import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isClient, userRole, loading } = useAuth();

  console.log('🛡️ ProtectedRoute verificando acceso:', {
    currentUser: currentUser?.email,
    userRole,
    isClient: isClient(),
    loading
  });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 ProtectedRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (!isClient()) {
    console.log('🚫 ProtectedRoute: Usuario no es cliente/admin, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute: Acceso permitido');
  return children;
};

export default ProtectedRoute;
