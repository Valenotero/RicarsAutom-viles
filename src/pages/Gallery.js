import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { motion } from 'framer-motion';
import { 
  Image, 
  Video, 
  Filter, 
  Download, 
  Share2, 
  Calendar,
  MapPin,
  User,
  Eye
} from 'lucide-react';
import { incrementGalleryView } from '../services/galleryViewsService';
import toast from 'react-hot-toast';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { id: 'todos', name: 'Todos', icon: '📷' },
    { id: 'eventos', name: 'Eventos', icon: '🎉' },
    { id: 'instalaciones', name: 'Instalaciones', icon: '🏢' },
    { id: 'equipo', name: 'Equipo', icon: '👥' },
    { id: 'vehiculos', name: 'Vehículos', icon: '🚗' },
    { id: 'promociones', name: 'Promociones', icon: '🎯' }
  ];

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Error al cargar la galería');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = selectedCategory === 'todos' 
    ? media 
    : media.filter(item => item.category === selectedCategory);

  const openModal = async (item) => {
    setSelectedMedia(item);
    setShowModal(true);
    
    // Incrementar contador de vistas
    try {
      const wasIncremented = await incrementGalleryView(item.id);
      if (wasIncremented) {
        // Actualizar el contador en el estado local
        setMedia(prevMedia => 
          prevMedia.map(media => 
            media.id === item.id 
              ? { ...media, views: (media.views || 0) + 1 }
              : media
          )
        );
      }
    } catch (error) {
      console.error('Error incrementando vista:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedia(null);
  };

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error al descargar');
    }
  };

  const shareMedia = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedMedia.title,
          text: selectedMedia.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Galería Multimedia
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Descubre nuestros eventos, instalaciones, equipo y momentos especiales
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay contenido disponible
            </h3>
            <p className="text-gray-500">
              {selectedCategory === 'todos' 
                ? 'La galería está vacía' 
                : `No hay contenido en la categoría "${categories.find(c => c.id === selectedCategory)?.name}"`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => openModal(item)}
              >
                <div className="relative aspect-square">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.type === 'video' ? (
                        <Video className="w-8 h-8 text-white" />
                      ) : (
                        <Image className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {categories.find(c => c.id === item.category)?.name}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{item.views || 0}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="relative">
              {/* Media Display */}
              <div className="aspect-video bg-black">
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => downloadMedia(selectedMedia.url, selectedMedia.title)}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={shareMedia}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={closeModal}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                >
                  <span className="text-gray-700 text-xl font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === selectedMedia.category)?.name}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(selectedMedia.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedMedia.title}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {selectedMedia.description}
              </p>

              {selectedMedia.location && (
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedMedia.location}</span>
                </div>
              )}

              {selectedMedia.author && (
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Por {selectedMedia.author}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
