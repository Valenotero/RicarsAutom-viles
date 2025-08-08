# Ricars Automóviles

Plataforma web para Ricars Automóviles - Concesionaria de vehículos nuevos y usados.

## 🚗 Características

- Catálogo de vehículos con filtros avanzados
- Sistema de autenticación de usuarios
- Panel de administración
- Galería de imágenes
- Blog integrado
- Diseño responsive con Tailwind CSS
- Integración con Supabase

## 🛠️ Tecnologías

- React 18
- React Router DOM
- Tailwind CSS
- Supabase
- Framer Motion
- React Hook Form

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/ri-cars-automotores.git
cd ri-cars-automotores
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con:
```
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Ejecuta el proyecto en desarrollo:
```bash
npm start
```

## 🚀 Despliegue

Para desplegar la aplicación, puedes usar cualquier plataforma de hosting que soporte aplicaciones React como:

- **Vercel**: Conecta tu repositorio y despliega automáticamente
- **Netlify**: Arrastra y suelta la carpeta `build` o conecta tu repositorio
- **Firebase Hosting**: Usa Firebase CLI para desplegar
- **GitHub Pages**: Configura manualmente con gh-pages
- **AWS S3 + CloudFront**: Para hosting empresarial

### Build para producción

```bash
npm run build
```

Esto generará la carpeta `build` con los archivos optimizados para producción.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes del panel de administración
│   ├── auth/           # Componentes de autenticación
│   ├── catalog/        # Componentes del catálogo
│   ├── home/           # Componentes de la página principal
│   ├── layout/         # Componentes de layout
│   ├── ui/             # Componentes de UI básicos
│   └── vehicles/       # Componentes relacionados con vehículos
├── contexts/           # Contextos de React
├── pages/              # Páginas de la aplicación
├── services/           # Servicios y APIs
└── supabase/           # Configuración de Supabase
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Ricars Automóviles - [info@ricarsautomotores.com](mailto:info@ricarsautomotores.com)
