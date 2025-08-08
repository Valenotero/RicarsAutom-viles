import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { FacebookIcon, WhatsAppIcon, MercadoLibreIcon } from '../icons/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/ricarsautomotores',
      icon: Instagram,
      color: 'hover:text-pink-600'
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/ricarsautomotores',
      icon: FacebookIcon,
      color: 'hover:text-blue-600'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/5491112345678',
      icon: WhatsAppIcon,
      color: 'hover:text-green-600'
    },
    {
      name: 'MercadoLibre',
      href: 'https://www.mercadolibre.com.ar/perfil/ricars-automotores',
      icon: MercadoLibreIcon,
      color: 'hover:text-yellow-600'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="ml-2 text-xl font-bold">Ricars Automóviles</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Tu concesionaria de confianza. Encuentra tu auto ideal con la mejor financiación 
              y el mejor servicio post-venta.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-2 text-primary-400" />
                <span>Av. Principal 123, CABA</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-2 text-primary-400" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-2 text-primary-400" />
                <span>info@ricarsautomotores.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Ricars Automóviles. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacidad" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
