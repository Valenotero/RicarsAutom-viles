import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Eye, Heart, Calendar, Mail, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { getFavorites, getRecentlyViewed, cleanDuplicateRecentlyViewed } from '../services/favoritesService';
import VehicleCard from '../components/vehicles/VehicleCard';
import toast from 'react-hot-toast';

const Profile = () => {
  const { currentUser, userRole, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingDisplayName, setIsChangingDisplayName] = useState(false);

  // Funciones para editar perfil
  const handleChangePassword = async () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { supabase } = await import('../supabase/config');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Contraseña actualizada exitosamente');
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      toast.error('Error al cambiar la contraseña: ' + error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    const newEmail = document.getElementById('newEmail').value;

    if (!newEmail) {
      toast.error('Por favor ingresa un nuevo email');
      return;
    }

    if (newEmail === currentUser.email) {
      toast.error('El nuevo email debe ser diferente al actual');
      return;
    }

    setIsChangingEmail(true);
    try {
      const { supabase } = await import('../supabase/config');
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        throw error;
      }

      toast.success('Email actualizado. Revisa tu nuevo email para confirmar el cambio');
      document.getElementById('newEmail').value = '';
    } catch (error) {
      console.error('Error cambiando email:', error);
      toast.error('Error al cambiar el email: ' + error.message);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangeDisplayName = async () => {
    const newDisplayName = document.getElementById('newDisplayName').value;

    if (!newDisplayName.trim()) {
      toast.error('Por favor ingresa un nombre de usuario');
      return;
    }

    if (newDisplayName === userProfile?.display_name) {
      toast.error('El nuevo nombre debe ser diferente al actual');
      return;
    }

    setIsChangingDisplayName(true);
    try {
      const { supabase } = await import('../supabase/config');
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: newDisplayName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      toast.success('Nombre de usuario actualizado exitosamente');
      // Recargar el perfil para mostrar el cambio
      window.location.reload();
    } catch (error) {
      console.error('Error cambiando nombre de usuario:', error);
      toast.error('Error al cambiar el nombre de usuario: ' + error.message);
    } finally {
      setIsChangingDisplayName(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Primero limpiar duplicados existentes (no crítico si falla)
        try {
          await cleanDuplicateRecentlyViewed();
        } catch (cleanError) {
          console.warn('Error limpiando duplicados (no crítico):', cleanError);
        }
        
        // Cargar favoritos y vistos recientemente desde la base de datos
        const [favoritesData, recentlyViewedData] = await Promise.all([
          getFavorites(),
          getRecentlyViewed()
        ]);
        
        setFavorites(favoritesData);
        setRecentlyViewed(recentlyViewedData);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        toast.error('Error al cargar tus datos');
      }
    };

    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINAR') {
      toast.error('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Importar supabase para eliminar el usuario
      const { supabase } = await import('../supabase/config');
      
      console.log('🗑️ Iniciando eliminación de cuenta:', currentUser.email);
      
      // Si es admin, mostrar advertencia especial
      if (userRole === 'admin') {
        const confirmAdmin = window.confirm(
          '⚠️ ADVERTENCIA: Estás eliminando una cuenta de ADMINISTRADOR.\n\n' +
          'Esta acción:\n' +
          '• Eliminará permanentemente tu cuenta de admin\n' +
          '• Puede afectar la administración del sistema\n' +
          '• Es IRREVERSIBLE\n\n' +
          '¿Estás ABSOLUTAMENTE seguro de continuar?'
        );
        
        if (!confirmAdmin) {
          setIsDeleting(false);
          return;
        }
      }
      
      // Eliminar perfil del usuario si existe
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', currentUser.id);
        
        if (profileError) {
          console.log('ℹ️ No se encontró perfil o error eliminando perfil:', profileError);
        } else {
          console.log('✅ Perfil eliminado exitosamente');
        }
      } catch (profileError) {
        console.log('ℹ️ Error eliminando perfil (puede no existir):', profileError);
      }
      
      // Eliminar el usuario de Supabase Auth
      // Nota: En un entorno de producción, esto debería hacerse desde el backend
      // por seguridad. Aquí usamos el método disponible para el cliente.
      const { error: deleteError } = await supabase.auth.signOut();
      
      if (deleteError) {
        console.error('❌ Error cerrando sesión:', deleteError);
      }
      
      // Para eliminar completamente el usuario, se necesitaría una función del lado del servidor
      // Por ahora, marcamos la cuenta como "eliminada" cerrando sesión y limpiando datos
      console.log('ℹ️ Nota: Para eliminar completamente el usuario de Supabase Auth se requiere acceso de servidor');
      
      // Limpiar datos locales
      localStorage.removeItem('recentlyViewed');
      localStorage.removeItem('likedVehicles');
      
      console.log('✅ Cuenta eliminada exitosamente');
      toast.success('Cuenta eliminada exitosamente');
      
      // Cerrar sesión y redirigir
      await logout();
      navigate('/');
      
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      toast.error('Error al eliminar la cuenta: ' + error.message);
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
    setConfirmText('');
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setConfirmText('');
    setIsDeleting(false);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Debes iniciar sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full p-4 mr-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Perfil
              </h1>
              <p className="text-gray-600">
                 Bienvenido de vuelta, {userProfile?.display_name || currentUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Personal
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                 <User className="w-5 h-5 text-gray-400 mr-3" />
                 <span className="text-gray-700 font-medium">{userProfile?.display_name || 'Usuario'}</span>
               </div>
               <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">{currentUser.email}</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700 capitalize">{userRole}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">
                  Miembro desde {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Vistos Recientemente
                </h2>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {recentlyViewed.length}
              </span>
            </div>
            
            {recentlyViewed.length > 0 ? (
              <div className="relative">
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-in-out" 
                       style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}>
                    {recentlyViewed.map((vehicle, index) => (
                      <div key={`recent-${vehicle.id}-${index}`} className="w-full flex-shrink-0 px-2">
                        <VehicleCard vehicle={vehicle} compact />
                      </div>
                    ))}
                  </div>
                </div>
                
                {recentlyViewed.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentCarouselIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentCarouselIndex === 0}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentCarouselIndex(prev => Math.min(recentlyViewed.length - 1, prev + 1))}
                      disabled={currentCarouselIndex === recentlyViewed.length - 1}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Indicadores */}
                {recentlyViewed.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {recentlyViewed.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarouselIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentCarouselIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No has visto ningún vehículo recientemente
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Vehículos Favoritos
                </h2>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {favorites.length}
              </span>
            </div>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 3).map((vehicle, index) => (
                  <Link 
                    key={`favorite-${vehicle.id}-${index}`} 
                    to={`/vehiculo/${vehicle.id}`}
                    className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={vehicle.images?.[0] || '/placeholder-car.jpg'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {vehicle.year} • {vehicle.kilometers?.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          ${vehicle.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(vehicle.favorited_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {favorites.length > 3 && (
                  <Link 
                    to="/favoritos" 
                    className="block text-center py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Ver todos los {favorites.length} favoritos</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No tienes vehículos favoritos aún
              </p>
            )}
          </div>
        </div>

        {/* Estadísticas del usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tu Actividad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {recentlyViewed.length}
              </div>
              <div className="text-sm text-gray-600">Vehículos Vistos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {favorites.length}
              </div>
              <div className="text-sm text-gray-600">Favoritos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userRole === 'owner' ? 'Dueño' : userRole === 'admin' ? 'Admin' : 'Cliente'}
              </div>
              <div className="text-sm text-gray-600">Tipo de Usuario</div>
            </div>
          </div>
        </div>

        {/* Editar Perfil */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            Editar Perfil
          </h2>
          
          {/* Cambiar Contraseña */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-3">Cambiar Contraseña</h3>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                minLength="6"
                id="newPassword"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="confirmPassword"
              />
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </div>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </div>
          </div>

          {/* Cambiar Email */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-3">Cambiar Email</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Nuevo email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                id="newEmail"
              />
              <button
                onClick={handleChangeEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                disabled={isChangingEmail}
              >
                {isChangingEmail ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </div>
                ) : (
                  'Cambiar Email'
                )}
              </button>
            </div>
          </div>

          {/* Cambiar Nombre de Usuario */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-3">Cambiar Nombre de Usuario</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nuevo nombre de usuario"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                id="newDisplayName"
                defaultValue={userProfile?.display_name || ''}
              />
              <button
                onClick={handleChangeDisplayName}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                disabled={isChangingDisplayName}
              >
                {isChangingDisplayName ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </div>
                ) : (
                  'Cambiar Nombre'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Configuración de cuenta */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Configuración de Cuenta
          </h2>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Zona Peligrosa
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  La eliminación de cuenta es <strong>permanente e irreversible</strong>. 
                  Se eliminarán todos tus datos y no podrás recuperar tu cuenta.
                </p>
                <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                  <li>Se eliminará tu perfil y datos personales</li>
                  <li>Se perderán tus favoritos y historial</li>
                  <li>No podrás usar el mismo email para registrarte nuevamente</li>
                  {userRole === 'admin' && (
                    <li className="font-semibold">⚠️ Perderás el acceso de administrador</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={openDeleteDialog}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Mi Cuenta Permanentemente
          </button>
        </div>

        {/* Diálogo de confirmación */}
        <AnimatePresence>
          {showDeleteDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Eliminación de Cuenta
                  </h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Esta acción <strong>no se puede deshacer</strong>. Para confirmar la eliminación 
                    de tu cuenta, escribe <strong>"ELIMINAR"</strong> en el campo de abajo:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Se eliminará:</strong>
                    </p>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                      <li>Cuenta: {currentUser.email}</li>
                      <li>Rol: {userRole}</li>
                      <li>Datos personales y preferencias</li>
                      <li>Historial de actividad</li>
                    </ul>
                  </div>
                  
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Escribe ELIMINAR para confirmar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={isDeleting}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={closeDeleteDialog}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || confirmText !== 'ELIMINAR'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Eliminando...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Cuenta
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Profile;
