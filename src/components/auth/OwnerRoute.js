import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OwnerRoute = ({ children }) => {
  const { currentUser, isOwner, loading } = useAuth();

  console.log('👑 OwnerRoute verificando acceso:', {
    currentUser: currentUser?.email,
    isOwner: isOwner(),
    loading
  });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 OwnerRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (!isOwner()) {
    console.log('🚫 OwnerRoute: Usuario no es owner, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ OwnerRoute: Acceso permitido');
  return children;
};

export default OwnerRoute;
