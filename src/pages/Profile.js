import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Eye, Heart, Calendar, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [likedVehicles, setLikedVehicles] = useState([]);

  useEffect(() => {
    // Cargar vehículos vistos recientemente desde localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed.slice(0, 5)); // Últimos 5

    // Cargar vehículos con like desde localStorage
    const liked = JSON.parse(localStorage.getItem('likedVehicles') || '[]');
    setLikedVehicles(liked);
  }, []);

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
                Bienvenido de vuelta, {currentUser.email}
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
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Vistos Recientemente
              </h2>
            </div>
            {recentlyViewed.length > 0 ? (
              <div className="space-y-2">
                {recentlyViewed.map((vehicle, index) => (
                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No has visto ningún vehículo recientemente
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Vehículos Favoritos
              </h2>
            </div>
            {likedVehicles.length > 0 ? (
              <div className="space-y-2">
                {likedVehicles.slice(0, 5).map((vehicleId, index) => (
                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    Vehículo ID: {vehicleId}
                  </div>
                ))}
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
                {likedVehicles.length}
              </div>
              <div className="text-sm text-gray-600">Favoritos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userRole === 'admin' ? 'Admin' : 'Cliente'}
              </div>
              <div className="text-sm text-gray-600">Tipo de Usuario</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
