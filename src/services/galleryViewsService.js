import { supabase } from '../supabase/config';

// Generar ID único para visitantes no autenticados
const generateVisitorId = () => {
  let visitorId = localStorage.getItem('gallery_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gallery_visitor_id', visitorId);
  }
  return visitorId;
};

// Incrementar vista de un elemento de galería
export const incrementGalleryView = async (galleryId) => {
  try {
    const visitorId = generateVisitorId();
    
    const { data, error } = await supabase
      .rpc('increment_gallery_views', {
        gallery_uuid: galleryId,
        visitor_identifier: visitorId
      });

    if (error) {
      console.error('Error incrementando vista de galería:', error);
      return false;
    }

    return data; // Retorna true si se incrementó, false si ya existía
  } catch (error) {
    console.error('Error incrementando vista de galería:', error);
    return false;
  }
};

// Obtener estadísticas de vistas de galería
export const getGalleryViewsStats = async () => {
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
};

// Obtener elementos más vistos
export const getMostViewedGalleryItems = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .rpc('get_most_viewed_gallery_items', { limit_count: limit });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo elementos más vistos:', error);
    return [];
  }
};

// Verificar si un usuario ya vio un elemento específico
export const hasViewedGalleryItem = async (galleryId) => {
  try {
    const visitorId = generateVisitorId();
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('gallery_views')
      .select('id')
      .eq('gallery_id', galleryId);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('visitor_id', visitorId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error verificando vista de galería:', error);
    return false;
  }
};

// Obtener elementos de galería con contadores de vistas
export const getGalleryItemsWithViews = async () => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo elementos de galería:', error);
    return [];
  }
};
