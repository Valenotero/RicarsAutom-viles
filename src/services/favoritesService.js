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
    console.log('🔄 getFavorites: Iniciando consulta...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ getFavorites: No hay usuario autenticado');
      return [];
    }

    console.log('👤 getFavorites: Usuario encontrado:', user.id.substring(0, 8) + '...');

    // Consulta optimizada con solo campos esenciales
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        vehicles!inner (
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
          is_featured,
          is_promotion,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100); // Limitar para evitar consultas muy grandes

    if (error) {
      console.error('❌ getFavorites: Error en consulta:', error);
      throw error;
    }

    console.log('✅ getFavorites: Consulta exitosa, registros:', data?.length || 0);

    // Verificar que los vehículos existan (inner join garantiza esto, pero por seguridad)
    const validFavorites = data?.filter(item => item.vehicles) || [];
    
    const result = validFavorites.map(item => ({
      ...item.vehicles,
      favorite_id: item.id,
      favorited_at: item.created_at
    }));

    console.log('📊 getFavorites: Favoritos procesados:', result.length);
    return result;

  } catch (error) {
    console.error('❌ getFavorites: Error general:', error);
    throw error; // Re-lanzar el error para que sea manejado por el componente
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
      vehicleId: vehicleId?.substring(0, 8) + '...' 
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

// Función con verificación doble para evitar vistas duplicadas
export const addToRecentlyViewed = async (vehicleId) => {
  try {
    console.log('🔄 Registrando vista para vehículo:', vehicleId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('👤 No hay usuario autenticado, usando localStorage');
      // Para usuarios no autenticados, manejar en localStorage
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const viewedVehicles = JSON.parse(localStorage.getItem('viewedVehicles') || '[]');
      
      // Solo incrementar vista si no ha visto este vehículo antes
      if (!viewedVehicles.includes(vehicleId)) {
        viewedVehicles.push(vehicleId);
        localStorage.setItem('viewedVehicles', JSON.stringify(viewedVehicles));
        
        // Incrementar contador para usuarios anónimos usando RPC simple
        try {
          await supabase.rpc('increment_vehicle_views', { vehicle_uuid: vehicleId });
          console.log('📊 Vista anónima incrementada');
        } catch (error) {
          console.warn('⚠️ No se pudo incrementar vista anónima:', error);
        }
      }
      
      // Agregar a recientes independientemente
      const existingIndex = recentlyViewed.findIndex(v => v.id === vehicleId);
      
      if (existingIndex !== -1) {
        const [existing] = recentlyViewed.splice(existingIndex, 1);
        recentlyViewed.unshift(existing);
      } else {
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('id, brand, model, year, price, images, condition, type')
          .eq('id', vehicleId)
          .single();
        
        if (vehicleData) {
          recentlyViewed.unshift({
            ...vehicleData,
            viewed_at: new Date().toISOString()
          });
        }
      }
      
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed.slice(0, 10)));
      return { success: true };
    }

    console.log('👤 Usuario autenticado:', user.id.substring(0, 8) + '...');

    const now = new Date().toISOString();

    // Usar RPC que verifica automáticamente si incrementar o no
    try {
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('increment_vehicle_views_unique', { 
          vehicle_uuid: vehicleId,
          user_uuid: user.id
        });

      if (rpcError) {
        console.warn('⚠️ RPC no disponible, usando método manual:', rpcError);
        
        // Fallback: método manual
        return await addToRecentlyViewedManual(vehicleId, user.id, now);
      }

      console.log('📊 RPC Result:', rpcResult);

      if (rpcResult.incremented) {
        console.log('✅ Vista única incrementada! Nuevas vistas:', rpcResult.views);
      } else {
        console.log('👁️ Usuario ya había visto este vehículo. Vistas actuales:', rpcResult.views);
      }

      // Actualizar o crear registro en recently_viewed
      const { error: upsertError } = await supabase
        .from('recently_viewed')
        .upsert({
          user_id: user.id,
          vehicle_id: vehicleId,
          viewed_at: now
        }, {
          onConflict: 'user_id,vehicle_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        // Si upsert falla, usar método manual
        console.warn('⚠️ Upsert falló, usando método manual:', upsertError);
        await addToRecentlyViewedManual(vehicleId, user.id, now);
      }

    } catch (error) {
      console.warn('⚠️ Error con RPC, usando método manual:', error);
      return await addToRecentlyViewedManual(vehicleId, user.id, now);
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Error general:', error);
    return { success: false, error: error.message };
  }
};

// Método manual como fallback
const addToRecentlyViewedManual = async (vehicleId, userId, timestamp) => {
  try {
    // Verificar si existe
    const { data: existing, error: checkError } = await supabase
      .from('recently_viewed')
      .select('id')
      .eq('user_id', userId)
      .eq('vehicle_id', vehicleId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error verificando:', checkError);
    }

    if (existing) {
      // Solo actualizar timestamp
      await supabase
        .from('recently_viewed')
        .update({ viewed_at: timestamp })
        .eq('id', existing.id);
      
      console.log('📝 Timestamp actualizado (no incrementar)');
    } else {
      // Crear nuevo registro E incrementar vista
      const { error: insertError } = await supabase
        .from('recently_viewed')
        .insert({
          user_id: userId,
          vehicle_id: vehicleId,
          viewed_at: timestamp
        });

      if (!insertError || insertError.code === '23505') {
        // Solo incrementar si el insert fue exitoso o falló por duplicado
        if (!insertError) {
          try {
            await supabase.rpc('increment_vehicle_views', { vehicle_uuid: vehicleId });
            console.log('📊 Vista incrementada (método manual)');
          } catch (rpcError) {
            console.warn('⚠️ No se pudo incrementar vista:', rpcError);
          }
        } else {
          console.log('👁️ Registro duplicado detectado, no incrementar');
        }
      } else {
        throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error en método manual:', error);
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
        viewed_at,
        vehicles!inner (
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
          is_featured,
          is_promotion
        )
      `)
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(10); // Reducir límite para mejor performance

    if (error) throw error;

    return data?.map(item => ({
      ...item.vehicles,
      viewed_at: item.viewed_at
    })) || [];

  } catch (error) {
    console.error('Error obteniendo vistos recientemente:', error);
    return [];
  }
};

export const getFavoritesStats = async () => {
  try {
    // Simplificar la consulta usando count directo
    const { count: totalFavorites, error: favError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true });

    const { count: totalUsers, error: userError } = await supabase
      .from('favorites')
      .select('user_id', { count: 'exact', head: true });

    if (favError || userError) {
      throw favError || userError;
    }

    return { 
      total_favorites: totalFavorites || 0, 
      total_users_with_favorites: totalUsers || 0 
    };
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

// Función para obtener favoritos con paginación (para casos de muchos favoritos)
export const getFavoritesPaginated = async (page = 0, pageSize = 20) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], hasMore: false, total: 0 };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        vehicles!inner (
          id,
          brand,
          model,
          year,
          price,
          images,
          condition,
          is_featured,
          is_promotion
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const vehicles = data?.map(item => ({
      ...item.vehicles,
      favorite_id: item.id,
      favorited_at: item.created_at
    })) || [];

    return {
      data: vehicles,
      hasMore: (count || 0) > to + 1,
      total: count || 0,
      currentPage: page
    };

  } catch (error) {
    console.error('Error obteniendo favoritos paginados:', error);
    throw error;
  }
};

// Función optimizada para verificar múltiples favoritos de una vez
export const checkMultipleFavorites = async (vehicleIds) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !vehicleIds?.length) {
      return {};
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('vehicle_id')
      .eq('user_id', user.id)
      .in('vehicle_id', vehicleIds);

    if (error) throw error;

    // Crear objeto con vehicleId: boolean
    const favoritesMap = {};
    vehicleIds.forEach(id => favoritesMap[id] = false);
    data?.forEach(item => favoritesMap[item.vehicle_id] = true);

    return favoritesMap;

  } catch (error) {
    console.error('Error verificando múltiples favoritos:', error);
    return {};
  }
};

// Función para limpiar duplicados existentes en la base de datos
export const cleanDuplicateRecentlyViewed = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, message: 'No hay usuario autenticado' };
    }

    console.log('🧹 Iniciando limpieza de duplicados para usuario:', user.id.substring(0, 8) + '...');

    // Obtener todos los registros del usuario ordenados por fecha
    const { data: allViewed, error: fetchError } = await supabase
      .from('recently_viewed')
      .select('id, vehicle_id, viewed_at')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error obteniendo registros:', fetchError);
      throw fetchError;
    }

    if (!allViewed || allViewed.length === 0) {
      console.log('📝 No hay registros para limpiar');
      return { success: true, cleanedCount: 0, message: 'No hay registros para limpiar' };
    }

    // Encontrar duplicados (mantener solo el más reciente de cada vehicle_id)
    const seenVehicles = new Set();
    const duplicateIds = [];

    allViewed.forEach(record => {
      if (seenVehicles.has(record.vehicle_id)) {
        // Es un duplicado, marcarlo para eliminación
        duplicateIds.push(record.id);
      } else {
        // Primera vez que vemos este vehicle_id, mantenerlo
        seenVehicles.add(record.vehicle_id);
      }
    });

    console.log('🔍 Duplicados encontrados:', duplicateIds.length);

    if (duplicateIds.length === 0) {
      return { success: true, cleanedCount: 0, message: 'No se encontraron duplicados' };
    }

    // Eliminar duplicados en lotes para evitar timeouts
    const batchSize = 50;
    let cleanedCount = 0;

    for (let i = 0; i < duplicateIds.length; i += batchSize) {
      const batch = duplicateIds.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase
        .from('recently_viewed')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error('❌ Error eliminando lote:', deleteError);
        // Continuar con el siguiente lote en lugar de fallar completamente
      } else {
        cleanedCount += batch.length;
      }
    }

    console.log('✅ Limpieza completada. Registros eliminados:', cleanedCount);
    
    return { 
      success: true, 
      cleanedCount, 
      message: `Se eliminaron ${cleanedCount} registros duplicados` 
    };

  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
    return { 
      success: false, 
      error: error.message,
      cleanedCount: 0 
    };
  }
};