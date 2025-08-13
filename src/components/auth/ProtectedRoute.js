import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isClient, userRole, loading } = useAuth();

  console.log('🛡️ ProtectedRoute verificando acceso:', {
    currentUser: currentUser?.email,
    userRole,
    isClient: isClient(),
    loading,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    userCreatedAt: currentUser?.created_at
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Cargando...');
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 ProtectedRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene un rol válido
  const hasValidRole = userRole && ['cliente', 'admin', 'owner'].includes(userRole);
  console.log('🔍 ProtectedRoute: Verificación de rol:', {
    userRole,
    hasValidRole,
    validRoles: ['cliente', 'admin', 'owner']
  });

  if (!hasValidRole) {
    console.log('⚠️ ProtectedRoute: Usuario sin rol válido, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute: Acceso permitido para rol:', userRole);
  return children;
};

export default ProtectedRoute;
