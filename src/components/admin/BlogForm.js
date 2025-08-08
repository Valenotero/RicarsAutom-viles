import React, { useState } from 'react';
import { supabase } from '../../supabase/config';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image, 
  X, 
  Save,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogForm = ({ onClose, onSuccess, editArticle = null }) => {
  const [formData, setFormData] = useState({
    title: editArticle?.title || '',
    excerpt: editArticle?.excerpt || '',
    content: editArticle?.content || '',
    category: editArticle?.category || 'noticias',
    author: editArticle?.author || '',
    tags: editArticle?.tags?.join(', ') || '',
    image: editArticle?.image || '',
    published: editArticle?.published !== false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editArticle?.image || '');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: 'noticias', name: 'Noticias', icon: '📢' },
    { id: 'consejos', name: 'Consejos', icon: '💡' },
    { id: 'eventos', name: 'Eventos', icon: '🎉' },
    { id: 'tecnologia', name: 'Tecnología', icon: '🔧' },
    { id: 'promociones', name: 'Promociones', icon: '🎯' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const saveArticle = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Por favor completa el título y contenido');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image;

      // Subir imagen si se seleccionó una nueva
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        const { data, error } = await supabase.storage
          .from('gallery-images')
          .upload(filePath, imageFile);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Preparar datos del artículo
      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        author: formData.author,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        image: imageUrl,
        published: formData.published,
        updated_at: new Date().toISOString()
      };

      if (editArticle) {
        // Actualizar artículo existente
        const { error } = await supabase
          .from('blog')
          .update(articleData)
          .eq('id', editArticle.id);

        if (error) throw error;
        toast.success('Artículo actualizado exitosamente');
      } else {
        // Crear nuevo artículo
        articleData.created_at = new Date().toISOString();
        articleData.views = 0;

        const { error } = await supabase
          .from('blog')
          .insert([articleData]);

        if (error) throw error;
        toast.success('Artículo creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editArticle ? 'Editar Artículo' : 'Crear Artículo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario */}
            <div className="lg:col-span-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Título del artículo"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    Extracto
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Breve descripción del artículo..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Autor
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Autor del artículo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="etiqueta1, etiqueta2, etiqueta3"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    placeholder="Escribe el contenido del artículo aquí..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes usar HTML básico para formatear el texto
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Publicar inmediatamente</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Imagen */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de portada
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Seleccionar imagen
                        </p>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
                </button>
              </div>

              {/* Vista previa */}
              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Vista previa
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Título:</strong> {formData.title || 'Sin título'}</p>
                    <p><strong>Categoría:</strong> {categories.find(c => c.id === formData.category)?.name}</p>
                    <p><strong>Autor:</strong> {formData.author || 'Sin autor'}</p>
                    <p><strong>Estado:</strong> {formData.published ? 'Publicado' : 'Borrador'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={saveArticle}
                  disabled={saving || !formData.title || !formData.content}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editArticle ? 'Actualizar' : 'Crear'} Artículo
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogForm;
