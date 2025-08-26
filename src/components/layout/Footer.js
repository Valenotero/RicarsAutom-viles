import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FacebookIcon, WhatsAppIcon, MercadoLibreIcon } from '../../components/icons/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/ricar_s_automotores',
      icon: Instagram,
      color: 'hover:text-pink-400'
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/ri-cars-automotores',
      icon: FacebookIcon,
      color: 'hover:text-blue-400'
    },
    {
      name: 'WhatsApp Principal',
      href: 'https://wa.me/5492914683337',
      icon: WhatsAppIcon,
      color: 'hover:text-green-400'
    },
    {
      name: 'MercadoLibre',
      href: 'https://www.mercadolibre.com.ar/perfil/ri-cars-automotores',
      icon: MercadoLibreIcon,
      color: 'hover:text-secondary-400'
    }
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: 'Av. Cabrera 3754, Bahía Blanca',
      link: 'https://maps.google.com/?q=Av.+Cabrera+3754,+Bahía+Blanca'
    },
    {
      icon: Phone,
      text: '2914683337',
      link: 'https://wa.me/5492914683337'
    },
    {
      icon: Phone,
      text: '2915038204',
      link: 'https://wa.me/5492915038204'
    },
    {
      icon: Mail,
      text: 'info@ricarsautomotores.com',
      link: 'mailto:info@ricarsautomotores.com'
    }
  ];

  const quickLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Blog', path: '/blog' },
    { name: 'Nosotros', path: '/nosotros' },
  ];

  const services = [
    'Venta de vehículos 0KM',
    'Venta de vehículos usados',
    'Multimarcas',
    'Asesoramiento especializado', 
    'Servicio post-venta',
    'Gestión de documentación'
  ];

  return (
    <footer className="ri-footer relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción - Ocupa 2 columnas en desktop */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="relative">
                <img 
                  src="/RiCarsPNG.png" 
                  alt="Ri Cars Logo" 
                  className="h-12 w-auto object-contain filter brightness-0 invert"
                />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-400 rounded-full opacity-75 animate-pulse"></div>
              </div>
              <div className="ml-3">
                <span className="text-2xl font-bold text-ri-gradient bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Ri Cars
                </span>
                <p className="text-sm text-gray-400 font-medium">
                  Multimarcas 0KM y Usados
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Tu concesionaria de confianza en Bahía Blanca. Encontrá tu auto ideal 
              con el respaldo de años de experiencia en multimarcas.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-white relative">
              Enlaces Rápidos
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-white relative">
              Nuestros Servicios
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            </h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm leading-relaxed">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-white relative">
              Contacto
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            </h3>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-start group">
                  <contact.icon className="w-5 h-5 mr-3 mt-0.5 text-primary-400 group-hover:text-secondary-400 transition-colors duration-200 flex-shrink-0" />
                  {contact.link ? (
                    <a 
                      href={contact.link}
                      target={contact.link.startsWith('http') ? '_blank' : '_self'}
                      rel={contact.link.startsWith('http') ? 'noopener noreferrer' : ''}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm leading-relaxed"
                    >
                      {contact.text}
                    </a>
                  ) : (
                    <span className="text-gray-300 text-sm leading-relaxed">{contact.text}</span>
                  )}
                </div>
              ))}
              
              {/* Horarios */}
              <div className="flex items-start group mt-6">
                <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary-400 group-hover:text-secondary-400 transition-colors duration-200 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p className="font-medium text-white mb-1">Horarios de atención:</p>
                  <p>Lun - Vie: 9:00 - 18:00</p>
                  <p>Sábados: 9:00 - 13:00</p>
                  <p className="text-secondary-400 mt-1">¡Domingos con cita previa!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección promocional */}
        <div className="mt-12 mb-8">
          <div className="hot-deals-section rounded-2xl p-6 text-center border border-primary-500/20">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h4 className="text-xl font-bold text-white">Encontrá tu auto ideal</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Multimarcas 0KM y Usados en Bahía Blanca
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://wa.me/5492914683337" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center space-x-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Consultá ahora</span>
              </a>
              <Link 
                to="/catalogo" 
                className="btn-secondary inline-flex items-center justify-center"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm text-center lg:text-left">
              <p className="font-medium">© {currentYear} Ri Cars - Multimarcas 0KM y Usados. Todos los derechos reservados.</p>
              <p className="mt-2 flex items-center justify-center lg:justify-start">
                Diseñado y desarrollado con 
                <span className="mx-1 text-red-400">❤️</span>
                por{' '}
                <a 
                  href="https://vgwebstudioportfolio.netlify.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-secondary-400 transition-colors duration-200 underline hover:no-underline ml-1 font-medium"
                >
                  VG Web Studio
                </a>
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
              <Link 
                to="/privacidad" 
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/terminos" 
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Términos y Condiciones
              </Link>
              <Link 
                to="/galeria" 
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Galería
              </Link>
              <a 
                href="https://maps.google.com/?q=Av.+Cabrera+3754,+Bahía+Blanca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Ubicación
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-500/5 to-transparent rounded-full translate-y-48 -translate-x-48"></div>
    </footer>
  );
};

export default Footer;