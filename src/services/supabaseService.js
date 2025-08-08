// Servicio para interactuar con Supabase
import { supabase } from '../supabase/config';

// ==================== SERVICIO DE AUTENTICACIÓN ====================
export const authService = {
  // Registrar usuario
  async signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Iniciar sesión
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener sesión actual
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Obtener perfil de usuario - simplificado
  async getUserProfile(userId) {
    console.log('🔍 Buscando perfil para userId:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Error obteniendo perfil de DB:', error);
        
        // Fallback: obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email === 'oterov101@gmail.com') {
          console.log('🔑 Retornando perfil owner para oterov101@gmail.com');
          return {
            id: userId,
            email: 'oterov101@gmail.com',
            display_name: 'Administrador Principal',
            role: 'owner'
          };
        }
        
        // Para otros usuarios, retornar perfil básico
        return {
          id: userId,
          email: user?.email || 'usuario@example.com',
          display_name: user?.user_metadata?.display_name || 'Usuario',
          role: 'cliente'
        };
      }

      console.log('✅ Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.warn('⚠️ Error en getUserProfile, usando fallback:', error);
      
      // Fallback básico
      const { data: { user } } = await supabase.auth.getUser();
      return {
        id: userId,
        email: user?.email || 'usuario@example.com',
        display_name: user?.user_metadata?.display_name || 'Usuario',
        role: user?.email === 'oterov101@gmail.com' ? 'owner' : 'cliente'
      };
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Restablecer contraseña
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
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
      
      // Si hay error de permisos o conexión, lanzar el error
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.message?.includes('permission')) {
        console.log('🔒 Error de permisos RLS, necesario revisar configuración');
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