import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OwnerRoute = ({ children }) => {
  const { currentUser, isOwner, userRole, loading } = useAuth();
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  useEffect(() => {
    const verifyOwner = async () => {
      if (!currentUser) {
        setCheckingOwner(false);
        return;
      }

      try {
        setCheckingOwner(true);
        // Verificar si es owner basado en email directamente
        const isOwnerUser = currentUser.email === 'oterov101@gmail.com' || userRole === 'owner';
        setIsOwnerVerified(isOwnerUser);
        console.log('👑 OwnerRoute verificación completada:', {
          currentUser: currentUser?.email,
          userRole,
          isOwner: isOwnerUser
        });
      } catch (error) {
        console.error('❌ Error verificando owner:', error);
        setIsOwnerVerified(false);
      } finally {
        setCheckingOwner(false);
      }
    };

    if (!loading) {
      verifyOwner();
    }
  }, [currentUser, loading, userRole]);

  if (loading || checkingOwner) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    console.log('🚫 OwnerRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (!isOwnerVerified) {
    console.log('🚫 OwnerRoute: Usuario no es owner, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ OwnerRoute: Acceso permitido');
  return children;
};

export default OwnerRoute;
