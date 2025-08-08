import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('usuario');
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Registro de usuario
  async function signup(email, password, displayName) {
    try {
      const result = await authService.signUp(email, password, displayName);
      
      toast.success('Cuenta creada exitosamente. Revisa tu email para confirmar.');
      return result;
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  }

  // Login
  async function login(email, password) {
    try {
      const result = await authService.signIn(email, password);
      
      toast.success('Inicio de sesión exitoso');
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  }

  // Logout
  async function logout() {
    if (isLoggingOut) {
      console.log('🔄 Logout ya en progreso, ignorando...');
      return;
    }

    try {
      setIsLoggingOut(true);
      console.log('🚪 AuthContext: Iniciando logout...');
      
      await authService.signOut();
      
      console.log('✅ AuthContext: Logout exitoso');
      toast.success('Sesión cerrada');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Recuperar contraseña
  async function resetPassword(email) {
    try {
      await authService.resetPassword(email);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      console.error('Error en reset password:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  }

  // Verificar si es admin
  function isAdmin() {
    console.log('🔍 Verificando rol admin:', { 
      userRole, 
      currentUser: currentUser?.email,
      result: userRole === 'admin' 
    });
    return userRole === 'admin';
  }

  // Verificar si es cliente
  function isClient() {
    return userRole === 'cliente' || userRole === 'admin';
  }

  // Obtener mensaje de error en español
  function getErrorMessage(errorMessage) {
    const errorMessages = {
      'Usuario no encontrado': 'No existe una cuenta con este email',
      'Contraseña incorrecta': 'Contraseña incorrecta',
      'El usuario ya existe': 'Este email ya está registrado',
      'Email inválido': 'Email inválido',
      'Demasiados intentos': 'Demasiados intentos. Intenta más tarde',
      'Cuenta deshabilitada': 'Esta cuenta ha sido deshabilitada',
      'Operación no permitida': 'Operación no permitida',
      'Credenciales inválidas': 'Credenciales inválidas'
    };
    return errorMessages[errorMessage] || errorMessage || 'Error desconocido';
  }

  // Verificar sesión y escuchar cambios de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const session = await authService.getSession();
        
        if (session?.user) {
          setCurrentUser(session.user);
          console.log('👤 Usuario autenticado:', session.user.email);
          
          // Forzar admin directamente para tu email
          if (session.user.email === 'oterov101@gmail.com') {
            setUserRole('admin');
            console.log('🔑 ADMIN FORZADO para oterov101@gmail.com');
            return;
          }
          
          // Para todos los usuarios autenticados, establecer como cliente por defecto
          console.log('👤 Estableciendo rol cliente para usuario autenticado');
          setUserRole('cliente');
        }
      } catch (error) {
        console.error('❌ Error obteniendo sesión:', error);
      } finally {
        console.log('✅ Carga de autenticación completada');
        setLoading(false);
      }
    };

    getInitialSession();

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de autenticación - forzando carga');
      setLoading(false);
    }, 1500);

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        
        // Forzar admin directamente para tu email
        if (session.user.email === 'oterov101@gmail.com') {
          setUserRole('admin');
          console.log('🔑 ADMIN FORZADO en onChange para oterov101@gmail.com');
          return;
        }
        
        // Para todos los usuarios autenticados, establecer como cliente por defecto
        console.log('👤 Estableciendo rol cliente para usuario en onChange');
        setUserRole('cliente');
      } else if (event === 'SIGNED_OUT') {
        console.log('🔓 SIGNED_OUT detectado, limpiando estado...');
        setCurrentUser(null);
        setUserRole('usuario');
        setIsLoggingOut(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    isAdmin,
    isClient,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
