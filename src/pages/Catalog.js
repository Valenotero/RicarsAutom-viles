import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleCard from '../components/vehicles/VehicleCard';
import CatalogFilters from '../components/catalog/CatalogFilters';
import { getVehicles } from '../services/vehicleService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

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

  // Función mejorada para parsear rangos de precios
  const parsePriceRange = (priceRangeString) => {
    if (!priceRangeString) return { min: null, max: null };
    
    // Manejar diferentes formatos de precio
    // Formato: "5000-10000" o "priceRange: 5000-10000" o "Hasta $5,000 USD"
    let cleanString = priceRangeString.toString();
    
    // Remover texto descriptivo
    cleanString = cleanString
      .replace(/priceRange:\s*/i, '')
      .replace(/Hasta \$/, '0-')
      .replace(/\$|,|USD/g, '')
      .replace(/Más de /, '')
      .replace(/\s+/g, '');
    
    // Si contiene un guión, es un rango
    if (cleanString.includes('-')) {
      const [min, max] = cleanString.split('-').map(val => {
        const num = parseInt(val);
        return isNaN(num) ? null : num;
      });
      return { min, max };
    }
    
    // Si es un solo número, tratarlo como precio mínimo
    const singlePrice = parseInt(cleanString);
    if (!isNaN(singlePrice)) {
      return { min: singlePrice, max: null };
    }
    
    return { min: null, max: null };
  };

  // Aplicar filtros y ordenamiento corregido
  const applyFiltersAndSort = (vehicles, filters, sortBy) => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    let filtered = [...list];

    console.log('🔍 Aplicando filtros:', filters);
    console.log('📊 Vehículos iniciales:', filtered.length);

    // Aplicar filtros básicos
    if (filters.brand) {
      filtered = filtered.filter(v => 
        v.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
      console.log(`📋 Después de filtro marca (${filters.brand}):`, filtered.length);
    }
    
    if (filters.model) {
      filtered = filtered.filter(v => 
        v.model?.toLowerCase().includes(filters.model.toLowerCase())
      );
      console.log(`🚗 Después de filtro modelo (${filters.model}):`, filtered.length);
    }
    
    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
      console.log(`🏷️ Después de filtro tipo (${filters.type}):`, filtered.length);
    }
    
    if (filters.condition) {
      filtered = filtered.filter(v => v.condition === filters.condition);
      console.log(`⚙️ Después de filtro condición (${filters.condition}):`, filtered.length);
    }
    
    if (filters.transmission) {
      filtered = filtered.filter(v => v.transmission === filters.transmission);
      console.log(`🔧 Después de filtro transmisión (${filters.transmission}):`, filtered.length);
    }
    
    if (filters.fuelType) {
      filtered = filtered.filter(v => v.fuel_type === filters.fuelType);
      console.log(`⛽ Después de filtro combustible (${filters.fuelType}):`, filtered.length);
    }

    // Filtro de precios corregido
    if (filters.priceRange) {
      const { min, max } = parsePriceRange(filters.priceRange);
      console.log(`💰 Rango de precios parseado:`, { min, max, original: filters.priceRange });
      
      if (min !== null) {
        filtered = filtered.filter(v => {
          const vehiclePrice = v.promotion_price || v.price || 0;
          const isInRange = vehiclePrice >= min;
          console.log(`💲 Vehículo ${v.brand} ${v.model} - Precio: $${vehiclePrice}, Min: $${min}, Incluido: ${isInRange}`);
          return isInRange;
        });
      }
      
      if (max !== null) {
        filtered = filtered.filter(v => {
          const vehiclePrice = v.promotion_price || v.price || 0;
          const isInRange = vehiclePrice <= max;
          console.log(`💲 Vehículo ${v.brand} ${v.model} - Precio: $${vehiclePrice}, Max: $${max}, Incluido: ${isInRange}`);
          return isInRange;
        });
      }
      
      console.log(`💰 Después de filtro precios (${min}-${max}):`, filtered.length);
    }

    // Filtros de precio individuales (por compatibilidad)
    if (filters.minPrice) {
      const minPrice = parseInt(filters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(v => {
          const vehiclePrice = v.promotion_price || v.price || 0;
          return vehiclePrice >= minPrice;
        });
        console.log(`💰 Después de precio mínimo ($${minPrice}):`, filtered.length);
      }
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseInt(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(v => {
          const vehiclePrice = v.promotion_price || v.price || 0;
          return vehiclePrice <= maxPrice;
        });
        console.log(`💰 Después de precio máximo ($${maxPrice}):`, filtered.length);
      }
    }

    // Filtros de año
    if (filters.minYear) {
      filtered = filtered.filter(v => v.year >= parseInt(filters.minYear));
      console.log(`📅 Después de año mínimo (${filters.minYear}):`, filtered.length);
    }
    
    if (filters.maxYear) {
      filtered = filtered.filter(v => v.year <= parseInt(filters.maxYear));
      console.log(`📅 Después de año máximo (${filters.maxYear}):`, filtered.length);
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.promotion_price || a.price || 0;
          const priceB = b.promotion_price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.promotion_price || a.price || 0;
          const priceB = b.promotion_price || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'year-new':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'year-old':
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'km-low':
        filtered.sort((a, b) => (a.kilometers || a.mileage || 0) - (b.kilometers || b.mileage || 0));
        break;
      case 'km-high':
        filtered.sort((a, b) => (b.kilometers || b.mileage || 0) - (a.kilometers || a.mileage || 0));
        break;
      default:
        // newest (por defecto)
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    console.log('✅ Vehículos finales después de filtros y ordenamiento:', filtered.length);
    return filtered;
  };

  // Función para formatear el display de filtros activos
  const formatFilterDisplay = (key, value) => {
    switch (key) {
      case 'priceRange':
        const { min, max } = parsePriceRange(value);
        if (min && max) {
          return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        } else if (min) {
          return `Desde $${min.toLocaleString()}`;
        } else if (max) {
          return `Hasta $${max.toLocaleString()}`;
        }
        return value;
      case 'minPrice':
        return `Desde $${parseInt(value).toLocaleString()}`;
      case 'maxPrice':
        return `Hasta $${parseInt(value).toLocaleString()}`;
      case 'minYear':
        return `Desde ${value}`;
      case 'maxYear':
        return `Hasta ${value}`;
      default:
        return value;
    }
  };

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        console.log('📋 Iniciando carga de vehículos...');
        setLoading(true);
        
        const allVehicles = await getVehicles();
        console.log('📊 Total vehículos obtenidos:', allVehicles?.length || 0);
        
        // Log de algunos precios para debug
        if (allVehicles && allVehicles.length > 0) {
          console.log('💰 Muestra de precios de vehículos:');
          allVehicles.slice(0, 5).forEach(v => {
            console.log(`  ${v.brand} ${v.model}: $${v.price} ${v.promotion_price ? `(oferta: $${v.promotion_price})` : ''}`);
          });
        }
        
        const filters = getFiltersFromURL();
        console.log('🔍 Filtros URL:', filters);
        
        const filteredAndSorted = applyFiltersAndSort(allVehicles, filters, sortBy);
        console.log('✅ Vehículos después de filtros:', filteredAndSorted?.length || 0);
        
        setVehicles(filteredAndSorted);
      } catch (error) {
        console.error('❌ Error cargando vehículos:', error);
        toast.error('Hubo un problema al cargar los vehículos');
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [searchParams, sortBy]);

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Nuevos filtros recibidos:', newFilters);
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
                  {key}: {formatFilterDisplay(key, value)}
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