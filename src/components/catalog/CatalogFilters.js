import React, { useState, useEffect, useRef } from 'react';
import { Search, DollarSign, Calendar, Gauge } from 'lucide-react';

const CatalogFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || ''
  });
  const debounceTimeoutRef = useRef(null);

  // Sincronizar con filtros externos
  useEffect(() => {
    setLocalFilters(filters);
    setPriceInputs({
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || ''
    });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    setPriceInputs({ minPrice: '', maxPrice: '' });
    onFilterChange({});
  };

  const handlePriceInputChange = (key, value) => {
    setPriceInputs(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // No aplicar filtro inmediatamente, solo actualizar el input
  };

  const applyPriceFilter = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceKeyPress = (e, key) => {
    if (e.key === 'Enter') {
      applyPriceFilter(key, priceInputs[key]);
    }
  };

  const brands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 
    'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai',
    'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Peugeot',
    'Renault', 'Fiat', 'Volvo', 'Jaguar', 'Land Rover'
  ];

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedán' },
    { value: 'suv', label: 'SUV' },
    { value: 'pickup', label: 'Pick-Up' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'coupe', label: 'Coupé' },
    { value: 'cabriolet', label: 'Cabriolet' },
    { value: 'premium', label: 'Premium' }
  ];

  const conditions = [
    { value: 'new', label: 'Nuevo' },
    { value: 'used', label: 'Usado' }
  ];

  const transmissions = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automático' },
    { value: 'cvt', label: 'CVT' }
  ];

  const fuelTypes = [
    { value: 'gasoline', label: 'Gasolina' },
    { value: 'diesel', label: 'Diésel' },
    { value: 'hybrid', label: 'Híbrido' },
    { value: 'electric', label: 'Eléctrico' },
    { value: 'lpg', label: 'GLP' }
  ];

  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Limpiar todos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Búsqueda por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Marca o modelo..."
              value={localFilters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca
          </label>
          <select
            value={localFilters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="select-field"
          >
            <option value="">Todas las marcas</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Tipo de vehículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="select-field"
          >
            <option value="">Todos los tipos</option>
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Condición */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condición
          </label>
          <select
            value={localFilters.condition || ''}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="select-field"
          >
            <option value="">Todas las condiciones</option>
            {conditions.map(condition => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>
        </div>

        {/* Rango de precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio mínimo (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              placeholder="0"
              value={priceInputs.minPrice}
              onChange={(e) => handlePriceInputChange('minPrice', e.target.value)}
              onKeyPress={(e) => handlePriceKeyPress(e, 'minPrice')}
              onBlur={() => applyPriceFilter('minPrice', priceInputs.minPrice)}
              className="input-field pl-10"
              title="Escribe el precio y presiona Enter o haz clic fuera para aplicar"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">💡 Presiona Enter para buscar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio máximo (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              placeholder="Sin límite"
              value={priceInputs.maxPrice}
              onChange={(e) => handlePriceInputChange('maxPrice', e.target.value)}
              onKeyPress={(e) => handlePriceKeyPress(e, 'maxPrice')}
              onBlur={() => applyPriceFilter('maxPrice', priceInputs.maxPrice)}
              className="input-field pl-10"
              title="Escribe el precio y presiona Enter o haz clic fuera para aplicar"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">💡 Presiona Enter para buscar</p>
        </div>

        {/* Año mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año mínimo
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={localFilters.minYear || ''}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
              className="select-field pl-10"
            >
              <option value="">Cualquier año</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Año máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año máximo
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={localFilters.maxYear || ''}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
              className="select-field pl-10"
            >
              <option value="">Cualquier año</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transmisión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmisión
          </label>
          <select
            value={localFilters.transmission || ''}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className="select-field"
          >
            <option value="">Cualquier transmisión</option>
            {transmissions.map(transmission => (
              <option key={transmission.value} value={transmission.value}>{transmission.label}</option>
            ))}
          </select>
        </div>

        {/* Tipo de combustible */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Combustible
          </label>
          <select
            value={localFilters.fuelType || ''}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            className="select-field"
          >
            <option value="">Cualquier combustible</option>
            {fuelTypes.map(fuelType => (
              <option key={fuelType.value} value={fuelType.value}>{fuelType.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros activos */}
      {Object.keys(localFilters).length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros aplicados:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                {key}: {value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-2 hover:text-primary-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;
