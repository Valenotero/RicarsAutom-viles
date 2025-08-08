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
  BarChart3
} from 'lucide-react';
import { getVehicles, getVehicleStats, deleteVehicle } from '../../services/vehicleService';
import VehicleForm from '../../components/admin/VehicleForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, statsData] = await Promise.all([
        getVehicles(),
        getVehicleStats()
      ]);
      setVehicles(vehiclesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona tu concesionaria desde aquí</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Vehículo
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Vehículos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.featured || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.promotion || 0}</p>
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
                        Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {vehicle.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </span>
                            )}
                            {vehicle.promotion && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Oferta
                              </span>
                            )}
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Todos los Vehículos</h3>
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
                        Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {vehicle.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </span>
                            )}
                            {vehicle.promotion && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Oferta
                              </span>
                            )}
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

        {selectedTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Condición</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nuevos</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.new || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usados</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.used || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas Generales</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Vehículos</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Visitas</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.totalViews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Destacados</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.featured || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promociones</span>
                    <span className="text-sm font-medium text-gray-900">{stats?.promotion || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default AdminPanel;
