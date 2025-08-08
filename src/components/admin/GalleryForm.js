import React, { useState } from 'react';
import { supabase } from '../../supabase/config';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image, 
  Video, 
  X, 
  Plus, 
  Trash2,
  MapPin,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'eventos',
    location: '',
    author: '',
    type: 'image'
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const categories = [
    { id: 'eventos', name: 'Eventos', icon: '🎉' },
    { id: 'instalaciones', name: 'Instalaciones', icon: '🏢' },
    { id: 'equipo', name: 'Equipo', icon: '👥' },
    { id: 'vehiculos', name: 'Vehículos', icon: '🚗' },
    { id: 'promociones', name: 'Promociones', icon: '🎯' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Crear previews
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const uploadFiles = async () => {
    if (!formData.title || files.length === 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
          .from('gallery-images')
          .upload(filePath, file);

        if (error) throw error;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Crear registros en la base de datos
      const mediaRecords = uploadedUrls.map((url, index) => ({
        title: formData.title + (files.length > 1 ? ` (${index + 1})` : ''),
        description: formData.description,
        url: url,
        category: formData.category,
        location: formData.location,
        author: formData.author,
        type: files[index].type.startsWith('video/') ? 'video' : 'image',
        created_at: new Date().toISOString()
      }));

      const { error: dbError } = await supabase
        .from('gallery')
        .insert(mediaRecords);

      if (dbError) throw dbError;

      toast.success('Archivos subidos exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Subir a Galería
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Título del contenido"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del contenido..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ubicación (opcional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Autor (opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivos (Fotos/Videos) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Haz clic para seleccionar archivos
                  </p>
                  <p className="text-sm text-gray-500">
                    Soporta imágenes (JPG, PNG, GIF) y videos (MP4, MOV)
                  </p>
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Vista previa ({files.length} archivos)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {files[index].type.startsWith('video/') ? (
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2">
                        {files[index].type.startsWith('video/') ? (
                          <Video className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-1" />
                        ) : (
                          <Image className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={uploadFiles}
                disabled={uploading || !formData.title || files.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir Archivos
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GalleryForm;
