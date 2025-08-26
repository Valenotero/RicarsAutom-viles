import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Heart, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { currentUser, userProfile, logout, isAdmin, isOwner, isClient } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Blog', path: '/blog' },
    { name: 'Nosotros', path: '/nosotros' },
  ];

  // Componente del logo Ri Cars con imagen real
  const RiCarsLogo = () => (
    <Link to="/" className="flex items-center space-x-3 ri-logo">
      <div className="relative">
        <img 
          src="/RiCarsPNG.png" 
          alt="Ri Cars Logo" 
          className="h-12 w-auto object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full opacity-60 animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xl text-ri-gradient leading-tight">
          Ri Cars
        </span>
        <span className="text-xs text-gray-500 leading-tight font-medium">
          Multimarcas 0KM y Usados
        </span>
      </div>
    </Link>
  );

  return (
    <>
      {/* Banner promocional superior */}
      {location.pathname === '/' && (
        <div className="fixed top-0 left-0 right-0 z-60 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white text-center py-1.5 text-sm font-medium">
          Multimarcas 0KM y Usados - Av. Cabrera 3754, Bahía Blanca - Tel: 2914683337
        </div>
      )}

      <nav className={`ri-navbar fixed w-full z-50 transition-all duration-300 ${
        location.pathname === '/' ? 'top-6' : 'top-0'
      } ${isScrolled ? 'shadow-lg backdrop-blur-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <RiCarsLogo />

            {/* Enlaces de navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium transition-all duration-200 hover:text-primary-600 ${
                    isActivePath(link.path)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {link.name}
                  {isActivePath(link.path) && (
                    <motion.div
                      layoutId="activeLink"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Acciones del usuario - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile?.name || currentUser.email?.split('@')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <Link
                          to="/perfil"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Mi Perfil</span>
                        </Link>
                        
                        <Link
                          to="/favoritos"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Favoritos</span>
                        </Link>

                        {(isAdmin() || isOwner()) && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Panel Admin</span>
                          </Link>
                        )}

                        <hr className="my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Botón de menú móvil */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Menú móvil */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg"
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                        isActivePath(link.path)
                          ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 border-l-4 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* Información de contacto móvil - Solo teléfono principal */}
                  <div className="px-3 py-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center justify-center space-x-4">
                      <a 
                        href="https://wa.me/5492914683337" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contactar</span>
                      </a>
                    </div>
                  </div>

                  {/* Acciones de usuario móvil */}
                  <div className="px-3 py-4 border-t border-gray-200">
                    {currentUser ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {userProfile?.name || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/perfil"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Mi Perfil</span>
                        </Link>
                        
                        <Link
                          to="/favoritos"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Favoritos</span>
                        </Link>

                        {(isAdmin() || isOwner()) && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Panel Admin</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-lg"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          to="/login"
                          className="block w-full text-center px-4 py-2 text-gray-700 hover:text-primary-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          to="/registro"
                          className="block w-full text-center btn-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Registrarse
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;