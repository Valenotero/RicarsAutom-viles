import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - Reemplaza con tus credenciales
const supabaseUrl = 'https://sdkrnuemobvxvifqecoz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3JudWVtb2J2eHZpZnFlY296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzQ0MDYsImV4cCI6MjA3MDE1MDQwNn0.YZTwo2XdFpfpqS2fVM9XOvR2Jq-kttOMW50oSPfCZ_8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test de conexión con timeout
export const testConnection = async () => {
  try {
    console.log('🧪 Probando conexión a Supabase...');
    console.log('🔗 URL:', supabaseUrl);
    console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Crear timeout de 10 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Test tardó más de 10 segundos')), 10000);
    });
    
    // Test simple con timeout
    const testPromise = supabase
      .from('vehicles')
      .select('count(*)')
      .limit(1);
    
    const { data, error } = await Promise.race([testPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Error en test de conexión:', error);
      return { success: false, error };
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    console.log('📊 Respuesta del test:', data);
    return { success: true, data };
  } catch (err) {
    console.error('💥 Error en test (timeout o conexión):', err);
    return { success: false, error: err };
  }
}

// Funciones helper para Storage
export const uploadVehicleImage = async (file, vehicleId, imageIndex) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${vehicleId}-${imageIndex}.${fileExt}`
  const filePath = `vehicles/${fileName}`

  const { data, error } = await supabase.storage
    .from('vehicle-images')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(filePath)

  return publicUrl
}

export const deleteVehicleImage = async (imagePath) => {
  const { error } = await supabase.storage
    .from('vehicle-images')
    .remove([imagePath])

  if (error) {
    throw error
  }
}

export default supabase
