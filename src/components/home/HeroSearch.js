import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    brand: '',
    model: '',
    priceRange: '',
    type: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(searchData).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    navigate(`/catalogo?${params.toString()}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Marca */}
          <div className="relative">
            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="brand"
              value={searchData.brand}
              onChange={handleChange}
              className="search-select pl-10"
            >
              <option value="">Todas las marcas</option>
              <option value="toyota">Toyota</option>
              <option value="honda">Honda</option>
              <option value="ford">Ford</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="volkswagen">Volkswagen</option>
              <option value="bmw">BMW</option>
              <option value="mercedes">Mercedes-Benz</option>
              <option value="audi">Audi</option>
            </select>
          </div>

          {/* Modelo */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="model"
              value={searchData.model}
              onChange={handleChange}
              placeholder="Modelo"
              className="input-field pl-10"
            />
          </div>

          {/* Rango de precio */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="priceRange"
              value={searchData.priceRange}
              onChange={handleChange}
              className="select-field pl-10"
            >
              <option value="">Cualquier precio</option>
              <option value="0-5000">Hasta $5,000 USD</option>
              <option value="5000-10000">$5,000 - $10,000 USD</option>
              <option value="10000-20000">$10,000 - $20,000 USD</option>
              <option value="20000-50000">$20,000 - $50,000 USD</option>
              <option value="50000-100000">$50,000 - $100,000 USD</option>
              <option value="100000-500000">$100,000 - $500,000 USD</option>
              <option value="500000-1000000">$500,000 - $1,000,000 USD</option>
              <option value="1000000-150000000">$1,000,000 - $150,000,000 USD</option>
              <option value="150000000+">Más de $150,000,000 USD</option>
            </select>
          </div>

          {/* Tipo de vehículo */}
          <div className="relative">
            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="type"
              value={searchData.type}
              onChange={handleChange}
              className="select-field pl-10"
            >
              <option value="">Todos los tipos</option>
              <option value="sedan">Sedán</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pick-Up</option>
              <option value="hatchback">Hatchback</option>
              <option value="coupe">Coupé</option>
              <option value="cabriolet">Cabriolet</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-lg font-semibold"
          >
            Buscar Vehículos
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default HeroSearch;
