import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const favoritesData = await getFavorites();
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
        toast.error('Error al cargar tus favoritos');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadFavorites();
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleRemoveFavorite = async (vehicleId) => {
    try {
      setRemovingId(vehicleId);
      await removeFromFavorites(vehicleId);
      
      // Actualizar la lista local
      setFavorites(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      toast.success('Removido de favoritos');
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
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
          </div>
        </div>
      </div>

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
                No tienes favoritos aún
              </h2>
              <p className="text-gray-600 mb-6">
                Explora nuestro catálogo y guarda los vehículos que más te gusten.
              </p>
              <Link to="/catalogo" className="btn-primary">
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <VehicleCard vehicle={vehicle} />
                  
                  {/* Botón de remover */}
                  <button
                    onClick={() => handleRemoveFavorite(vehicle.id)}
                    disabled={removingId === vehicle.id}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
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
