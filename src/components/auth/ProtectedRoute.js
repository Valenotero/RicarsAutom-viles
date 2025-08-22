import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isClient, isAdmin, isOwner, userRole, userProfile, loading } = useAuth();

  console.log('🛡️ ProtectedRoute verificando acceso:', {
    currentUser: currentUser?.email,
    userRole,
    isClient: isClient(),
    loading,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    userCreatedAt: currentUser?.created_at,
    userProfile: userProfile,
    isClientResult: isClient(),
    isClientFunction: typeof isClient,
    userRoleType: typeof userRole
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Cargando...');
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 ProtectedRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene acceso usando las funciones del contexto
  const hasAccess = isClient() || isAdmin() || isOwner();
  console.log('🔍 ProtectedRoute: Verificación de acceso:', {
    userRole,
    isClient: isClient(),
    isAdmin: isAdmin(),
    isOwner: isOwner(),
    hasAccess,
    validRoles: ['cliente', 'admin', 'owner']
  });

  if (!hasAccess) {
    console.log('⚠️ ProtectedRoute: Usuario sin acceso válido, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute: Acceso permitido para rol:', userRole);
  return children;
};

export default ProtectedRoute;
