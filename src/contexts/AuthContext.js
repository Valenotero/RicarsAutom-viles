import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabaseService';
import { supabase } from '../supabase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  // ==================== ESTADO ====================
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================== FUNCIONES INTERNAS ====================
  
// Obtener perfil usando authService (unificado)
const getUserProfile = async (userId) => {
  try {
    console.log('🔍 [AuthContext] Delegando a authService.getUserProfile:', userId);
    
    if (!userId) {
      console.error('❌ [AuthContext] No userId provided');
      return null;
    }

    // Usar el authService en lugar de llamar directamente a Supabase
    const profile = await authService.getUserProfile(userId);
    
    console.log('✅ [AuthContext] Perfil obtenido de authService:', profile);
    
    if (profile) {
      setUserProfile(profile);
      return profile;
    }
    
    console.warn('⚠️ [AuthContext] AuthService no retornó perfil');
    return null;

  } catch (error) {
    console.error('❌ [AuthContext] Error usando authService:', error);
    return null;
  }
};

  // Test de conexión a Supabase
  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 [TEST] Iniciando test de conexión...');
      
      // Test 1: Consulta simple sin filtros
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('🧪 [TEST] Test básico:', { testData, testError });
      
      // Test 2: Consulta de todos los perfiles
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('🧪 [TEST] Todos los perfiles:', { 
        count: allProfiles?.length, 
        profiles: allProfiles, 
        error: allError 
      });
      
      // Test 3: Consulta específica por email
      const { data: specificProfile, error: specificError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'oterov101@gmail.com');
      
      console.log('🧪 [TEST] Tu perfil específico:', { 
        specificProfile, 
        specificError 
      });
      
      return {
        basicTest: { data: testData, error: testError },
        allProfiles: { data: allProfiles, error: allError },
        specificProfile: { data: specificProfile, error: specificError }
      };
      
    } catch (error) {
      console.error('🧪 [TEST] Error en test:', error);
      return { error };
    }
  };

  // Obtener mensaje de error en español
  const getErrorMessage = (errorMessage) => {
    const errorMessages = {
      'Invalid login credentials': 'Credenciales inválidas',
      'Email not confirmed': 'Email no confirmado',
      'User already registered': 'El usuario ya está registrado',
      'Weak password': 'La contraseña es muy débil',
      'Invalid email': 'Email inválido',
      'Usuario no encontrado': 'No existe una cuenta con este email',
      'Contraseña incorrecta': 'Contraseña incorrecta',
      'El usuario ya existe': 'Este email ya está registrado'
    };
    return errorMessages[errorMessage] || errorMessage || 'Error desconocido';
  };

  // ==================== FUNCIONES DE AUTENTICACIÓN ====================

  const signup = async (email, password, displayName) => {
    try {
      console.log('📝 [signup] Registrando usuario:', email);
      const result = await authService.signUp(email, password, displayName);
      toast.success('Cuenta creada exitosamente. Revisa tu email para confirmar.');
      return result;
    } catch (error) {
      console.error('❌ [signup] Error:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 [login] Iniciando sesión:', email);
      const result = await authService.signIn(email, password);
      toast.success('Inicio de sesión exitoso');
      return result;
    } catch (error) {
      console.error('❌ [login] Error:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [logout] Cerrando sesión...');
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('❌ [logout] Error:', error);
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      console.log('📧 [resetPassword] Enviando reset para:', email);
      await authService.resetPassword(email);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      console.error('❌ [resetPassword] Error:', error);
      toast.error(getErrorMessage(error.message));
      throw error;
    }
  };

  // ==================== FUNCIONES DE ROLES ====================

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    const result = userProfile?.role === 'admin' || userProfile?.role === 'owner';
    console.log('🔍 [isAdmin] Check:', {
      userEmail: user?.email,
      userRole: userProfile?.role,
      result
    });
    return result;
  };

  const isOwner = () => {
    const result = userProfile?.role === 'owner';
    console.log('🔍 [isOwner] Check:', {
      userEmail: user?.email,
      userRole: userProfile?.role,
      result
    });
    return result;
  };

  const isClient = () => {
    const result = !!userProfile && ['cliente', 'admin', 'owner'].includes(userProfile.role);
    console.log('🔍 [isClient] Check:', {
      userEmail: user?.email,
      userRole: userProfile?.role,
      result
    });
    return result;
  };

  const hasRole = (role) => {
    const result = userProfile?.role === role;
    console.log('🔍 [hasRole] Check:', {
      requestedRole: role,
      userRole: userProfile?.role,
      result
    });
    return result;
  };

  // ==================== FUNCIONES UTILITARIAS ====================

  const refreshUserProfile = async () => {
    if (!user?.id) {
      console.log('🔄 [refreshUserProfile] No hay usuario para refrescar');
      return;
    }

    try {
      console.log('🔄 [refreshUserProfile] Refrescando para:', user.email);
      const profile = await getUserProfile(user.id);
      console.log('✅ [refreshUserProfile] Completado:', profile ? 'Éxito' : 'Sin datos');
      return profile;
    } catch (error) {
      console.error('❌ [refreshUserProfile] Error:', error);
      throw error;
    }
  };

  // ==================== EFFECTS ====================

// Effect principal para inicializar autenticación
useEffect(() => {
  let mounted = true;
  let isInitialized = false; // ⭐ NUEVA BANDERA

  const initializeAuth = async () => {
    try {
      console.log('🔄 [AuthContext] Inicializando...');

      // Obtener sesión actual
      const session = await authService.getSession();
      console.log('📋 [AuthContext] Sesión:', session?.user?.email || 'Sin sesión');

      if (session?.user && mounted) {
        console.log('👤 [AuthContext] Usuario encontrado:', session.user.email);
        setUser(session.user);

        // Obtener perfil usando authService
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          console.log('✅ [AuthContext] Perfil cargado:', profile.role);
        } else {
          console.warn('⚠️ [AuthContext] No se pudo cargar perfil');
        }
      } else {
        console.log('ℹ️ [AuthContext] No hay sesión activa');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error inicializando:', error);
    } finally {
      if (mounted) {
        isInitialized = true; // ⭐ MARCAR COMO INICIALIZADO
        console.log('✅ [AuthContext] Inicialización completada');
        setLoading(false);
      }
    }
  };

  initializeAuth();

  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔄 [AuthStateChange]:', event, session?.user?.email || 'Sin usuario');

      if (!mounted || !isInitialized) return; // ⭐ EVITAR EJECUCIÓN ANTES DE INICIALIZAR

      if (event === 'SIGNED_IN' && session?.user) {
        // ⭐ SOLO SI ES DIFERENTE AL USUARIO ACTUAL
        if (user?.id !== session.user.id) {
          console.log('🔐 [AuthStateChange] Nuevo login:', session.user.email);
          setUser(session.user);
          
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            console.log('✅ [AuthStateChange] Perfil cargado:', profile.role);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 [AuthStateChange] Logout');
        setUser(null);
        setUserProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    }
  );

  return () => {
    mounted = false;
    subscription?.unsubscribe();
  };
}, []); // ⭐ ASEGÚRATE DE QUE LAS DEPENDENCIAS ESTÉN VACÍAS
  // Effect de debug para mostrar estado actual
  useEffect(() => {
    if (!loading) {
      console.log('🎭 [AuthContext] Estado actual:', {
        user: user?.email || 'Sin usuario',
        profile: userProfile ? `${userProfile.role} (${userProfile.email})` : 'Sin perfil',
        isAuthenticated: isAuthenticated(),
        isAdmin: isAdmin(),
        isOwner: isOwner(),
        isClient: isClient()
      });
    }
  }, [user, userProfile, loading]);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // Estado principal
    user,
    userProfile,
    loading,

    // Funciones de autenticación
    signup,
    login,
    logout,
    resetPassword,

    // Funciones de roles
    isAuthenticated,
    isAdmin,
    isOwner,
    isClient,
    hasRole,

    // Utilidades
    refreshUserProfile,
    testSupabaseConnection,

    // Datos derivados
    userRole: userProfile?.role || null,
    userName: userProfile?.display_name || user?.email?.split('@')[0] || '',
    userEmail: user?.email || '',

    // Compatibilidad con código legacy
    currentUser: user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}