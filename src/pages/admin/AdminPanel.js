import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  TrendingUp, 
  Car, 
  Users,
  DollarSign,
  BarChart3,
  Image,
  FileText,
  Heart,
  MessageCircle
} from 'lucide-react';
import { getVehicles, getVehicleStats, deleteVehicle } from '../../services/vehicleService';
import { getFavoritesStats } from '../../services/favoritesService';
import { statisticsService } from '../../services/supabaseService';

import { supabase } from '../../supabase/config';
import VehicleForm from '../../components/admin/VehicleForm';
import GalleryForm from '../../components/admin/GalleryForm';
import BlogForm from '../../components/admin/BlogForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [blogArticles, setBlogArticles] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [blogLoading, setBlogLoading] = useState(false);
  const [favoritesStats, setFavoritesStats] = useState({ total_favorites: 0, total_users_with_favorites: 0 });
  const [conditionStats, setConditionStats] = useState({ new_vehicles: 0, used_vehicles: 0, total_vehicles: 0 });
  const [blogViewsStats, setBlogViewsStats] = useState({ total_views: 0, total_articles: 0, avg_views_per_article: 0 });
  const [galleryViewsStats, setGalleryViewsStats] = useState({ 
    total_views: 0, 
    total_items: 0, 
    avg_views_per_item: 0, 
    total_unique_visitors: 0 
  });
  const [enhancedStats, setEnhancedStats] = useState({ 
    total_vehicles: 0, 
    total_views: 0, 
    featured_vehicles: 0, 
    promotion_vehicles: 0,
    new_vehicles: 0,
    used_vehicles: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'gallery') {
      loadGalleryData();
    }
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === 'blog') {
      loadBlogData();
    }
  }, [selectedTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos del dashboard...');
      
      const [vehiclesData, statsData, favoritesStatsData, conditionStatsData, blogViewsStatsData, galleryViewsStatsData, enhancedStatsData] = await Promise.all([
        getVehicles(),
        getVehicleStats(),
        getFavoritesStats(),
        statisticsService.getVehicleConditionStats(),
        statisticsService.getBlogViewsStats(),
        statisticsService.getGalleryViewsStats(),
        statisticsService.getEnhancedVehicleStats()
      ]);
      
      console.log('📊 Datos cargados:', {
        vehicles: vehiclesData?.length || 0,
        stats: statsData,
        favorites: favoritesStatsData,
        condition: conditionStatsData,
        blogViews: blogViewsStatsData,
        galleryViews: galleryViewsStatsData,
        enhanced: enhancedStatsData
      });
      
      setVehicles(vehiclesData);
      setStats(statsData);
      setFavoritesStats(favoritesStatsData);
      setConditionStats(conditionStatsData);
      setBlogViewsStats(blogViewsStatsData);
      setGalleryViewsStats(galleryViewsStatsData);
      setEnhancedStats(enhancedStatsData);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      toast.error('Error al cargar los datos');
      
      // Establecer valores por defecto en caso de error
      setVehicles([]);
      setStats({ total: 0, totalViews: 0, featured: 0, promotion: 0 });
      setFavoritesStats({ total_favorites: 0, total_users_with_favorites: 0 });
      setConditionStats({ new_vehicles: 0, used_vehicles: 0, total_vehicles: 0 });
      setBlogViewsStats({ total_views: 0, total_articles: 0, avg_views_per_article: 0 });
      setEnhancedStats({ 
        total_vehicles: 0, 
        total_views: 0, 
        featured_vehicles: 0, 
        promotion_vehicles: 0,
        new_vehicles: 0,
        used_vehicles: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGalleryData = async () => {
    try {
      setGalleryLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error cargando galería:', error);
      toast.error('Error al cargar la galería');
    } finally {
      setGalleryLoading(false);
    }
  };

  const loadBlogData = async () => {
    try {
      setBlogLoading(true);
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBlogArticles(data || []);
    } catch (error) {
      console.error('Error cargando blog:', error);
      toast.error('Error al cargar el blog');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento de la galería?')) {
      try {
        const { error } = await supabase
          .from('gallery')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setGalleryItems(galleryItems.filter(item => item.id !== id));
        toast.success('Elemento eliminado de la galería');
      } catch (error) {
        console.error('Error eliminando elemento:', error);
        toast.error('Error al eliminar el elemento');
      }
    }
  };

  const handleDeleteBlogArticle = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        const { error } = await supabase
          .from('blog')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setBlogArticles(blogArticles.filter(article => article.id !== id));
        toast.success('Artículo eliminado');
      } catch (error) {
        console.error('Error eliminando artículo:', error);
        toast.error('Error al eliminar el artículo');
      }
    }
  };

  const handleEditBlogArticle = (article) => {
    setEditingArticle(article);
    setShowBlogForm(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        await deleteVehicle(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        toast.success('Vehículo eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando vehículo:', error);
        toast.error('Error al eliminar el vehículo');
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Gestiona tu concesionaria desde aquí</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'vehicles', label: 'Vehículos', icon: Car },
              { id: 'gallery', label: 'Galería', icon: Image },
              { id: 'blog', label: 'Blog', icon: FileText },
              { id: 'contact-messages', label: 'Mensajes', icon: MessageCircle },
              { id: 'stats', label: 'Estadísticas', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Vehículos</p>
                    <p className="text-2xl font-bold text-gray-900">{enhancedStats.total_vehicles || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visitas</p>
                    <p className="text-2xl font-bold text-gray-900">{enhancedStats.total_views || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Destacados</p>
                    <p className="text-2xl font-bold text-gray-900">{enhancedStats.featured_vehicles || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Promociones</p>
                    <p className="text-2xl font-bold text-gray-900">{enhancedStats.promotion_vehicles || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Autos Agregados a Favoritos</p>
                    <p className="text-2xl font-bold text-gray-900">{favoritesStats.total_favorites || 0}</p>
                    <p className="text-xs text-gray-500">{favoritesStats.total_users_with_favorites || 0} usuarios</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <Image className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Galería Multimedia</p>
                    <p className="text-2xl font-bold text-gray-900">{galleryViewsStats.total_items || 0}</p>
                    <p className="text-xs text-gray-500">{galleryViewsStats.total_views || 0} vistas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehículos recientes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Vehículos Recientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vistas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.slice(0, 5).map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={vehicle.images[0] || '/placeholder-car.jpg'}
                                alt={vehicle.brand}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.year} • {(vehicle.kilometers || 0).toLocaleString()} km
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(vehicle.price || vehicle.price_ars || 0).toLocaleString()} {vehicle.price ? 'USD' : 'ARS'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              vehicle.condition === 'new'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}
                            </span>
                            {vehicle.is_featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </span>
                            )}
                            {vehicle.is_promotion && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Oferta
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{vehicle.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'vehicles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Todos los Vehículos</h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Auto
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vistas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={vehicle.images[0] || '/placeholder-car.jpg'}
                                alt={vehicle.brand}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.year} • {(vehicle.kilometers || 0).toLocaleString()} km
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(vehicle.price || vehicle.price_ars || 0).toLocaleString()} {vehicle.price ? 'USD' : 'ARS'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              vehicle.condition === 'new' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}
                            </span>
                            {vehicle.is_featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </span>
                            )}
                            {vehicle.is_promotion && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Oferta
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{vehicle.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Galería Multimedia</h3>
                <button
                  onClick={() => setShowGalleryForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Contenido
                </button>
              </div>
              
              {galleryLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando galería...</p>
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Galería de Imágenes y Videos</p>
                  <p className="text-sm">Aquí podrás gestionar todo el contenido multimedia de tu sitio web.</p>
                  <button
                    onClick={() => setShowGalleryForm(true)}
                    className="mt-4 btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Subir Primer Contenido
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contenido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vistas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {galleryItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-12 w-12 flex-shrink-0">
                              {item.type === 'video' ? (
                                <video
                                  src={item.url}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  muted
                                />
                              ) : (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={item.url}
                                  alt={item.title}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'video' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.type === 'video' ? 'Video' : 'Imagen'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span>{item.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'blog' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Blog Corporativo</h3>
                <button
                  onClick={() => setShowBlogForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Artículo
                </button>
              </div>
              
              {blogLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando blog...</p>
                </div>
              ) : blogArticles.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Gestión de Artículos</p>
                  <p className="text-sm">Crea y gestiona artículos para mantener informados a tus clientes.</p>
                  <button
                    onClick={() => setShowBlogForm(true)}
                    className="mt-4 btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Escribir Primer Artículo
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Artículo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vistas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blogArticles.map((article) => (
                        <tr key={article.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-12 w-12 flex-shrink-0">
                              {article.image ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={article.image}
                                  alt={article.title}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {article.excerpt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {article.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              article.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {article.published ? 'Publicado' : 'Borrador'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(article.created_at).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span>{article.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditBlogArticle(article)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlogArticle(article.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'contact-messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mensajes de Contacto</h3>
              <p className="text-gray-500 mb-4">Gestiona las consultas de los clientes sobre los vehículos</p>
              <a
                href="/admin/contact-messages"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ver Mensajes
              </a>
            </div>
          </motion.div>
        )}

        {selectedTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Distribución por Condición */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Distribución por Condición
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nuevos</span>
                    <span className="text-sm font-medium text-green-600">{conditionStats.new_vehicles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usados</span>
                    <span className="text-sm font-medium text-blue-600">{conditionStats.used_vehicles || 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-sm font-bold text-gray-900">{conditionStats.total_vehicles || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas Generales */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Estadísticas Generales
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Vehículos</span>
                    <span className="text-sm font-medium text-gray-900">{enhancedStats.total_vehicles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Visitas</span>
                    <span className="text-sm font-medium text-gray-900">{enhancedStats.total_views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Destacados</span>
                    <span className="text-sm font-medium text-yellow-600">{enhancedStats.featured_vehicles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promociones</span>
                    <span className="text-sm font-medium text-red-600">{enhancedStats.promotion_vehicles || 0}</span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Blog */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Estadísticas de Blog
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Artículos</span>
                    <span className="text-sm font-medium text-gray-900">{blogViewsStats.total_articles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Vistas</span>
                    <span className="text-sm font-medium text-gray-900">{blogViewsStats.total_views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio por Artículo</span>
                    <span className="text-sm font-medium text-purple-600">{blogViewsStats.avg_views_per_article || 0}</span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Galería */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-purple-600" />
                  Estadísticas de Galería
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Elementos</span>
                    <span className="text-sm font-medium text-gray-900">{galleryViewsStats.total_items || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Vistas</span>
                    <span className="text-sm font-medium text-gray-900">{galleryViewsStats.total_views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio por Elemento</span>
                    <span className="text-sm font-medium text-purple-600">{galleryViewsStats.avg_views_per_item || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visitantes Únicos</span>
                    <span className="text-sm font-medium text-blue-600">{galleryViewsStats.total_unique_visitors || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de formulario de vehículos */}
      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de formulario de galería */}
      {showGalleryForm && (
        <GalleryForm
          onClose={() => setShowGalleryForm(false)}
          onSuccess={() => {
            setShowGalleryForm(false);
            loadGalleryData();
            toast.success('Contenido agregado a la galería');
          }}
        />
      )}

      {/* Modal de formulario de blog */}
      {showBlogForm && (
        <BlogForm
          editArticle={editingArticle}
          onClose={() => {
            setShowBlogForm(false);
            setEditingArticle(null);
          }}
          onSuccess={() => {
            setShowBlogForm(false);
            setEditingArticle(null);
            loadBlogData();
            toast.success(editingArticle ? 'Artículo actualizado' : 'Artículo creado');
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
