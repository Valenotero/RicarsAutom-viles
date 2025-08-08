import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleCard from '../components/vehicles/VehicleCard';
import CatalogFilters from '../components/catalog/CatalogFilters';
import { getVehicles } from '../services/vehicleService';
import { testConnection } from '../supabase/config';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');

  // Obtener filtros de la URL
  const getFiltersFromURL = () => {
    const filters = {};
    const params = Object.fromEntries(searchParams.entries());
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        filters[key] = params[key];
      }
    });
    
    return filters;
  };

  // Aplicar filtros y ordenamiento
  const applyFiltersAndSort = (vehicles, filters, sortBy) => {
    let filtered = [...vehicles];

    // Aplicar filtros
    if (filters.brand) {
      filtered = filtered.filter(v => 
        v.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    if (filters.model) {
      filtered = filtered.filter(v => 
        v.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
    }
    if (filters.condition) {
      filtered = filtered.filter(v => v.condition === filters.condition);
    }
    if (filters.transmission) {
      filtered = filtered.filter(v => v.transmission === filters.transmission);
    }
    if (filters.fuelType) {
      filtered = filtered.filter(v => v.fuel_type === filters.fuelType);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(v => v.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(v => v.price <= parseInt(filters.maxPrice));
    }
    if (filters.minYear) {
      filtered = filtered.filter(v => v.year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      filtered = filtered.filter(v => v.year <= parseInt(filters.maxYear));
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'year-new':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year-old':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'km-low':
        filtered.sort((a, b) => a.kilometers - b.kilometers);
        break;
      case 'km-high':
        filtered.sort((a, b) => b.kilometers - a.kilometers);
        break;
      default:
        // newest (por defecto)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        console.log('📋 Iniciando carga de vehículos...');
        setLoading(true);
        
        // Cargar vehículos directamente (sin test previo)
        const allVehicles = await getVehicles();
        console.log('📊 Total vehículos obtenidos:', allVehicles?.length || 0);
        
        const filters = getFiltersFromURL();
        console.log('🔍 Filtros URL:', filters);
        
        const filteredAndSorted = applyFiltersAndSort(allVehicles, filters, sortBy);
        console.log('✅ Vehículos después de filtros:', filteredAndSorted?.length || 0);
        
        setVehicles(filteredAndSorted);
      } catch (error) {
        console.error('❌ Error cargando vehículos:', error);
        // No mostrar datos mock - la base debe estar vacía hasta que el admin agregue vehículos
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [searchParams, sortBy]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = () => {
    return Object.keys(getFiltersFromURL()).length > 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catálogo de Vehículos</h1>
              <p className="mt-2 text-gray-600">
                {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Modo de vista */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Ordenamiento */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field"
              >
                <option value="newest">Más recientes</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="year-new">Año: más reciente</option>
                <option value="year-old">Año: más antiguo</option>
                <option value="km-low">Km: menor a mayor</option>
                <option value="km-high">Km: mayor a menor</option>
              </select>
            </div>
          </div>

          {/* Filtros activos */}
          {hasActiveFilters() && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {Object.entries(getFiltersFromURL()).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {key}: {value}
                  <button
                    onClick={() => {
                      const newFilters = getFiltersFromURL();
                      delete newFilters[key];
                      handleFilterChange(newFilters);
                    }}
                    className="ml-1 hover:text-primary-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtros expandibles */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <CatalogFilters
                filters={getFiltersFromURL()}
                onFilterChange={handleFilterChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron vehículos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros de búsqueda para encontrar más resultados.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
