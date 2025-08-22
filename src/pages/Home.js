import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Star, MapPin, Phone, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroSearch from '../components/home/HeroSearch';
import VehicleCard from '../components/vehicles/VehicleCard';
import CategoryFilter from '../components/home/CategoryFilter';
import { vehicleService } from '../services/supabaseService'; // ← CAMBIO PRINCIPAL
import { supabase } from '../supabase/config'; // ← PARA TEST TEMPORAL
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [promotionVehicles, setPromotionVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionTest, setConnectionTest] = useState(null); // ← TEST TEMPORAL
  const carouselRef = useRef(null);

  useEffect(() => {
    // Test temporal de conexión
    const testConnection = async () => {
      try {
        console.log('🧪 Test: Probando conexión a Supabase...');
        const { data, error } = await supabase.from('vehicles').select('count').limit(1);
        console.log('📊 Test resultado:', { data, error });
        setConnectionTest({ success: !error, data, error });
      } catch (err) {
        console.error('💥 Test falló:', err);
        setConnectionTest({ success: false, error: err });
      }
    };

    const loadVehicles = async () => {
      try {
        console.log('🔄 Cargando vehículos desde Supabase...');
        const vehicles = await vehicleService.getVehicles(); // ← CAMBIO PRINCIPAL
        console.log('✅ Vehículos cargados:', vehicles);
        
        const featured = vehicles.filter(v => v.is_featured).slice(0, 6);
        const recent = vehicles.slice(0, 8);
        const promotion = vehicles.filter(v => v.is_promotion || v.has_promotion || v.promotion_price || v.discount).slice(0, 10);
        
        console.log('📊 Categorizados:', { 
          featured: featured.length, 
          recent: recent.length, 
          promotion: promotion.length,
          total: vehicles.length 
        });
        
        setFeaturedVehicles(featured);
        setRecentVehicles(recent);
        setPromotionVehicles(promotion);
      } catch (error) {
        console.error('❌ Error cargando vehículos:', error);
        toast.error('Error al cargar vehículos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
    loadVehicles();
  }, []);

  // Funciones para el carrusel
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320; // Ancho de una tarjeta + gap
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = () => {
    return carouselRef.current && carouselRef.current.scrollLeft > 0;
  };

  const canScrollRight = () => {
    if (!carouselRef.current) return false;
    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    return carouselRef.current.scrollLeft < maxScroll;
  };

  const categories = [
    { id: 'sedan', name: 'Sedán', icon: '🚗' },
    { id: 'suv', name: 'SUV', icon: '🚙' },
    { id: 'pickup', name: 'Pick-Up', icon: '🛻' },
    { id: 'hatchback', name: 'Hatchback', icon: '🚐' },
    { id: 'coupe', name: 'Coupé', icon: '🏎️' },
    { id: 'cabriolet', name: 'Cabriolet', icon: '🚗' },
    { id: 'premium', name: 'Premium', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen">
      {/* Panel de Debug Temporal - ELIMINAR DESPUÉS */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
        <h3 className="font-bold text-lg mb-2">🔍 Debug - Conexión Supabase</h3>
        
        <div className="mb-2">
          <strong>Conexión:</strong> 
          {connectionTest ? (
            connectionTest.success ? (
              <span className="text-green-600 ml-2">✅ Conectado</span>
            ) : (
              <span className="text-red-600 ml-2">❌ Error: {connectionTest.error?.message}</span>
            )
          ) : (
            <span className="text-yellow-600 ml-2">⏳ Probando...</span>
          )}
        </div>

        <div className="mb-2">
          <strong>Vehículos cargados:</strong>
          <span className="ml-2">
            {loading ? '⏳ Cargando...' : `✅ Featured: ${featuredVehicles.length}, Recent: ${recentVehicles.length}, Promotion: ${promotionVehicles.length}`}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          Abrí la consola del navegador (F12) para ver los detalles completos
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encuentra tu auto ideal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              La mejor selección de vehículos nuevos y usados con financiación a tu medida
            </p>
            
            {/* Hero Search */}
            <HeroSearch />
          </motion.div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por categoría
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra el tipo de vehículo que mejor se adapte a tus necesidades
            </p>
          </motion.div>
          
          <CategoryFilter categories={categories} />
        </div>
      </section>

      {/* Vehículos Destacados */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vehículos Destacados
              </h2>
              <p className="text-gray-600">
                Nuestras mejores ofertas seleccionadas para ti
              </p>
            </div>
            <Link
              to="/catalogo"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay vehículos destacados disponibles.</p>
            </div>
          )}
        </div>
      </section>

      {/* Carrusel de Autos en Oferta */}
      {promotionVehicles.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Ofertas Especiales
              </h2>
              <p className="text-lg text-gray-600">
                ¡No te pierdas estas increíbles ofertas por tiempo limitado!
              </p>
            </motion.div>

            <div className="relative">
              {/* Botones de navegación */}
              {canScrollLeft() && (
                <button
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {canScrollRight() && (
                <button
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  aria-label="Siguiente"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              )}

              {/* Carrusel horizontal con scroll */}
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth"
              >
                {promotionVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-80 carousel-item"
                  >
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl offer-card">
                      {/* Badge de oferta */}
                      <div className="relative">
                        <img
                          src={vehicle.images?.[0] || '/placeholder-car.jpg'}
                          alt={vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          🔥 OFERTA
                        </div>
                        {vehicle.promotion_price && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            -${(vehicle.price - vehicle.promotion_price).toLocaleString()}
                          </div>
                        )}
                        {vehicle.discount && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {vehicle.discount}% OFF
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-red-600">
                              ${vehicle.promotion_price ? vehicle.promotion_price.toLocaleString() : vehicle.price.toLocaleString()}
                            </span>
                            {vehicle.promotion_price && (
                              <span className="text-lg text-gray-400 line-through">
                                ${vehicle.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {vehicle.year}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{vehicle.kilometers?.toLocaleString() || vehicle.mileage?.toLocaleString()} km</span>
                          <span>{vehicle.fuel_type}</span>
                          <span>{vehicle.transmission}</span>
                        </div>
                        
                        <Link
                          to={`/vehiculo/${vehicle.id}`}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 text-center block shadow-lg hover:shadow-xl"
                        >
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Indicadores de scroll */}
              <div className="flex justify-center mt-6 space-x-2">
                {promotionVehicles.map((_, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-primary-500 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vehículos Recientes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recientemente Añadidos
            </h2>
            <p className="text-lg text-gray-600">
              Los últimos vehículos que se sumaron a nuestro catálogo
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay vehículos recientes disponibles.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Contáctanos y te ayudaremos a encontrar el vehículo perfecto
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Contactar por WhatsApp
              </a>
              <Link
                to="/catalogo"
                className="btn-outline border-white text-white hover:bg-white hover:text-primary-600"
              >
                Ver Catálogo Completo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;