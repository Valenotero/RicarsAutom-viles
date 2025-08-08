import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Star, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroSearch from '../components/home/HeroSearch';
import VehicleCard from '../components/vehicles/VehicleCard';
import CategoryFilter from '../components/home/CategoryFilter';
import { getVehicles } from '../services/vehicleService';

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicles = await getVehicles();
        const featured = vehicles.filter(v => v.is_featured).slice(0, 6);
        const recent = vehicles.slice(0, 8);
        
        setFeaturedVehicles(featured);
        setRecentVehicles(recent);
      } catch (error) {
        console.error('Error cargando vehículos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
              ))}
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
