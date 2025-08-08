import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const VehicleCard = ({ vehicle, compact = false }) => {
  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceARS = (priceUSD) => {
    // Tasa de cambio aproximada (esto debería venir de una API)
    const exchangeRate = 1000;
    const priceARS = priceUSD * exchangeRate;
    return formatPrice(priceARS, 'ARS');
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="card overflow-hidden"
      >
        <Link to={`/vehiculo/${vehicle.id}`}>
          <div className="relative">
            <img
              src={vehicle.images[0] || '/placeholder-car.jpg'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            {vehicle.featured && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Destacado
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {vehicle.year} • {vehicle.kilometers.toLocaleString()} km
            </p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(vehicle.price)}
              </span>
              <span className="text-xs text-gray-500">
                {formatPriceARS(vehicle.price)}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="card overflow-hidden"
    >
      <Link to={`/vehiculo/${vehicle.id}`}>
        <div className="relative">
          <img
            src={vehicle.images[0] || '/placeholder-car.jpg'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          {vehicle.featured && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Destacado
            </div>
          )}
          {vehicle.promotion && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Oferta
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-gray-600">{vehicle.version}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(vehicle.price)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPriceARS(vehicle.price)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {vehicle.year}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gauge className="w-4 h-4 mr-2" />
              {vehicle.kilometers.toLocaleString()} km
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {vehicle.location}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {vehicle.transmission}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {vehicle.features?.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {vehicle.features?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{vehicle.features.length - 3} más
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}
            </span>
            <span className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200">
              Ver detalles →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VehicleCard;
