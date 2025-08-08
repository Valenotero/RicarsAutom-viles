import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Gauge, 
  Star, 
  Share2, 
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import VehicleCard from '../components/vehicles/VehicleCard';
import { getVehicleById, getSimilarVehicles } from '../services/vehicleService';
import { addToRecentlyViewed, addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const VehicleDetail = () => {
  const { id } = useParams();
  const { currentUser, isClient } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        const vehicleData = await getVehicleById(id);
        setVehicle(vehicleData);
        
        // Agregar a vistos recientemente
        await addToRecentlyViewed(id);
        
        // Incrementar contador de vistas
        try {
          const { supabase } = await import('../supabase/config');
          await supabase.rpc('increment_vehicle_views', { vehicle_uuid: id });
        } catch (error) {
          console.error('Error incrementando vistas:', error);
        }
        
        // Cargar vehículos similares
        const similar = await getSimilarVehicles(vehicleData);
        setSimilarVehicles(similar);
        
        // Verificar si está en favoritos
        if (currentUser) {
          const favorited = await isFavorite(id);
          setIsFavorited(favorited);
        }
      } catch (error) {
        console.error('Error cargando vehículo:', error);
        toast.error('Error al cargar el vehículo');
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id, currentUser]);

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceARS = (priceUSD) => {
    const exchangeRate = 1000;
    const priceARS = priceUSD * exchangeRate;
    return formatPrice(priceARS, 'ARS');
  };

  const handleWhatsAppContact = () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para contactar');
      return;
    }

    const message = `Hola! Me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que vi en Ricars Automóviles. ¿Podrían darme más información?`;
    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookContact = () => {
    const facebookUrl = 'https://facebook.com/ricarsautomotores';
    window.open(facebookUrl, '_blank');
  };

  const handleMercadoLibreContact = () => {
    const mercadolibreUrl = 'https://www.mercadolibre.com.ar/perfil/ricars-automotores';
    window.open(mercadolibreUrl, '_blank');
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    try {
      if (isFavorited) {
        await removeFromFavorites(id);
        setIsFavorited(false);
        toast.success('Removido de favoritos');
      } else {
        await addToFavorites(id);
        setIsFavorited(true);
        toast.success('Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error manejando favorito:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vehículo no encontrado
          </h2>
          <Link to="/catalogo" className="btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Inicio
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link to="/catalogo" className="ml-4 text-gray-500 hover:text-gray-700">
                    Catálogo
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="ml-4 text-gray-900 font-medium">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={vehicle.images[currentImageIndex] || '/placeholder-car.jpg'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {/* Controles de galería */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {vehicle.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex space-x-2">
                {vehicle.featured && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Destacado
                  </span>
                )}
                {vehicle.promotion && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Oferta
                  </span>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-5 gap-2">
              {vehicle.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-full h-20 object-cover rounded-lg border-2 transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'border-primary-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${vehicle.brand} ${vehicle.model} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {vehicle.version}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(vehicle.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatPriceARS(vehicle.price)}
                </div>
              </div>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{vehicle.year}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Gauge className="w-5 h-5 mr-2" />
                <span>{vehicle.kilometers.toLocaleString()} km</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{vehicle.location}</span>
              </div>
              <div className="flex items-center text-gray-600 capitalize">
                <span>{vehicle.transmission}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleWhatsAppContact}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Contactar por WhatsApp
              </button>
              
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-lg border transition-colors duration-200 ${
                  isFavorited 
                    ? 'border-red-500 text-red-600 bg-red-50' 
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors duration-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Botones de redes sociales */}
            <div className="flex space-x-3">
              <button
                onClick={handleFacebookContact}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Facebook
              </button>
              
              <button
                onClick={handleMercadoLibreContact}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                MercadoLibre
              </button>
            </div>
          </div>
        </div>

        {/* Ficha técnica */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ficha Técnica</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión:</span>
                    <span className="font-medium">{vehicle.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Año:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kilometraje:</span>
                    <span className="font-medium">{vehicle.kilometers.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condición:</span>
                    <span className="font-medium capitalize">{vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Especificaciones</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transmisión:</span>
                    <span className="font-medium capitalize">{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Combustible:</span>
                    <span className="font-medium capitalize">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium capitalize">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">{vehicle.type}</span>
                  </div>
                  {vehicle.engine && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motor:</span>
                      <span className="font-medium">{vehicle.engine}</span>
                    </div>
                  )}
                  {vehicle.power && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potencia:</span>
                      <span className="font-medium">{vehicle.power}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
                <div className="space-y-2">
                  {vehicle.features?.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehículos similares */}
        {similarVehicles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehículos Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarVehicles.map((similarVehicle) => (
                <VehicleCard
                  key={similarVehicle.id}
                  vehicle={similarVehicle}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
