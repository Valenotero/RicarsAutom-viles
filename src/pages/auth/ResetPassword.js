import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError('Error al enviar el email de recuperación. Verifica tu dirección de email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email enviado
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hemos enviado un enlace de recuperación a tu email.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary"
              >
                Volver al login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Enviando email...
                    </div>
                  ) : (
                    'Enviar email de recuperación'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver al login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
