// Servicio para interactuar con Supabase
import { supabase } from '../supabase/config';

// ==================== SERVICIO DE AUTENTICACIÓN ====================
export const authService = {
  // Registrar usuario
  async signUp(email, password, displayName) {
    try {
      console.log('🔐 Registrando usuario:', { email, displayName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: 'cliente' // Asignar rol por defecto
          }
        }
      });

      if (error) throw error;

      // Si el registro fue exitoso, crear perfil en la base de datos
      if (data.user) {
        try {
          console.log('✅ Usuario registrado, creando perfil en DB...');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                display_name: displayName,
                role: 'cliente',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.warn('⚠️ Error creando perfil en DB:', profileError);
            // No lanzar error aquí, el usuario ya se registró
          } else {
            console.log('✅ Perfil creado exitosamente en DB');
          }
        } catch (profileError) {
          console.warn('⚠️ Error en creación de perfil:', profileError);
          // No lanzar error aquí, el usuario ya se registró
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  },

  // Iniciar sesión
  async signIn(email, password) {
    try {
      console.log('🔐 Iniciando sesión:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      console.log('✅ Login exitoso:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      console.log('🚪 Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('❌ Error obteniendo sesión:', error);
      throw error;
    }
  },

  // 🔧 MÉTODO CORREGIDO: Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      console.log('🔍 [authService] Obteniendo perfil para userId:', userId);
      
      if (!userId) {
        console.error('❌ [authService] No userId provided');
        return null;
      }

      // Consulta directa y simple
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [authService] Error obteniendo perfil:', error);
        
        // Si el error es porque no existe el perfil, retornar null
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          console.warn('⚠️ [authService] Perfil no encontrado para userId:', userId);
          return null;
        }
        
        throw error;
      }

      if (!profile) {
        console.warn('⚠️ [authService] No se encontró perfil para userId:', userId);
        return null;
      }

      // Validar que el perfil tenga un rol válido
      if (!profile.role || !['cliente', 'admin', 'owner'].includes(profile.role)) {
        console.warn('⚠️ [authService] Perfil con rol inválido, estableciendo como cliente');
        profile.role = 'cliente';
        
        // Opcional: actualizar en la BD
        try {
          await supabase
            .from('profiles')
            .update({ role: 'cliente' })
            .eq('id', userId);
        } catch (updateError) {
          console.warn('⚠️ [authService] No se pudo actualizar rol:', updateError);
        }
      }

      console.log('✅ [authService] Perfil obtenido exitosamente:', {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        display_name: profile.display_name
      });

      return profile;

    } catch (error) {
      console.error('❌ [authService] Error en getUserProfile:', error);
      throw error;
    }
  },

  // 🗑️ NUEVO: Eliminar cuenta de usuario completamente
  async deleteUserAccount() {
    try {
      console.log('🗑️ Eliminando cuenta de usuario...');
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay usuario logueado');
      }
      
      console.log('🔍 Usuario a eliminar:', user.email);
      
      // Llamar a la función de Supabase para eliminar completamente
      const { data, error } = await supabase.rpc('delete_user_account', {
        user_uuid: user.id
      });
      
      if (error) {
        console.error('❌ Error eliminando cuenta:', error);
        throw error;
      }
      
      console.log('✅ Cuenta eliminada exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error en deleteUserAccount:', error);
      throw error;
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Restablecer contraseña
  async resetPassword(email) {
    try {
      console.log('📧 Enviando reset password para:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      console.log('✅ Email de reset enviado');
    } catch (error) {
      console.error('❌ Error en reset password:', error);
      throw error;
    }
  }
};

// ==================== SERVICIO DE VEHÍCULOS ====================
export const vehicleService = {
  // Obtener todos los vehículos con filtros
  async getVehicles(filters = {}) {
    
    let query = supabase.from('vehicles').select('*');

    // Aplicar filtros
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }
    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    if (filters.fuelType) {
      query = query.eq('fuel_type', filters.fuelType);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minYear) {
      query = query.gte('year', filters.minYear);
    }
    if (filters.maxYear) {
      query = query.lte('year', filters.maxYear);
    }

    // Ordenamiento
    if (filters.sortBy) {
      const direction = filters.sortOrder === 'desc' ? false : true;
      query = query.order(filters.sortBy, { ascending: direction });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Límite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error en query Supabase:', error);
      console.error('❌ Detalles del error:', error);
      
      // Si hay error de permisos o conexión, intentar con fallback
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.message?.includes('permission') || error.message?.includes('406')) {
        console.log('🔒 Error de permisos RLS, intentando fallback...');
        
        // Fallback: intentar obtener solo vehículos básicos sin filtros complejos
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(filters.limit || 50);
          
          if (fallbackError) {
            console.error('❌ Fallback también falló:', fallbackError);
            throw error; // Lanzar el error original
          }
          
          console.log('✅ Fallback exitoso, datos recibidos:', fallbackData?.length || 0);
          return fallbackData || [];
        } catch (fallbackError) {
          console.error('❌ Error en fallback:', fallbackError);
          throw error; // Lanzar el error original
        }
      }
      
      throw error;
    }
    
    console.log('✅ Query exitosa, datos recibidos:', data?.length || 0);
    return data || [];
  },

  // Obtener vehículo por ID
  async getVehicleById(id) {
    // TODO: Implementar incremento de vistas cuando se cree la función en Supabase
    // await supabase.rpc('increment_vehicle_views', { vehicle_id: id });

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo vehículo
  async createVehicle(vehicleData) {
    console.log('🔍 Datos recibidos en createVehicle:', vehicleData);
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        kilometers: vehicleData.kilometers,
        price: vehicleData.price,
        price_ars: vehicleData.price_ars, // Corregido
        condition: vehicleData.condition,
        transmission: vehicleData.transmission,
        fuel_type: vehicleData.fuel_type, // Corregido
        color: vehicleData.color,
        type: vehicleData.type,
        location: vehicleData.location,
        engine: vehicleData.engine,
        power: vehicleData.power,
        features: vehicleData.features || [],
        images: vehicleData.images || [],
        is_featured: vehicleData.is_featured || false, // Corregido
        is_promotion: vehicleData.is_promotion || false // Corregido
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error en createVehicle:', error);
      throw error;
    }
    console.log('✅ Vehículo creado exitosamente:', data);
    return data;
  },

  // Actualizar vehículo
  async updateVehicle(id, vehicleData) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        kilometers: vehicleData.kilometers,
        price: vehicleData.price,
        price_ars: vehicleData.priceARS,
        condition: vehicleData.condition,
        transmission: vehicleData.transmission,
        fuel_type: vehicleData.fuelType,
        color: vehicleData.color,
        type: vehicleData.type,
        location: vehicleData.location,
        engine: vehicleData.engine,
        power: vehicleData.power,
        features: vehicleData.features,
        images: vehicleData.images,
        is_featured: vehicleData.isFeatured,
        is_promotion: vehicleData.isPromotion
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar vehículo
  async deleteVehicle(id) {
    // Primero obtener el vehículo para ver sus imágenes
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error obteniendo vehículo:', fetchError);
    }

    // Eliminar el vehículo de la base de datos
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Eliminar las imágenes del storage si existen
    if (vehicle && vehicle.images && vehicle.images.length > 0) {
      console.log('🗑️ Eliminando imágenes del vehículo:', vehicle.images.length);
      
      for (const imageUrl of vehicle.images) {
        try {
          // Extraer el path de la imagen de la URL
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `vehicles/${fileName}`;
          
          console.log('🗑️ Eliminando imagen:', filePath);
          
          const { error: storageError } = await supabase.storage
            .from('vehicle-images')
            .remove([filePath]);
          
          if (storageError) {
            console.error('❌ Error eliminando imagen:', storageError);
          } else {
            console.log('✅ Imagen eliminada exitosamente:', filePath);
          }
        } catch (imageError) {
          console.error('❌ Error procesando imagen:', imageError);
        }
      }
    }

    console.log('✅ Vehículo e imágenes eliminados exitosamente');
  },

  // Obtener vehículos destacados
  async getFeaturedVehicles(limit = 6) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Obtener vehículos en promoción
  async getPromotionVehicles(limit = 6) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_promotion', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Obtener vehículos similares
  async getSimilarVehicles(currentVehicle, limit = 4) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .neq('id', currentVehicle.id)
      .or(`brand.eq.${currentVehicle.brand},type.eq.${currentVehicle.type}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Subir imagen de vehículo
  async uploadVehicleImage(file, vehicleId, imageIndex) {
    console.log('📤 Iniciando subida de imagen:', {
      fileName: file.name,
      fileSize: file.size,
      vehicleId,
      imageIndex
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}-${imageIndex}.${fileExt}`;
    const filePath = `vehicles/${fileName}`;

    console.log('📁 Ruta de archivo:', filePath);

    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file);

    if (error) {
      console.error('❌ Error subiendo imagen:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      throw error;
    }

    console.log('✅ Imagen subida exitosamente:', data);

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filePath);

    console.log('🔗 URL pública generada:', publicUrl);
    return publicUrl;
  }
};

// ==================== SERVICIO DE ESTADÍSTICAS ====================
export const statisticsService = {
  async getStatistics() {
    // Obtener total de vehículos
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    // Obtener vehículos destacados
    const { count: featuredVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true);

    // Obtener vehículos en promoción
    const { count: promotionVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('is_promotion', true);

    // Obtener total de vistas
    const { data: viewsData } = await supabase
      .from('vehicles')
      .select('views');

    const totalViews = viewsData?.reduce((sum, vehicle) => sum + (vehicle.views || 0), 0) || 0;

    return {
      totalVehicles: totalVehicles || 0,
      totalViews,
      featuredVehicles: featuredVehicles || 0,
      promotionVehicles: promotionVehicles || 0
    };
  },

  // Obtener estadísticas de distribución por condición
  async getVehicleConditionStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_vehicle_condition_stats');

      if (error) throw error;
      return data[0] || { new_vehicles: 0, used_vehicles: 0, total_vehicles: 0 };
    } catch (error) {
      console.error('Error obteniendo estadísticas de condición:', error);
      return { new_vehicles: 0, used_vehicles: 0, total_vehicles: 0 };
    }
  },

  // Obtener estadísticas de vistas de blog
  async getBlogViewsStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_blog_views_stats');

      if (error) throw error;
      return data[0] || { total_views: 0, total_articles: 0, avg_views_per_article: 0 };
    } catch (error) {
      console.error('Error obteniendo estadísticas de blog:', error);
      return { total_views: 0, total_articles: 0, avg_views_per_article: 0 };
    }
  },

  // Obtener estadísticas generales mejoradas
  async getEnhancedVehicleStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_enhanced_vehicle_stats');

      if (error) throw error;
      return data[0] || { 
        total_vehicles: 0, 
        total_views: 0, 
        featured_vehicles: 0, 
        promotion_vehicles: 0,
        new_vehicles: 0,
        used_vehicles: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas mejoradas:', error);
      return { 
        total_vehicles: 0, 
        total_views: 0, 
        featured_vehicles: 0, 
        promotion_vehicles: 0,
        new_vehicles: 0,
        used_vehicles: 0
      };
    }
  },

  // Obtener estadísticas de vistas de galería
  async getGalleryViewsStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_gallery_views_stats');

      if (error) throw error;
      return data[0] || { 
        total_views: 0, 
        total_items: 0, 
        avg_views_per_item: 0, 
        total_unique_visitors: 0 
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de galería:', error);
      return { 
        total_views: 0, 
        total_items: 0, 
        avg_views_per_item: 0, 
        total_unique_visitors: 0 
      };
    }
  }
};

// ==================== SERVICIO DE FAVORITOS ====================
export const favoritesService = {
  // Verificar si un vehículo está en favoritos
  // Verificar si un vehículo está en favoritos
async isFavorite(userId, vehicleId) {
  try {
    console.log('🔍 Verificando favorito:', { userId, vehicleId });
    
    // Versión simplificada para testing
    const { data, error, count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('❌ Error verificando favorito:', error);
      
      // Fallback: asumir que no es favorito si hay error
      console.log('⚠️ Asumiendo que no es favorito debido a error');
      return false;
    }

    console.log('✅ Resultado isFavorite:', { count, esFavorito: count > 0 });
    return count > 0;
  } catch (error) {
    console.error('❌ Error en isFavorite:', error);
    return false;
  }
},

  // Alternar favorito (agregar/quitar)
  async toggleFavorite(userId, vehicleId) {
    try {
      console.log('🔄 Alternando favorito:', { userId, vehicleId });
      
      const isFav = await this.isFavorite(userId, vehicleId);
      
      if (isFav) {
        // Quitar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('vehicle_id', vehicleId);
        
        if (error) throw error;
        console.log('✅ Favorito eliminado');
        return { action: 'removed', isFavorite: false };
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            user_id: userId, 
            vehicle_id: vehicleId 
          }]);
        
        if (error) throw error;
        console.log('✅ Favorito agregado');
        return { action: 'added', isFavorite: true };
      }
    } catch (error) {
      console.error('❌ Error en toggleFavorite:', error);
      throw error;
    }
  },

  // Obtener favoritos del usuario
  async getUserFavorites(userId) {
    try {
      console.log('📋 Obteniendo favoritos del usuario:', userId);
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          vehicle_id,
          created_at,
          vehicles (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo favoritos:', error);
        return [];
      }
      
      console.log('✅ Favoritos obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getUserFavorites:', error);
      return [];
    }
  },

  // Agregar a favoritos
  async addFavorite(userId, vehicleId) {
    try {
      console.log('➕ Agregando favorito:', { userId, vehicleId });
      
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: userId,
          vehicle_id: vehicleId
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error agregando favorito:', error);
        throw error;
      }
      
      console.log('✅ Favorito agregado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en addFavorite:', error);
      throw error;
    }
  },

  // Quitar de favoritos
  async removeFavorite(userId, vehicleId) {
    try {
      console.log('➖ Quitando favorito:', { userId, vehicleId });
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('vehicle_id', vehicleId);

      if (error) {
        console.error('❌ Error quitando favorito:', error);
        throw error;
      }
      
      console.log('✅ Favorito quitado exitosamente');
    } catch (error) {
      console.error('❌ Error en removeFavorite:', error);
      throw error;
    }
  }
};

// ==================== SERVICIO DE VISTOS RECIENTEMENTE ====================
export const recentlyViewedService = {
  // Agregar vehículo a vistos recientemente
  async addToRecentlyViewed(userId, vehicleId) {
    try {
      console.log('👁️ Agregando a vistos recientemente:', { userId, vehicleId });
      
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('recently_viewed')
        .select('id')
        .eq('user_id', userId)
        .eq('vehicle_id', vehicleId)
        .single();

      if (existing) {
        // Si ya existe, actualizar la fecha
        const { error: updateError } = await supabase
          .from('recently_viewed')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Si no existe, crear nuevo registro
        const { error: insertError } = await supabase
          .from('recently_viewed')
          .insert([{
            user_id: userId,
            vehicle_id: vehicleId
          }]);

        if (insertError) throw insertError;
      }
      
      console.log('✅ Agregado a vistos recientemente');
    } catch (error) {
      console.error('❌ Error en addToRecentlyViewed:', error);
      // No lanzar error aquí, es una funcionalidad secundaria
    }
  },

  // Obtener vehículos vistos recientemente
  async getRecentlyViewed(userId, limit = 10) {
    try {
      console.log('📋 Obteniendo vistos recientemente:', { userId, limit });
      
      const { data, error } = await supabase
        .from('recently_viewed')
        .select(`
          id,
          vehicle_id,
          viewed_at,
          vehicles (*)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo vistos recientemente:', error);
        return [];
      }
      
      console.log('✅ Vistos recientemente obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getRecentlyViewed:', error);
      return [];
    }
  }
};