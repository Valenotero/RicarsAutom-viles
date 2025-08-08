# Ricars Automóviles - Plataforma Web

## 📋 Descripción

Ricars Automóviles es una plataforma web completa para concesionarias de vehículos, desarrollada con React + Firebase. La aplicación permite a los usuarios explorar un catálogo de vehículos, ver detalles completos, contactar con la concesionaria y gestionar el inventario desde un panel de administración.

## 🚀 Características Principales

### Para Usuarios
- **Página de Inicio**: Hero con búsqueda rápida, categorías de vehículos, destacados y recientes
- **Catálogo Avanzado**: Filtros por marca, modelo, precio, año, tipo, etc.
- **Detalle de Vehículo**: Galería de imágenes, ficha técnica completa, conversión de precios
- **Sistema de Autenticación**: Registro, login y recuperación de contraseña
- **Contacto Integrado**: WhatsApp, Facebook, MercadoLibre
- **Página "Sobre Nosotros"**: Historia, equipo y información de contacto

### Para Administradores
- **Panel de Administración**: Dashboard con estadísticas y gestión completa
- **Gestión de Vehículos**: Agregar, editar, eliminar vehículos
- **Carga de Imágenes**: Subida múltiple de imágenes a Firebase Storage
- **Estadísticas**: Visitas por vehículo, totales, destacados, promociones
- **Sistema de Roles**: Control de acceso basado en roles (admin, cliente, usuario)

## 🛠 Tecnologías Utilizadas

- **Frontend**: React 18, React Router DOM
- **Estilos**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Iconos**: Lucide React
- **Formularios**: React Hook Form
- **Notificaciones**: React Hot Toast
- **Galería**: React Image Gallery

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd ricars-automotores
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication, Firestore Database y Storage
   - Copiar las credenciales de configuración
   - Actualizar `src/firebase/config.js` con tus credenciales

4. **Configurar reglas de Firestore**
```javascript
// En Firebase Console > Firestore Database > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cualquiera puede leer vehículos
    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

5. **Configurar reglas de Storage**
```javascript
// En Firebase Console > Storage > Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /vehicles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

6. **Ejecutar en desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes del panel de administración
│   ├── auth/           # Componentes de autenticación
│   ├── catalog/        # Componentes del catálogo
│   ├── home/           # Componentes de la página de inicio
│   ├── layout/         # Componentes de layout (Navbar, Footer)
│   ├── ui/             # Componentes de interfaz básicos
│   └── vehicles/       # Componentes relacionados con vehículos
├── contexts/           # Contextos de React (AuthContext)
├── firebase/           # Configuración de Firebase
├── pages/              # Páginas principales
│   ├── admin/          # Páginas del panel de administración
│   └── auth/           # Páginas de autenticación
├── services/           # Servicios para comunicación con Firebase
└── App.js              # Componente principal
```

## 🚀 Deployment

### Vercel (Recomendado)

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Configurar variables de entorno**
```bash
vercel env add REACT_APP_FIREBASE_API_KEY
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN
vercel env add REACT_APP_FIREBASE_PROJECT_ID
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID
vercel env add REACT_APP_FIREBASE_APP_ID
```

3. **Deploy**
```bash
vercel --prod
```

### Hostinger

1. **Build del proyecto**
```bash
npm run build
```

2. **Subir archivos**
   - Subir el contenido de la carpeta `build/` al directorio raíz de tu hosting
   - Configurar redirección para SPA en `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 👥 Roles y Permisos

### Usuario (No logueado)
- Navegar por el catálogo
- Ver información básica de vehículos
- Acceder a páginas públicas

### Cliente (Logueado)
- Todas las funcionalidades de usuario
- Ver detalles completos de vehículos
- Contactar por WhatsApp/Facebook
- Guardar favoritos

### Administrador
- Todas las funcionalidades de cliente
- Acceso al panel de administración
- Gestionar vehículos (crear, editar, eliminar)
- Ver estadísticas
- Subir imágenes

## 🔧 Configuración de Firebase

### 1. Crear Proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication, Firestore y Storage

### 2. Configurar Authentication
1. Ve a Authentication > Sign-in method
2. Habilita Email/Password
3. Configura plantillas de email para recuperación de contraseña

### 3. Configurar Firestore
1. Ve a Firestore Database
2. Crea una base de datos en modo de producción
3. Configura las reglas de seguridad (ver arriba)

### 4. Configurar Storage
1. Ve a Storage
2. Inicia Storage
3. Configura las reglas de seguridad (ver arriba)

### 5. Obtener Credenciales
1. Ve a Project Settings
2. En la sección "Your apps", agrega una app web
3. Copia la configuración y actualiza `src/firebase/config.js`

## 📱 Características Responsive

La aplicación está completamente optimizada para:
- **Desktop**: 1024px y superior
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🎨 Personalización

### Colores
Los colores principales se pueden modificar en `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    // ... más tonos
    900: '#1e3a8a',
  }
}
```

### Logo y Branding
- Actualizar logo en `src/components/layout/Navbar.js`
- Modificar información de contacto en `src/components/layout/Footer.js`
- Actualizar datos de la empresa en `src/pages/About.js`

## 🔒 Seguridad

- Autenticación con Firebase Auth
- Reglas de seguridad en Firestore y Storage
- Validación de formularios en frontend
- Protección de rutas por roles
- Sanitización de datos

## 📊 Analytics y SEO

- Meta tags optimizados para SEO
- Open Graph tags para redes sociales
- Estructura semántica HTML
- URLs amigables con React Router

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@ricarsautomotores.com
- WhatsApp: +54 11 1234-5678

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Actualizar a versiones más recientes
npm audit fix
```

---

**Desarrollado con ❤️ para Ricars Automóviles**
