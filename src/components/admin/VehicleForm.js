import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createVehicle, updateVehicle, uploadImage } from '../../services/vehicleService';
import toast from 'react-hot-toast';

const VehicleForm = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    version: '',
    year: new Date().getFullYear(),
    kilometers: 0,
    price: 0,
    currency: 'USD', // Nueva campo para la moneda
    condition: 'used',
    transmission: 'manual',
    fuelType: 'gasoline',
    color: '',
    type: 'sedan',
    location: '',
    engine: '',
    power: '',
    features: [],
    featured: false,
    promotion: false
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        version: vehicle.version || '',
        year: vehicle.year || new Date().getFullYear(),
        kilometers: vehicle.kilometers || 0,
        price: vehicle.price || vehicle.price_ars || 0,
        currency: vehicle.price && vehicle.price > 0 ? 'USD' : 'ARS', // Detectar moneda basada en qué campo tiene valor
        condition: vehicle.condition || 'used',
        transmission: vehicle.transmission || 'manual',
        fuelType: vehicle.fuel_type || 'gasoline', // Corregir nombre del campo
        color: vehicle.color || '',
        type: vehicle.type || 'sedan',
        location: vehicle.location || '',
        engine: vehicle.engine || '',
        power: vehicle.power || '',
        features: vehicle.features || [],
        featured: vehicle.is_featured || false, // Corregir nombre del campo
        promotion: vehicle.is_promotion || false // Corregir nombre del campo
      });
      
      // Cargar imágenes existentes
      setExistingImages(vehicle.images || []);
      setImages([]); // Limpiar las nuevas imágenes
      setImagesToDelete([]); // Limpiar imágenes a eliminar
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToDelete]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const moveExistingImage = (fromIndex, toIndex) => {
    setExistingImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const moveFeature = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      const [movedFeature] = newFeatures.splice(fromIndex, 1);
      newFeatures.splice(toIndex, 0, movedFeature);
      return { ...prev, features: newFeatures };
    });
  };

  const togglePredefinedFeature = (feature) => {
    setFormData(prev => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists 
          ? prev.features.filter(f => f !== feature)
          : [...prev.features, feature]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      console.log('⏳ Ya se está procesando, ignorando...');
      return;
    }
    
    setLoading(true);

    try {
      // Validar que haya precio
      const priceValue = parseFloat(formData.price) || 0;
      if (priceValue <= 0) {
        toast.error('Debes ingresar un precio válido');
        setLoading(false);
        return;
      }
      
      // Transformar datos para que coincidan con la estructura de Supabase
      
      const vehicleData = {
        brand: formData.brand || '',
        model: formData.model || '',
        year: parseInt(formData.year) || new Date().getFullYear(),
        kilometers: parseInt(formData.kilometers) || 0,
        // Lógica de moneda: solo llenar el campo correspondiente
        price: formData.currency === 'USD' ? priceValue : null,
        price_ars: formData.currency === 'ARS' ? priceValue : null,
        condition: formData.condition || 'used',
        transmission: formData.transmission || 'manual',
        fuel_type: formData.fuelType || 'gasoline', // Asegurar que tenga un valor por defecto
        color: formData.color || '',
        type: formData.type || 'sedan',
        location: formData.location || '',
        engine: formData.engine || '',
        power: formData.power || '',
        features: formData.features || [],
        is_featured: formData.featured || false, // Corregir nombre del campo
        is_promotion: formData.promotion || false, // Corregir nombre del campo
        images: []
      };

      console.log('📝 Datos del formulario:', formData);
      console.log('💰 Precio original:', formData.price, 'Moneda:', formData.currency);
      console.log('💰 Precio procesado:', priceValue);
      console.log('📝 Datos del vehículo a guardar:', vehicleData);
      console.log('🔍 fuel_type específicamente:', vehicleData.fuel_type);
      console.log('💵 price (USD):', vehicleData.price);
      console.log('💱 price_ars (ARS):', vehicleData.price_ars);

      if (vehicle) {
        // Actualizar vehículo existente
        console.log('🔄 Actualizando vehículo existente...');
        
        // Validar que haya al menos una imagen (existente o nueva)
        if (existingImages.length === 0 && images.length === 0) {
          toast.error('Debes tener al menos una imagen para el vehículo');
          setLoading(false);
          return;
        }

        // Eliminar imágenes marcadas para eliminar del storage
        if (imagesToDelete.length > 0) {
          console.log('🗑️ Eliminando imágenes del storage:', imagesToDelete.length);
          for (const imageUrl of imagesToDelete) {
            try {
              // Extraer el path de la imagen de la URL
              const urlParts = imageUrl.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const filePath = `vehicles/${fileName}`;
              
              console.log('🗑️ Eliminando imagen del storage:', filePath);
              
              // Importar supabase para eliminar imagen
              const { supabase } = await import('../../supabase/config');
              const { error: storageError } = await supabase.storage
                .from('vehicle-images')
                .remove([filePath]);
              
              if (storageError) {
                console.error('❌ Error eliminando imagen del storage:', storageError);
              } else {
                console.log('✅ Imagen eliminada del storage exitosamente:', filePath);
              }
            } catch (imageError) {
              console.error('❌ Error procesando eliminación de imagen:', imageError);
            }
          }
        }
        
        // Si hay nuevas imágenes, subirlas
        const newImageUrls = [];
        if (images.length > 0) {
          console.log('📤 Subiendo nuevas imágenes...');
          for (let i = 0; i < images.length; i++) {
            try {
              console.log(`📷 Subiendo nueva imagen ${i + 1}/${images.length}...`);
              const imageUrl = await uploadImage(images[i], vehicle.id, existingImages.length + i);
              newImageUrls.push(imageUrl);
              console.log(`✅ Nueva imagen ${i + 1} subida exitosamente:`, imageUrl);
            } catch (imageError) {
              console.error(`❌ Error subiendo nueva imagen ${i + 1}:`, imageError);
              toast.error(`Error subiendo imagen ${i + 1}: ${imageError.message}`);
            }
          }
        }
        
        // Combinar imágenes existentes con las nuevas
        const allImages = [...existingImages, ...newImageUrls];
        console.log('🖼️ Imágenes finales:', allImages);
        
        // Actualizar vehículo con todas las imágenes
        await updateVehicle(vehicle.id, { ...vehicleData, images: allImages });
        toast.success('Vehículo actualizado exitosamente');
      } else {
        // Crear nuevo vehículo
        if (images.length === 0) {
          toast.error('Debes subir al menos una imagen');
          setLoading(false);
          return;
        }

        console.log('📤 Subiendo imágenes...');
        console.log('🖼️ Imágenes a subir:', images.length);
        console.log('🖼️ Detalles de imágenes:', images.map(img => ({ name: img.name, size: img.size, type: img.type })));
        
        // Primero crear el vehículo sin imágenes
        const newVehicle = await createVehicle(vehicleData);
        console.log('✅ Vehículo creado:', newVehicle);
        console.log('🆔 ID del vehículo:', newVehicle.id);

        // Luego subir las imágenes una por una
        const imageUrls = [];
        console.log('🔄 Iniciando bucle de subida de imágenes...');
        
        for (let i = 0; i < images.length; i++) {
          try {
            console.log(`📷 Subiendo imagen ${i + 1}/${images.length}...`);
            console.log(`📄 Archivo:`, images[i].name, '| Tamaño:', images[i].size, '| Tipo:', images[i].type);
            
            const imageUrl = await uploadImage(images[i], newVehicle.id, i);
            imageUrls.push(imageUrl);
            console.log(`✅ Imagen ${i + 1} subida exitosamente:`, imageUrl);
          } catch (imageError) {
            console.error(`❌ Error subiendo imagen ${i + 1}:`, imageError);
            console.error(`❌ Detalles completos del error:`, {
              name: imageError.name,
              message: imageError.message,
              stack: imageError.stack
            });
            toast.error(`Error subiendo imagen ${i + 1}: ${imageError.message}`);
          }
        }
        
        console.log('📊 Resumen de subida:');
        console.log('- Total imágenes:', images.length);
        console.log('- Subidas exitosas:', imageUrls.length);
        console.log('- URLs generadas:', imageUrls);

        // Actualizar el vehículo con las URLs de las imágenes
        if (imageUrls.length > 0) {
          console.log('🔄 Actualizando vehículo con imágenes...');
          await updateVehicle(newVehicle.id, { ...vehicleData, images: imageUrls });
          console.log('✅ Vehículo actualizado con imágenes');
        }

        toast.success('Vehículo creado exitosamente');
      }
      onSuccess();
    } catch (error) {
      console.error('❌ Error guardando vehículo:', error);
      toast.error(`Error al guardar el vehículo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const brands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen',
    'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai',
    'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Peugeot',
    'Renault', 'Fiat', 'Volvo', 'Jaguar', 'Land Rover'
  ];

  const predefinedFeatures = [
    'Aire acondicionado', 'Calefacción', 'Dirección asistida', 'Vidrios eléctricos',
    'Cierre centralizado', 'Alarma', 'Bluetooth', 'Radio AM/FM', 'USB/AUX',
    'Pantalla táctil', 'GPS/Navegación', 'Cámara de reversa', 'Sensores de estacionamiento',
    'ABS', 'Airbag conductor', 'Airbag acompañante', 'Airbags laterales',
    'Control de estabilidad', 'Control de tracción', 'Frenos de disco',
    'Llantas de aleación', 'Techo corredizo', 'Quemacocos', 'Barras portaequipaje',
    'Enganche para remolque', 'Asientos de cuero', 'Asientos calefaccionados',
    'Asientos eléctricos', 'Volante multifunción', 'Computadora de viaje',
    'Luces LED', 'Luces de xenón', 'Faros antiniebla', 'Espejos eléctricos',
    'Cristales polarizados', 'Arranque sin llave', 'Cargador inalámbrico'
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {vehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="select-field"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Ej: Corolla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Versión
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: XEI 2.0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="select-field"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kilometraje *
                    </label>
                    <input
                      type="number"
                      name="kilometers"
                      value={formData.kilometers}
                      onChange={handleChange}
                      required
                      min="0"
                      max="999999"
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <div className="flex space-x-2">
                    {/* Selector de moneda */}
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="select-field w-24"
                    >
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                    
                    {/* Campo de precio */}
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {formData.currency === 'USD' ? '$' : '$'}
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="input-field pl-8"
                        placeholder={formData.currency === 'USD' ? '150000000' : '150000000000'}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.currency === 'USD' 
                      ? '💡 Precio en dólares estadounidenses'
                      : '💡 Precio en pesos argentinos'
                    }
                  </p>
                </div>
              </div>

              {/* Especificaciones */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Especificaciones</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condición *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      className="select-field"
                    >
                      {conditions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="select-field"
                    >
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmisión *
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      required
                      className="select-field"
                    >
                      {transmissions.map(transmission => (
                        <option key={transmission.value} value={transmission.value}>
                          {transmission.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Combustible *
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      required
                      className="select-field"
                    >
                      {fuelTypes.map(fuelType => (
                        <option key={fuelType.value} value={fuelType.value}>
                          {fuelType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: Blanco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: CABA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motor
                    </label>
                    <input
                      type="text"
                      name="engine"
                      value={formData.engine}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 2.0L"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potencia
                    </label>
                    <input
                      type="text"
                      name="power"
                      value={formData.power}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 150 HP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Características</h3>
              <div className="space-y-4">
                
                {/* Selector múltiple de características predefinidas */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                    className="w-full input-field flex items-center justify-between bg-white"
                  >
                    <span className="text-gray-700">
                      {formData.features.length === 0 
                        ? 'Seleccionar características...' 
                        : `${formData.features.length} características seleccionadas`
                      }
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showFeatureDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showFeatureDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                      >
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {predefinedFeatures.map((feature) => (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => togglePredefinedFeature(feature)}
                              className={`flex items-center p-2 text-sm rounded hover:bg-gray-50 transition-colors ${
                                formData.features.includes(feature)
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                                formData.features.includes(feature)
                                  ? 'bg-primary-600 border-primary-600'
                                  : 'border-gray-300'
                              }`}>
                                {formData.features.includes(feature) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              {feature}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Agregar característica personalizada */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Agregar característica personalizada..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn-secondary flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </button>
                </div>

                {/* Lista de características seleccionadas con posibilidad de reordenar */}
                {formData.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Características seleccionadas ({formData.features.length}):</h4>
                    <div className="space-y-1">
                      {formData.features.map((feature, index) => (
                        <motion.div
                          key={`${feature}-${index}`}
                          layout
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm text-gray-700 flex-1">{feature}</span>
                          <div className="flex items-center space-x-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveFeature(index, index - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover arriba"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < formData.features.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveFeature(index, index + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover abajo"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opciones */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Marcar como destacado
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="promotion"
                    checked={formData.promotion}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Marcar como promoción
                  </label>
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Imágenes {(existingImages.length + images.length > 0) && `(${existingImages.length + images.length} total)`}
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="text-primary-600 hover:text-primary-500 font-medium">
                          {images.length === 0 ? 'Seleccionar múltiples imágenes' : 'Agregar más imágenes'}
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecciona múltiples archivos • PNG, JPG, GIF hasta 10MB cada una
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        💡 Mantén presionado Ctrl/Cmd para seleccionar varias imágenes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Imágenes actuales ({existingImages.length}):
                    </h4>
                    <div className="space-y-2">
                      {existingImages.map((imageUrl, index) => (
                        <motion.div
                          key={`existing-${index}`}
                          layout
                          className="flex items-center bg-blue-50 rounded-lg p-3 border border-blue-200"
                        >
                          {/* Imagen miniatura */}
                          <img
                            src={imageUrl}
                            alt={`Imagen existente ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                          
                          {/* Fallback para imagen con error */}
                          <div 
                            className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-500 hidden"
                            style={{ display: 'none' }}
                          >
                            Error
                          </div>
                          
                          {/* Información de la imagen */}
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              Imagen {index + 1}
                            </p>
                            <p className="text-xs text-blue-600">
                              Imagen actual del vehículo
                            </p>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Imagen principal
                              </span>
                            )}
                          </div>

                          {/* Controles de orden y eliminación */}
                          <div className="flex items-center space-x-1 ml-3">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, index - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover arriba"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < existingImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, index + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover abajo"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors ml-2"
                              title="Eliminar imagen"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nuevas imágenes */}
                {images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Nuevas imágenes a agregar ({images.length}):
                    </h4>
                    <div className="space-y-2">
                      {images.map((image, index) => (
                        <motion.div
                          key={`${image.name}-${index}`}
                          layout
                          className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200"
                        >
                          {/* Imagen miniatura */}
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Imagen ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                          
                          {/* Información de la imagen */}
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(image.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                                Imagen principal
                              </span>
                            )}
                          </div>

                          {/* Controles de orden */}
                          <div className="flex items-center space-x-1 ml-3">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover arriba"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mover abajo"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors ml-2"
                              title="Eliminar imagen"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 Las nuevas imágenes se agregarán después de las existentes. Puedes reordenar todas las imágenes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  vehicle ? 'Actualizar Vehículo' : 'Crear Vehículo'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VehicleForm;
