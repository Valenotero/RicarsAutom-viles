import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Tag, 
  Eye, 
  Share2, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { incrementBlogView } from '../services/blogViewsService';
import toast from 'react-hot-toast';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { id: 'todos', name: 'Todos', icon: '📰' },
    { id: 'noticias', name: 'Noticias', icon: '📢' },
    { id: 'consejos', name: 'Consejos', icon: '💡' },
    { id: 'eventos', name: 'Eventos', icon: '🎉' },
    { id: 'tecnologia', name: 'Tecnología', icon: '🔧' },
    { id: 'promociones', name: 'Promociones', icon: '🎯' }
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Error al cargar el blog');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles
    .filter(article => 
      selectedCategory === 'todos' || article.category === selectedCategory
    )
    .filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openModal = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
    
    // Incrementar contador de vistas del artículo
    incrementArticleViews(article.id);
  };

  const incrementArticleViews = async (articleId) => {
    try {
      // Usar el nuevo sistema de vistas únicas
      const wasIncremented = await incrementBlogView(articleId);
      
      if (wasIncremented) {
        // Solo actualizar el estado si realmente se incrementó la vista
        setArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId 
              ? { ...article, views: (article.views || 0) + 1 }
              : article
          )
        );
        
        // Actualizar el artículo seleccionado
        setSelectedArticle(prev => 
          prev ? { ...prev, views: (prev.views || 0) + 1 } : prev
        );
      }
    } catch (error) {
      console.error('Error incrementando vistas del artículo:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedArticle.title,
          text: selectedArticle.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog Corporativo
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Noticias, consejos y novedades de Ricars Automóviles
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay artículos disponibles
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No se encontraron artículos para "${searchTerm}"`
                : selectedCategory === 'todos' 
                  ? 'El blog está vacío' 
                  : `No hay artículos en la categoría "${categories.find(c => c.id === selectedCategory)?.name}"`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => openModal(article)}
              >
                {/* Article Image */}
                {article.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {categories.find(c => c.id === article.category)?.name}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <User className="w-4 h-4" />
                      <span>{article.author || 'Ricars Automóviles'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views || 0}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Article Header */}
            {selectedArticle.image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              {/* Article Meta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {categories.find(c => c.id === selectedArticle.category)?.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(selectedArticle.created_at)}
                  </span>
                </div>
                <button
                  onClick={shareArticle}
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Article Title */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedArticle.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <User className="w-4 h-4" />
                <span>Por {selectedArticle.author || 'Ricars Automóviles'}</span>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>

              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">Etiquetas:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="p-6 pt-0">
              <button
                onClick={closeModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Blog;
