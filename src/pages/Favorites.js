import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites, removeFromFavorites } from '../services/favoritesService';
import VehicleCard from '../components/vehicles/VehicleCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Cache para evitar consultas repetidas
  const getCachedFavorites = () => {
    if (!currentUser) return null;
    
    const cacheKey = `favorites_${currentUser.id}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache válido por 2 minutos
      if (Date.now() - timestamp < 2 * 60 * 1000) {
        return data;
      }
    }
    return null;
  };

  const setCachedFavorites = (data) => {
    if (!currentUser) return;
    
    const cacheKey = `favorites_${currentUser.id}`;
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  const loadFavorites = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde cache primero
      if (useCache) {
        const cached = getCachedFavorites();
        if (cached) {
          console.log('📦 Cargando favoritos desde cache');
          setFavorites(cached);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Cargando favoritos desde servidor...');
      
      // Crear AbortController para timeout personalizado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 segundos de timeout

      // Llamar al servicio con timeout
      const favoritesData = await Promise.race([
        getFavorites(),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Timeout: Consulta tardó más de 15 segundos'));
          });
        })
      ]);

      clearTimeout(timeoutId);

      console.log('✅ Favoritos cargados:', favoritesData?.length || 0);
      
      setFavorites(favoritesData || []);
      setCachedFavorites(favoritesData || []);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      setError(error.message);
      
      // Si hay error, intentar cargar cache como fallback
      const cached = getCachedFavorites();
      if (cached) {
        console.log('📦 Fallback: Usando favoritos en cache');
        setFavorites(cached);
        toast.error('Mostrando favoritos en cache. Algunos cambios recientes pueden no aparecer.');
      } else {
        toast.error('Error al cargar favoritos: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadFavorites(false); // Force reload without cache
  };

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleRemoveFavorite = async (vehicleId) => {
    // Guardar el estado original antes de hacer cambios
    const originalFavorites = [...favorites];
    
    try {
      setRemovingId(vehicleId);
      
      // Optimistic update - remover inmediatamente de la UI
      setFavorites(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      
      // Actualizar cache
      const updatedFavorites = favorites.filter(vehicle => vehicle.id !== vehicleId);
      setCachedFavorites(updatedFavorites);
      
      // Realizar la operación en servidor
      await removeFromFavorites(vehicleId);
      
      toast.success('Removido de favoritos');
      
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
      
      // Revertir cambio optimista en caso de error
      setFavorites(originalFavorites);
      setCachedFavorites(originalFavorites);
      
      toast.error('Error al remover de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para ver tus favoritos.
          </p>
          <Link to="/login" className="btn-primary">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/perfil" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mis Favoritos
                  </h1>
                  <p className="text-sm text-gray-600">
                    {favorites.length} vehículo{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botón de refresh */}
            <button
              onClick={handleRetry}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Actualizar favoritos"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al cargar favoritos
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error ? 'No se pudieron cargar los favoritos' : 'No tienes favoritos aún'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error ? 
                  'Intenta recargar la página o verifica tu conexión.' :
                  'Explora nuestro catálogo y guarda los vehículos que más te gusten.'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {error && (
                  <button onClick={handleRetry} className="btn-outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </button>
                )}
                <Link to="/catalogo" className="btn-primary">
                  Explorar Catálogo
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                >
                  <VehicleCard vehicle={vehicle} />
                  
                  {/* Botón de remover */}
                  <button
                    onClick={() => handleRemoveFavorite(vehicle.id)}
                    disabled={removingId === vehicle.id}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 shadow-lg"
                    title="Remover de favoritos"
                  >
                    {removingId === vehicle.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Favorites;