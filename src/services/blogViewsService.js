import { supabase } from '../supabase/config';

// Función para generar un ID único de visitante
const generateVisitorId = () => {
  // Intentar obtener un ID existente del localStorage
  let visitorId = localStorage.getItem('blog_visitor_id');
  
  // Si no existe, crear uno nuevo
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('blog_visitor_id', visitorId);
  }
  
  return visitorId;
};

// Incrementar vista de un artículo de blog
export const incrementBlogView = async (blogId) => {
  try {
    const visitorId = generateVisitorId();
    
    const { data, error } = await supabase
      .rpc('increment_blog_views', {
        blog_uuid: blogId,
        visitor_identifier: visitorId
      });

    if (error) throw error;
    
    return data; // Retorna true si se incrementó, false si ya existía
  } catch (error) {
    console.error('Error incrementando vista de blog:', error);
    return false;
  }
};

// Obtener estadísticas de vistas de blog
export const getBlogViewsStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_blog_views_stats');

    if (error) throw error;
    return data[0] || { 
      total_views: 0, 
      total_articles: 0, 
      avg_views_per_article: 0, 
      total_unique_visitors: 0 
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de blog:', error);
    return { 
      total_views: 0, 
      total_articles: 0, 
      avg_views_per_article: 0, 
      total_unique_visitors: 0 
    };
  }
};

// Obtener artículos de blog más vistos
export const getMostViewedBlogArticles = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .rpc('get_most_viewed_blog_articles', {
        limit_count: limit
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo artículos más vistos:', error);
    return [];
  }
};
