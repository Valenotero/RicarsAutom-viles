import { vehicleService as supabaseVehicleService, statisticsService } from './supabaseService';
import { supabase } from '../supabase/config';

// Cache simple en memoria
let vehicleCache = null;
let cacheTime = null;
const CACHE_DURATION = 30000; // 30 segundos

// Función para limpiar cache
export const clearVehicleCache = () => {
  vehicleCache = null;
  cacheTime = null;
  console.log('🧹 Cache de vehículos limpiado');
};

// Obtener todos los vehículos
export const getVehicles = async (filters = {}) => {
  try {
    console.log('🌐 getVehicles: Iniciando consulta...');
    
    // Consulta directa simplificada
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
      // Si es error de tabla no existe, devolver array vacío
      if (error.message.includes('relation "vehicles" does not exist')) {
        console.log('📝 Tabla "vehicles" no existe, devolviendo array vacío');
        return [];
      }
      throw error;
    }
    
    console.log('✅ Datos obtenidos de Supabase:', data?.length || 0);
    console.log('📋 Datos:', data);
    
    return data || [];
  } catch (error) {
    console.error('❌ Error obteniendo vehículos:', error);
    // En lugar de lanzar error, devolver array vacío para que la app funcione
    return [];
  }
};

// Obtener un vehículo por ID
export const getVehicleById = async (id) => {
  try {
    return await supabaseVehicleService.getVehicleById(id);
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    throw error;
  }
};

// Crear nuevo vehículo
export const createVehicle = async (vehicleData) => {
  try {
    return await supabaseVehicleService.createVehicle(vehicleData);
  } catch (error) {
    console.error('Error creando vehículo:', error);
    throw error;
  }
};

// Actualizar vehículo
export const updateVehicle = async (id, vehicleData) => {
  try {
    return await supabaseVehicleService.updateVehicle(id, vehicleData);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    throw error;
  }
};

// Eliminar vehículo
export const deleteVehicle = async (id) => {
  try {
    return await supabaseVehicleService.deleteVehicle(id);
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    throw error;
  }
};

// Obtener vehículos destacados
export const getFeaturedVehicles = async (limit = 6) => {
  try {
    return await supabaseVehicleService.getFeaturedVehicles(limit);
  } catch (error) {
    console.error('Error obteniendo vehículos destacados:', error);
    throw error;
  }
};

// Obtener vehículos en promoción
export const getPromotionVehicles = async (limit = 6) => {
  try {
    return await supabaseVehicleService.getPromotionVehicles(limit);
  } catch (error) {
    console.error('Error obteniendo vehículos en promoción:', error);
    throw error;
  }
};

// Obtener vehículos similares
export const getSimilarVehicles = async (currentVehicle, limit = 4) => {
  try {
    return await supabaseVehicleService.getSimilarVehicles(currentVehicle, limit);
  } catch (error) {
    console.error('Error obteniendo vehículos similares:', error);
    throw error;
  }
};

// Obtener estadísticas de vehículos
export const getVehicleStats = async () => {
  try {
    return await statisticsService.getStatistics();
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// Función helper para subir imágenes a Supabase
export const uploadImage = async (file, vehicleId, imageIndex) => {
  try {
    return await supabaseVehicleService.uploadVehicleImage(file, vehicleId, imageIndex);
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

// Función helper para eliminar imágenes
export const deleteImage = async (imageUrl) => {
  // Extraer path de la URL de Supabase
  const path = imageUrl.split('/storage/v1/object/public/vehicle-images/')[1];
  if (path) {
    const { deleteVehicleImage } = await import('../supabase/config');
    return await deleteVehicleImage(path);
  }
};
