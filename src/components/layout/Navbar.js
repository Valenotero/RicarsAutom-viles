import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Crown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const { currentUser, logout, isAdmin, isOwner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Galería', href: '/galeria' },
    { name: 'Blog', href: '/blog' },
    { name: 'Nosotros', href: '/nosotros' },
  ];

  const handleLogout = async () => {
    try {
      console.log('🚪 Navbar: Iniciando logout...');
      setIsOpen(false);
      setUserMenuOpen(false);
      
      // Mostrar feedback visual
      const logoutButton = document.querySelector('[data-logout-button]');
      if (logoutButton) {
        logoutButton.disabled = true;
        logoutButton.innerHTML = '<div class="animate-spin w-4 h-4 mr-2">⏳</div>Cerrando...';
      }
      
      await logout();
      console.log('✅ Navbar: Logout exitoso');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Navbar: Error en logout:', error);
      // Restaurar botón si hay error
      const logoutButton = document.querySelector('[data-logout-button]');
      if (logoutButton) {
        logoutButton.disabled = false;
        logoutButton.innerHTML = '<LogOut className="w-4 h-4 mr-2" />Cerrar Sesión';
      }
    }
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Verificar permisos de owner - simplificado
  useEffect(() => {
    const checkOwnerPermissions = () => {
      if (!currentUser) {
        setIsOwnerVerified(false);
        return;
      }

      // Verificar si es owner basado en email
      const isOwnerUser = currentUser.email === 'oterov101@gmail.com';
      setIsOwnerVerified(isOwnerUser);
      console.log('🔍 Navbar: Verificación owner:', {
        email: currentUser.email,
        isOwner: isOwnerUser
      });
    };

    checkOwnerPermissions();
  }, [currentUser]);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Ricars</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-300 focus:outline-none"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{currentUser.displayName || currentUser.email}</span>
                </button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                      {isOwnerVerified && (
                        <Link
                          to="/users"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Gestión de Usuarios
                        </Link>
                      )}
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Panel Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        data-logout-button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="btn-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {currentUser ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Link>
                  {isOwnerVerified && (
                    <Link
                      to="/users"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Gestión de Usuarios
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
