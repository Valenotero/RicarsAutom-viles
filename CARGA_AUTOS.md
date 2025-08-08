# Panel de Administrador - Carga de Vehículos - Ricars Automóviles

## 📋 Descripción

Este documento detalla cómo funciona el panel de administrador de Ricars Automóviles, incluyendo todas las funcionalidades para gestionar el inventario de vehículos, estadísticas y operaciones administrativas.

## 🔐 Acceso al Panel de Administrador

### 1. Requisitos Previos
- **Rol de Administrador**: Solo usuarios con rol `admin` pueden acceder al panel.
- **Autenticación**: Debes estar logueado con una cuenta que tenga permisos de administrador.
- **URL de Acceso**: `/admin` (ej: `https://ricarsautomotores.com/admin`)

### 2. Proceso de Acceso
1. **Iniciar Sesión**: Ve a la página de login (`/login`) e ingresa con tu cuenta de administrador.
2. **Navegación**: Una vez logueado, verás "Panel Admin" en el menú de usuario.
3. **Acceso Directo**: También puedes navegar directamente a `/admin` si ya estás autenticado.

### 3. Verificación de Permisos
El sistema verifica automáticamente tu rol de usuario:
- Si no estás logueado → Redirige a `/login`
- Si no eres administrador → Redirige a `/` (página principal)
- Si eres administrador → Acceso completo al panel

## 🏠 Interfaz del Panel de Administrador

### 1. Header Principal
- **Logo de Ricars Automóviles**
- **Botón "Agregar Vehículo"**: Abre el formulario para cargar un nuevo vehículo
- **Información del usuario logueado**

### 2. Sistema de Pestañas
El panel está organizado en tres pestañas principales:

#### 📊 Dashboard
- **Estadísticas Rápidas**:
  - Total de vehículos en inventario
  - Total de visitas a vehículos
  - Vehículos destacados
  - Vehículos en promoción
- **Vehículos Recientes**: Lista de los últimos vehículos agregados con acciones rápidas

#### 🚗 Vehículos
- **Lista Completa**: Todos los vehículos en el sistema
- **Acciones por Vehículo**:
  - ✏️ **Editar**: Modificar información del vehículo
  - 🗑️ **Eliminar**: Remover vehículo del inventario
  - 👁️ **Ver Detalles**: Ver página pública del vehículo
- **Filtros y Búsqueda**: Encontrar vehículos específicos rápidamente

#### 📈 Estadísticas
- **Métricas Detalladas**: Análisis completo de visitas y rendimiento
- **Gráficos y Reportes**: Visualización de datos del negocio

## ➕ Cómo Cargar un Nuevo Vehículo

### 1. Acceso al Formulario
- Haz clic en el botón **"Agregar Vehículo"** en el header del panel
- Se abrirá un modal con el formulario completo

### 2. Información Básica del Vehículo

#### Datos Principales
```javascript
// Campos obligatorios marcados con *
{
  brand: "Toyota",           // * Marca del vehículo
  model: "Corolla",          // * Modelo
  year: 2023,                // * Año de fabricación
  kilometers: 15000,         // * Kilometraje
  price: 25000,              // * Precio en USD
  priceARS: 25000000,        // * Precio en ARS
  condition: "new",          // * Estado: "new" | "used"
  transmission: "automatic",  // * Transmisión: "automatic" | "manual"
  fuelType: "gasoline",      // * Combustible: "gasoline" | "diesel" | "hybrid" | "electric"
  color: "Blanco",           // * Color
  type: "sedan",             // * Tipo: "sedan" | "suv" | "pickup" | "hatchback" | "coupe" | "cabriolet" | "premium"
  location: "Buenos Aires",  // * Ubicación
  engine: "2.0L",            // * Motor
  power: "150hp",            // * Potencia
  features: ["Aire acondicionado", "Bluetooth", "Cámara de reversa"] // Características
}
```

#### Opciones de Destacado
- **Destacado**: Marca el vehículo para aparecer en la sección "Recomendados" de la página principal
- **Promoción**: Marca el vehículo para aparecer en la sección "Ofertas" de la página principal

### 3. Carga de Imágenes

#### Requisitos de Imágenes
- **Formato**: JPG, PNG, WebP
- **Tamaño Máximo**: 5MB por imagen
- **Cantidad**: Mínimo 1, máximo 10 imágenes
- **Resolución Recomendada**: 1200x800 píxeles

#### Proceso de Carga
1. **Seleccionar Imágenes**: Haz clic en "Seleccionar Imágenes" o arrastra archivos
2. **Vista Previa**: Las imágenes se muestran en miniatura
3. **Reordenar**: Arrastra las imágenes para cambiar el orden
4. **Eliminar**: Haz clic en "X" para remover una imagen
5. **Imagen Principal**: La primera imagen será la imagen principal del vehículo

#### Almacenamiento
- Las imágenes se suben automáticamente a Firebase Storage
- Se optimizan para web (compresión automática)
- Se generan URLs públicas para acceso directo

### 4. Características del Vehículo

#### Lista Dinámica de Características
- **Agregar**: Escribe una característica y presiona Enter
- **Eliminar**: Haz clic en "X" junto a la característica
- **Ejemplos de Características**:
  - Aire acondicionado
  - Bluetooth
  - Cámara de reversa
  - Sensores de estacionamiento
  - Sistema de navegación
  - Tapizado de cuero
  - Techo solar
  - Tracción 4x4
  - ABS
  - Airbags múltiples

### 5. Validación del Formulario

#### Validaciones Automáticas
- **Campos Obligatorios**: Todos los campos marcados con * son obligatorios
- **Formato de Email**: Validación de formato de email (si aplica)
- **Números**: Validación de formato numérico para precio, año, kilometraje
- **Imágenes**: Verificación de formato y tamaño de archivos

#### Mensajes de Error
- Los errores se muestran en tiempo real
- Mensajes claros y específicos para cada tipo de error
- No se puede guardar hasta que todos los errores estén resueltos

### 6. Guardado del Vehículo

#### Proceso de Guardado
1. **Validación**: Se verifican todos los campos
2. **Carga de Imágenes**: Se suben las imágenes a Firebase Storage
3. **Creación en Base de Datos**: Se guarda la información en Firestore
4. **Confirmación**: Se muestra mensaje de éxito
5. **Redirección**: Se actualiza la lista de vehículos

#### Estructura en Firestore
```javascript
// Colección: vehicles
{
  id: "auto-generated-id",
  brand: "Toyota",
  model: "Corolla",
  year: 2023,
  kilometers: 15000,
  price: 25000,
  priceARS: 25000000,
  condition: "new",
  transmission: "automatic",
  fuelType: "gasoline",
  color: "Blanco",
  type: "sedan",
  location: "Buenos Aires",
  engine: "2.0L",
  power: "150hp",
  features: ["Aire acondicionado", "Bluetooth", "Cámara de reversa"],
  images: [
    "https://firebasestorage.googleapis.com/.../image1.jpg",
    "https://firebasestorage.googleapis.com/.../image2.jpg"
  ],
  isFeatured: true,
  isPromotion: false,
  views: 0,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## ✏️ Cómo Editar un Vehículo Existente

### 1. Acceso a la Edición
- En la pestaña **"Vehículos"**, busca el vehículo que quieres editar
- Haz clic en el botón **"Editar"** (ícono de lápiz)
- Se abrirá el mismo formulario con los datos precargados

### 2. Modificaciones Permitidas
- **Información Básica**: Todos los campos pueden ser modificados
- **Imágenes**: Puedes agregar, eliminar o reordenar imágenes
- **Características**: Agregar o eliminar características
- **Opciones**: Cambiar estado de destacado/promoción

### 3. Proceso de Actualización
1. **Modificar Campos**: Cambia la información necesaria
2. **Gestionar Imágenes**: 
   - Agregar nuevas imágenes
   - Eliminar imágenes existentes
   - Reordenar imágenes
3. **Guardar Cambios**: Haz clic en "Guardar Cambios"
4. **Confirmación**: Se muestra mensaje de éxito

### 4. Gestión de Imágenes en Edición
- **Imágenes Existentes**: Se muestran con opción de eliminar
- **Nuevas Imágenes**: Se pueden agregar al final
- **Imagen Principal**: La primera imagen de la lista será la principal
- **Eliminación**: Las imágenes eliminadas se borran permanentemente de Storage

## 🗑️ Cómo Eliminar un Vehículo

### 1. Proceso de Eliminación
- En la pestaña **"Vehículos"**, busca el vehículo a eliminar
- Haz clic en el botón **"Eliminar"** (ícono de papelera)
- Se mostrará un diálogo de confirmación

### 2. Confirmación de Eliminación
- **Advertencia**: "¿Estás seguro de que quieres eliminar este vehículo?"
- **Información**: Se muestra el modelo y año del vehículo
- **Acciones**:
  - **Cancelar**: Cierra el diálogo sin eliminar
  - **Eliminar**: Confirma la eliminación

### 3. Proceso Completo de Eliminación
1. **Eliminación de Imágenes**: Se borran todas las imágenes de Firebase Storage
2. **Eliminación de Datos**: Se elimina el documento de Firestore
3. **Actualización de Lista**: Se actualiza la lista de vehículos
4. **Confirmación**: Se muestra mensaje de éxito

### 4. Consideraciones Importantes
- **Acción Irreversible**: La eliminación no se puede deshacer
- **Imágenes**: Se eliminan permanentemente de Storage
- **Estadísticas**: Se pierden las estadísticas de visitas
- **Enlaces**: Los enlaces directos al vehículo dejarán de funcionar

## 📊 Estadísticas y Métricas

### 1. Dashboard - Estadísticas Rápidas
- **Total de Vehículos**: Contador de todos los vehículos en inventario
- **Total de Visitas**: Suma de todas las visitas a vehículos
- **Vehículos Destacados**: Cantidad de vehículos marcados como destacados
- **Vehículos en Promoción**: Cantidad de vehículos en promoción

### 2. Pestaña Estadísticas - Métricas Detalladas
- **Vehículos Más Visitados**: Lista ordenada por número de visitas
- **Rendimiento por Marca**: Estadísticas agrupadas por marca
- **Tendencias de Precio**: Análisis de rangos de precios
- **Actividad Reciente**: Vehículos agregados en los últimos días

### 3. Contador de Visitas
- **Incremento Automático**: Cada vez que alguien ve un vehículo, el contador aumenta
- **Visualización**: Se muestra en la lista de vehículos del panel
- **Análisis**: Permite identificar qué vehículos generan más interés

## 📱 Funcionalidades Móviles

### 1. Diseño Responsive
- **Tablets**: Interfaz adaptada para pantallas medianas
- **Móviles**: Navegación optimizada para pantallas pequeñas
- **Touch**: Botones y controles optimizados para uso táctil

### 2. Carga de Imágenes en Móvil
- **Cámara**: Opción de tomar fotos directamente con la cámara
- **Galería**: Selección desde la galería del dispositivo
- **Vista Previa**: Previsualización optimizada para pantallas pequeñas

### 3. Formularios Adaptados
- **Campos Apilados**: En móviles, los campos se muestran verticalmente
- **Botones Grandes**: Botones más grandes para facilitar el uso táctil
- **Navegación Simplificada**: Menús adaptados para pantallas pequeñas

## 🔧 Mantenimiento y Configuración

### 1. Limpieza de Datos
- **Vehículos Sin Imágenes**: Identificar vehículos sin imágenes principales
- **Datos Incompletos**: Encontrar vehículos con información faltante
- **Duplicados**: Detectar posibles duplicados en el inventario

### 2. Optimización de Imágenes
- **Compresión Automática**: Las imágenes se optimizan al subir
- **Formatos Soportados**: JPG, PNG, WebP
- **Tamaños Responsive**: Se generan diferentes tamaños automáticamente

### 3. Backup y Seguridad
- **Backup Automático**: Los datos se respaldan automáticamente en Firebase
- **Control de Acceso**: Solo administradores pueden acceder al panel
- **Logs de Actividad**: Se registran todas las acciones administrativas

## 🐛 Solución de Problemas Frecuentes

### 1. Error al Cargar Imágenes
- **Tamaño de Archivo**: Verifica que las imágenes no superen 5MB
- **Formato**: Asegúrate de que sean JPG, PNG o WebP
- **Conexión**: Verifica tu conexión a internet
- **Navegador**: Intenta con otro navegador

### 2. Error al Guardar Vehículo
- **Campos Obligatorios**: Verifica que todos los campos marcados con * estén completos
- **Formato de Datos**: Revisa que los números tengan formato correcto
- **Conexión**: Verifica tu conexión a internet
- **Permisos**: Asegúrate de tener permisos de administrador

### 3. Imágenes No Se Muestran
- **URLs Válidas**: Verifica que las URLs de las imágenes sean correctas
- **Permisos de Storage**: Confirma que las reglas de Storage permitan lectura pública
- **Caché del Navegador**: Intenta refrescar la página (Ctrl+F5)

### 4. Panel No Carga
- **Autenticación**: Verifica que estés logueado como administrador
- **URL Correcta**: Confirma que estés en `/admin`
- **Permisos**: Verifica que tu cuenta tenga rol de administrador
- **Conexión**: Verifica tu conexión a internet

### 5. Estadísticas No Se Actualizan
- **Tiempo de Espera**: Las estadísticas pueden tardar unos minutos en actualizarse
- **Caché**: Intenta refrescar la página
- **Reglas de Firestore**: Verifica que las reglas permitan lectura de estadísticas

## 📞 Soporte Técnico

Si experimentas problemas persistentes con el panel de administrador:

### Contacto Directo
- **Email**: admin@ricarsautomotores.com
- **WhatsApp**: +54 11 1234-5678
- **Horarios**: Lunes a Viernes 9:00 - 18:00

### Información Necesaria para Soporte
- **Descripción del Problema**: Explica detalladamente qué está pasando
- **Pasos para Reproducir**: Cómo llegaste al problema
- **Navegador y Versión**: Chrome, Firefox, Safari, etc.
- **Dispositivo**: PC, tablet, móvil
- **Capturas de Pantalla**: Si es posible, incluye imágenes del error

---

**¡El panel de administrador está listo para gestionar el inventario de Ricars Automóviles!**
