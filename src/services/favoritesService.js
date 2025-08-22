import { supabase } from '../supabase/config';

// Servicio para manejar favoritos y vehículos vistos recientemente

export const addToFavorites = async (vehicleId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        vehicle_id: vehicleId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Ya existe en favoritos
        return { success: true, message: 'Ya está en favoritos' };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error agregando a favoritos:', error);
    throw error;
  }
};

export const removeFromFavorites = async (vehicleId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removiendo de favoritos:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          price,
          price_ars,
          kilometers,
          images,
          condition,
          transmission,
          fuel_type,
          color,
          type,
          location,
          engine,
          power,
          features,
          is_featured,
          is_promotion
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item.vehicles,
      favorite_id: item.id,
      favorited_at: item.created_at
    }));
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return [];
  }
};

export const isFavorite = async (vehicleId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Protección: verificar que hay usuario válido
    if (!user || !user.id || typeof user.id !== 'string') {
      console.log('⚠️ isFavorite: No hay usuario válido, retornando false');
      return false;
    }

    console.log('🔍 Verificando favorito:', { 
      userId: user.id.substring(0, 8) + '...', 
      vehicleId: vehicleId.substring(0, 8) + '...' 
    });

    // Usar count en lugar de single para evitar errores
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('❌ Error verificando favorito:', error);
      return false;
    }

    const isFav = count > 0;
    console.log('✅ isFavorite resultado:', isFav);
    return isFav;

  } catch (error) {
    console.error('❌ Error en isFavorite:', error);
    return false;
  }
};

export const addToRecentlyViewed = async (vehicleId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Si no hay usuario autenticado, guardar en localStorage
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const vehicle = recentlyViewed.find(v => v.id === vehicleId);
      
      if (!vehicle) {
        // Necesitamos obtener los datos del vehículo
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();
        
        if (vehicleData) {
          const updatedRecentlyViewed = [
            vehicleData,
            ...recentlyViewed.filter(v => v.id !== vehicleId)
          ].slice(0, 10); // Mantener solo los últimos 10
          
          localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed));
        }
      }
      return { success: true };
    }

    // Intentar insertar directamente, ignorar errores de duplicados
    try {
      const { error } = await supabase
        .from('recently_viewed')
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          viewed_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') {
        console.error('Error insertando registro:', error);
      }
    } catch (insertError) {
      console.warn('Error al insertar registro (puede ser duplicado):', insertError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error agregando a vistos recientemente:', error);
    // No lanzar el error para evitar que rompa la aplicación
    return { success: false, error: error.message };
  }
};

export const getRecentlyViewed = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Si no hay usuario autenticado, obtener de localStorage
      return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    }

    const { data, error } = await supabase
      .from('recently_viewed')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          price,
          price_ars,
          kilometers,
          images,
          condition,
          transmission,
          fuel_type,
          color,
          type,
          location,
          engine,
          power,
          features,
          is_featured,
          is_promotion
        )
      `)
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(50); // Aumentar el límite para asegurar que obtenemos todos los registros

    if (error) throw error;

    // Eliminar duplicados basándose en vehicle_id, manteniendo el más reciente
    const uniqueVehicles = new Map();
    
    data.forEach(item => {
      const vehicleId = item.vehicle_id;
      if (!uniqueVehicles.has(vehicleId) || 
          new Date(item.viewed_at) > new Date(uniqueVehicles.get(vehicleId).viewed_at)) {
        uniqueVehicles.set(vehicleId, {
          ...item.vehicles,
          viewed_at: item.viewed_at
        });
      }
    });

    // Convertir el Map a array y limitar a 10 elementos
    return Array.from(uniqueVehicles.values()).slice(0, 10);
  } catch (error) {
    console.error('Error obteniendo vistos recientemente:', error);
    return [];
  }
};

export const getFavoritesStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorites_stats');

    if (error) throw error;

    return data[0] || { total_favorites: 0, total_users_with_favorites: 0 };
  } catch (error) {
    console.error('Error obteniendo estadísticas de favoritos:', error);
    return { total_favorites: 0, total_users_with_favorites: 0 };
  }
};

export const clearRecentlyViewed = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.removeItem('recentlyViewed');
      return { success: true };
    }

    const { error } = await supabase
      .from('recently_viewed')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error limpiando vistos recientemente:', error);
    throw error;
  }
};

// Función para limpiar duplicados existentes en la base de datos
export const cleanDuplicateRecentlyViewed = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true };
    }

    // Por ahora, simplemente retornar éxito sin hacer nada
    // La limpieza de duplicados se maneja en getRecentlyViewed
    return { success: true, cleanedCount: 0 };
  } catch (error) {
    console.error('Error limpiando duplicados:', error);
    // No lanzar el error, solo logearlo para evitar que rompa la aplicación
    return { success: false, error: error.message };
  }
};
