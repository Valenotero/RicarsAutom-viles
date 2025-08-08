# Ricars Automóviles - Plataforma Web

## 📋 Descripción

Ricars Automóviles es una plataforma web completa y moderna para concesionarias de vehículos desarrollada con React y Supabase. La aplicación ofrece un sistema integral de gestión de inventario, catálogo interactivo, galería multimedia, blog corporativo y panel de administración avanzado.

## 🚀 Características Principales

### 🏠 Página de Inicio
- **Hero Section**: Búsqueda rápida con filtros avanzados
- **Categorías de Vehículos**: Navegación por tipo (Sedán, SUV, Pick-Up, etc.)
- **Vehículos Destacados**: Sección de recomendados con estadísticas
- **Vehículos Recientes**: Últimos vehículos agregados al inventario
- **Estadísticas en Tiempo Real**: Contadores de vehículos y visitas

### 🚗 Catálogo Avanzado
- **Filtros Dinámicos**: Por marca, modelo, precio, año, tipo, combustible
- **Búsqueda Inteligente**: Filtrado en tiempo real
- **Ordenamiento**: Por precio, fecha, kilometraje, popularidad
- **Vista de Tarjetas**: Diseño responsive con información completa
- **Paginación**: Navegación eficiente por grandes inventarios

### 📱 Detalle de Vehículo
- **Galería de Imágenes**: React Image Gallery con navegación táctil
- **Ficha Técnica Completa**: Especificaciones detalladas
- **Conversión de Precios**: USD y ARS con actualización automática
- **Características Dinámicas**: Lista personalizable de features
- **Vehículos Similares**: Recomendaciones automáticas
- **Contador de Visitas**: Tracking de popularidad
- **Botones de Contacto**: WhatsApp, Facebook, MercadoLibre integrados

### 🔐 Sistema de Autenticación
- **Registro de Usuarios**: Formulario completo con validaciones
- **Inicio de Sesión**: Autenticación segura con Supabase
- **Recuperación de Contraseña**: Flujo completo de reset
- **Perfil de Usuario**: Gestión de datos personales
- **Sistema de Roles**: Admin, Cliente, Owner con permisos específicos

### 🎨 Galería Multimedia
- **Categorías**: Eventos, Instalaciones, Equipo, Vehículos, Promociones
- **Filtros Dinámicos**: Navegación por categoría
- **Modal de Visualización**: Vista ampliada con controles
- **Contador de Visitas**: Tracking de popularidad por item
- **Responsive Design**: Optimizado para móviles y tablets

### 📝 Blog Corporativo
- **Artículos Informativos**: Gestión completa de contenido
- **Editor Rich Text**: Formato avanzado para contenido
- **Categorización**: Organización por temas
- **Contador de Visitas**: Métricas de engagement
- **SEO Optimizado**: Meta tags y estructura semántica

### ⚙️ Panel de Administración
- **Dashboard Completo**: Estadísticas en tiempo real
- **Gestión de Vehículos**: CRUD completo con validaciones
- **Carga de Imágenes**: Subida múltiple con optimización
- **Gestión de Galería**: Subir y organizar contenido multimedia
- **Gestión de Blog**: Crear y editar artículos
- **Estadísticas Avanzadas**: Métricas detalladas de rendimiento
- **Gestión de Usuarios**: Control de roles y permisos

### 💾 Sistema de Favoritos
- **Guardado de Vehículos**: Lista personal de favoritos
- **Sincronización**: Datos persistentes en Supabase
- **Interfaz Intuitiva**: Botones de favorito en tarjetas
- **Gestión de Lista**: Ver y eliminar favoritos

## 🛠 Tecnologías y Dependencias

### Frontend
- **React 18.2.0**: Framework principal
- **React Router DOM 6.3.0**: Navegación SPA
- **React Hook Form 7.43.9**: Gestión de formularios
- **React Hot Toast 2.4.1**: Notificaciones
- **React Image Gallery 1.2.11**: Galería de imágenes
- **React Intersection Observer 9.4.3**: Lazy loading

### Estilos y Animaciones
- **Tailwind CSS 3.3.2**: Framework de estilos
- **Framer Motion 10.12.16**: Animaciones fluidas
- **Lucide React 0.263.1**: Iconografía moderna

### Backend y Base de Datos
- **Supabase 2.54.0**: Backend as a Service
  - Autenticación y autorización
  - Base de datos PostgreSQL
  - Storage para imágenes
  - Real-time subscriptions

### Herramientas de Desarrollo
- **PostCSS 8.4.24**: Procesamiento de CSS
- **Autoprefixer 10.4.14**: Compatibilidad de navegadores

## 🏗️ Arquitectura del Proyecto

### Estructura de Componentes
```
src/
├── components/
│   ├── admin/          # Componentes del panel administrativo
│   ├── auth/           # Componentes de autenticación
│   ├── catalog/        # Componentes del catálogo
│   ├── home/           # Componentes de la página principal
│   ├── layout/         # Componentes de estructura
│   ├── ui/             # Componentes reutilizables
│   └── vehicles/       # Componentes de vehículos
├── contexts/           # Contextos de React
├── pages/              # Páginas principales
├── services/           # Servicios de API
└── supabase/           # Configuración de Supabase
```

### Servicios Principales
- **vehicleService.js**: Gestión de vehículos
- **favoritesService.js**: Sistema de favoritos
- **blogViewsService.js**: Tracking de visitas al blog
- **galleryViewsService.js**: Tracking de visitas a la galería
- **supabaseService.js**: Operaciones de base de datos
- **localApiService.js**: Servicios locales y utilidades

## 🔐 Sistema de Roles y Permisos

### Usuario (No logueado)
- Navegar por el catálogo
- Ver información básica de vehículos
- Acceder a páginas públicas

### Cliente (Logueado)
- Todas las funcionalidades de usuario
- Ver detalles completos de vehículos
- Contactar por WhatsApp/Facebook
- Guardar y gestionar favoritos
- Acceso completo a Galería y Blog

### Administrador
- Todas las funcionalidades de cliente
- Acceso al panel de administración
- Gestionar vehículos (crear, editar, eliminar)
- Ver estadísticas y métricas
- Subir imágenes y contenido multimedia
- Gestionar Galería y Blog

### Owner
- Acceso completo al sistema
- Gestión de usuarios y roles
- Configuración del sistema
- Control total de todas las funcionalidades

## 📱 Características Responsive

### Breakpoints Optimizados
- **Desktop**: 1024px y superior
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

### Adaptaciones Específicas
- **Navegación**: Menú hamburguesa en móviles
- **Formularios**: Campos apilados en pantallas pequeñas
- **Galerías**: Touch gestures optimizados
- **Botones**: Tamaños adaptados para uso táctil

## 🎨 Personalización y Branding

### Configuración de Colores
```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Elementos Personalizables
- **Logo**: Componente Navbar
- **Información de Contacto**: Footer
- **Datos de Empresa**: Página About
- **Colores Corporativos**: Variables CSS
- **Contenido**: Textos y descripciones

## 🔒 Seguridad y Validación

### Autenticación
- **Supabase Auth**: Sistema robusto de autenticación
- **JWT Tokens**: Manejo seguro de sesiones
- **Protección de Rutas**: Middleware por roles

### Validación de Datos
- **Frontend**: React Hook Form con validaciones
- **Backend**: Reglas de seguridad en Supabase
- **Sanitización**: Limpieza de datos de entrada

### Seguridad de Base de Datos
- **Row Level Security**: Políticas granulares
- **Validación de Tipos**: TypeScript-like constraints
- **Backup Automático**: Respaldos programados

## 📊 Analytics y Métricas

### Tracking Integrado
- **Visitas por Vehículo**: Contador automático
- **Popularidad de Contenido**: Blog y galería
- **Engagement de Usuarios**: Favoritos y interacciones
- **Estadísticas de Administrador**: Dashboard completo

### SEO Optimizado
- **Meta Tags**: Dinámicos por página
- **Open Graph**: Compartir en redes sociales
- **Estructura Semántica**: HTML5 semántico
- **URLs Amigables**: React Router con slugs

## 🚀 Funcionalidades Avanzadas

### Sistema de Búsqueda
- **Filtros en Tiempo Real**: Actualización instantánea
- **Búsqueda por Texto**: Marca, modelo, características
- **Filtros Combinados**: Múltiples criterios simultáneos

### Gestión de Imágenes
- **Optimización Automática**: Compresión y redimensionado
- **Formatos Soportados**: JPG, PNG, WebP
- **Almacenamiento Cloud**: Supabase Storage
- **Lazy Loading**: Carga eficiente de imágenes

### Sistema de Notificaciones
- **Toast Notifications**: Feedback inmediato
- **Estados de Carga**: Loading spinners
- **Mensajes de Error**: Información clara al usuario

---

**Desarrollado con React, Supabase y Tailwind CSS**

*Ricars Automóviles - Plataforma Web Profesional*
