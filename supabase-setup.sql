-- Crear tabla de perfiles de usuario con roles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de vehículos
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  kilometers INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_ars DECIMAL(15,2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'used')),
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric')),
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sedan', 'suv', 'pickup', 'hatchback', 'coupe', 'cabriolet', 'premium')),
  location TEXT NOT NULL,
  engine TEXT,
  power TEXT,
  features JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Crear bucket para imágenes de vehículos
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);

-- Configurar políticas RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Los admins pueden ver todos los perfiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para vehicles
CREATE POLICY "Todos pueden ver vehículos" ON public.vehicles
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden insertar vehículos" ON public.vehicles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar vehículos" ON public.vehicles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar vehículos" ON public.vehicles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para storage de imágenes
CREATE POLICY "Todos pueden ver imágenes" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Solo admins pueden subir imágenes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar imágenes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    'cliente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_vehicle_views(vehicle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE vehicles 
  SET views = views + 1 
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de ejemplo
INSERT INTO public.vehicles (
  brand, model, year, kilometers, price, price_ars, condition, transmission,
  fuel_type, color, type, location, engine, power, features, images,
  is_featured, is_promotion, views
) VALUES 
(
  'Toyota', 'Corolla', 2023, 15000, 25000.00, 25000000.00, 'new', 'automatic',
  'gasoline', 'Blanco', 'sedan', 'Buenos Aires', '2.0L', '150hp',
  '["Aire acondicionado", "Bluetooth", "Cámara de reversa"]',
  '["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"]',
  true, false, 45
),
(
  'Honda', 'Civic', 2022, 25000, 22000.00, 22000000.00, 'used', 'automatic',
  'gasoline', 'Negro', 'sedan', 'Buenos Aires', '1.8L', '140hp',
  '["Aire acondicionado", "Bluetooth", "ABS", "Airbag"]',
  '["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"]',
  false, true, 32
),
(
  'Ford', 'Ranger', 2023, 8000, 35000.00, 35000000.00, 'new', 'automatic',
  'diesel', 'Gris', 'pickup', 'Buenos Aires', '3.2L', '200hp',
  '["Aire acondicionado", "Bluetooth", "Tracción 4x4", "Cámara de reversa"]',
  '["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"]',
  true, false, 78
);
