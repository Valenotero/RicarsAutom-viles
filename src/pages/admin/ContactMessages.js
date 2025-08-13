import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { contactService } from '../../services/contactService';
import { MessageCircle, Mail, Phone, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactMessages = () => {
  const { userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (userRole && ['admin', 'owner'].includes(userRole)) {
      loadMessages();
    }
  }, [userRole]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      toast.error('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      await contactService.updateMessageStatus(messageId, newStatus);
      toast.success('Estado actualizado correctamente');
      loadMessages(); // Recargar mensajes
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      try {
        await contactService.deleteMessage(messageId);
        toast.success('Mensaje eliminado correctamente');
        loadMessages(); // Recargar mensajes
      } catch (error) {
        console.error('Error eliminando mensaje:', error);
        toast.error('Error al eliminar el mensaje');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'nuevo':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'en_proceso':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'respondido':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cerrado':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'respondido':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!['admin', 'owner'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="w-8 h-8 mr-3 text-blue-600" />
            Mensajes de Contacto
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las consultas de los clientes sobre los vehículos
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
            <p className="text-gray-500">Los clientes aún no han enviado consultas.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {message.email}
                      </div>
                      {message.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {message.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(message.created_at)}
                      </div>
                    </div>

                    {message.vehicle_title && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Vehículo: </span>
                        <span className="text-sm font-medium text-gray-700">{message.vehicle_title}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <select
                      value={message.status}
                      onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="respondido">Respondido</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                    
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar mensaje"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
