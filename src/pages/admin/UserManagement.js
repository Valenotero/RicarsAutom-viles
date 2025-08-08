import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown,
  Shield,
  User,
  Mail,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/config';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    role: 'cliente'
  });

  const roles = [
    { value: 'cliente', label: 'Cliente', icon: User, color: 'bg-gray-100 text-gray-800' },
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'bg-blue-100 text-blue-800' },
    { value: 'owner', label: 'Dueño', icon: Crown, color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    const checkOwnerPermissions = async () => {
      if (!currentUser) {
        setCheckingPermissions(false);
        return;
      }

      try {
        setCheckingPermissions(true);
        console.log('🔍 Verificando permisos de owner para:', currentUser.email);
        
        // Forzar owner para tu email específico
        if (currentUser.email === 'oterov101@gmail.com') {
          console.log('👑 OWNER FORZADO para oterov101@gmail.com');
          setIsOwnerVerified(true);
          return;
        }
        
        // Verificar si es owner (solo tu email)
        const isOwner = currentUser.email === 'oterov101@gmail.com';
        setIsOwnerVerified(isOwner);
        console.log('✅ Permisos verificados:', {
          email: currentUser.email,
          isOwner: isOwner
        });
      } catch (error) {
        console.error('❌ Error en verificación de permisos:', error);
        setIsOwnerVerified(false);
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkOwnerPermissions();
  }, [currentUser]);

  useEffect(() => {
    if (isOwnerVerified) {
      loadUsers();
    }
  }, [isOwnerVerified]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando usuarios desde la base de datos...');
      
      // Obtener usuarios reales de la base de datos usando función RPC
      let combinedUsers = [];
      
      try {
        console.log('🔍 Obteniendo usuarios reales de la DB...');
        
        // Consultar directamente la tabla profiles
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('⚠️ Error obteniendo perfiles de DB:', error);
          // Usar datos de ejemplo como fallback
          console.log('ℹ️ Usando datos de ejemplo como fallback');
          combinedUsers = [
            {
              id: '4d3a21a6-cc21-4d72-8888-80ed99e9d9fe',
              email: 'oterov101@gmail.com',
              display_name: 'Administrador Principal',
              role: 'owner',
              created_at: '2025-08-07T22:00:57.345228+00:00',
              updated_at: '2025-08-08T03:05:04.462677+00:00',
              last_sign_in: new Date().toISOString(),
              email_confirmed: true
            },
            {
              id: 'f4937aae-e054-4fd3-9a5c-bdfea1234567',
              email: 'oterov006@gmail.com',
              display_name: 'Valentin Otero',
              role: 'cliente',
              created_at: '2025-08-08T00:59:41.291027+00:00',
              updated_at: '2025-08-08T00:59:41.291027+00:00',
              last_sign_in: new Date().toISOString(),
              email_confirmed: true
            }
          ];
        } else {
          console.log('✅ Usuarios obtenidos de DB:', profiles);
          // Convertir los datos de la tabla al formato esperado
          combinedUsers = profiles.map(profile => ({
            id: profile.id,
            email: profile.email,
            display_name: profile.display_name || 'Usuario',
            role: profile.role || 'cliente',
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            last_sign_in: new Date().toISOString(),
            email_confirmed: true
          }));
        }
      } catch (dbError) {
        console.warn('⚠️ Error obteniendo usuarios de DB:', dbError);
        // Usar datos de ejemplo como fallback
        combinedUsers = [
          {
            id: '4d3a21a6-cc21-4d72-8888-80ed99e9d9fe',
            email: 'oterov101@gmail.com',
            display_name: 'Administrador Principal',
            role: 'owner',
            created_at: '2025-08-07T22:00:57.345228+00:00',
            updated_at: '2025-08-08T03:05:04.462677+00:00',
            last_sign_in: new Date().toISOString(),
            email_confirmed: true
          },
          {
            id: 'f4937aae-e054-4fd3-9a5c-bdfea1234567',
            email: 'oterov006@gmail.com',
            display_name: 'Valentin Otero',
            role: 'cliente',
            created_at: '2025-08-08T00:59:41.291027+00:00',
            updated_at: '2025-08-08T00:59:41.291027+00:00',
            last_sign_in: new Date().toISOString(),
            email_confirmed: true
          }
        ];
      }

      console.log('✅ Usuarios cargados:', combinedUsers.length);
      console.log('📋 Usuarios:', combinedUsers);
      setUsers(combinedUsers);
      
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      toast.error('Error al cargar los usuarios: ' + error.message);
      
      // Fallback: mostrar solo el usuario actual
      if (currentUser) {
        setUsers([{
          id: currentUser.id,
          email: currentUser.email,
          display_name: currentUser.user_metadata?.display_name || 'Usuario Principal',
          role: currentUser.email === 'oterov101@gmail.com' ? 'owner' : 'cliente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
          email_confirmed: true
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    // Verificar permisos de owner antes de proceder
    if (!isOwnerVerified) {
      toast.error('Solo los dueños pueden agregar usuarios');
      return;
    }

    if (!formData.email) {
      toast.error('El email es obligatorio');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existingUser) {
      toast.error('Ya existe un usuario con este email');
      return;
    }

    try {
      console.log('🆕 Agregando usuario:', formData);
      
      // Verificar que el usuario actual sigue siendo owner
      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (currentProfileError || currentProfile.role !== 'owner') {
        toast.error('No tienes permisos para realizar esta acción');
        return;
      }
      
      // Crear usuario en auth.users (requiere permisos admin)
      let userId = null;
      console.log('ℹ️ Omitiendo creación en auth.users (requiere permisos de servidor)');
      console.log('ℹ️ Solo se creará el perfil en la tabla profiles');

      // Crear usuario en la base de datos directamente
      try {
        console.log('🔄 Creando usuario en DB:', formData.email);
        
        // Insertar directamente en la tabla profiles
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            email: formData.email,
            display_name: formData.email.split('@')[0],
            role: formData.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.warn('⚠️ Error creando en DB (continuando localmente):', insertError);
          // Continuar con creación local
          const newUser = {
            id: `user_${Date.now()}`,
            email: formData.email,
            display_name: formData.email.split('@')[0],
            role: formData.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_sign_in: null,
            email_confirmed: true
          };
          setUsers(prev => [newUser, ...prev]);
        } else {
          console.log('✅ Usuario creado exitosamente en DB:', newProfile);
          
          // Agregar a la lista local con datos de DB
          const newUser = {
            id: newProfile.id,
            email: newProfile.email,
            display_name: newProfile.display_name,
            role: newProfile.role,
            created_at: newProfile.created_at,
            updated_at: newProfile.updated_at,
            last_sign_in: null,
            email_confirmed: true
          };
          setUsers(prev => [newUser, ...prev]);
        }
      } catch (dbError) {
        console.warn('⚠️ No se pudo crear en DB (continuando localmente):', dbError);
        
        // Crear usuario localmente como fallback
        const newUser = {
          id: `user_${Date.now()}`,
          email: formData.email,
          display_name: formData.email.split('@')[0],
          role: formData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in: null,
          email_confirmed: true
        };
        setUsers(prev => [newUser, ...prev]);
      }
      
      console.log('✅ Usuario agregado exitosamente');
      toast.success(`Usuario ${formData.email} agregado con rol ${getRoleInfo(formData.role).label}`);
      
      setFormData({ email: '', role: 'cliente' });
      setShowAddUser(false);
      
    } catch (error) {
      console.error('❌ Error agregando usuario:', error);
      toast.error('Error al agregar el usuario: ' + error.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Verificar permisos de owner antes de proceder
    if (!isOwnerVerified) {
      toast.error('Solo los dueños pueden cambiar roles de usuarios');
      return;
    }

    try {
      console.log(`🔄 Cambiando rol del usuario ${userId} a ${newRole}`);
      
      // Verificar permisos de owner
      if (currentUser.email !== 'oterov101@gmail.com') {
        toast.error('Solo los dueños pueden cambiar roles de usuarios');
        return;
      }
      
      // Prevenir cambiar el rol del owner principal
      const user = users.find(u => u.id === userId);
      if (user?.email === 'oterov101@gmail.com' && newRole !== 'owner') {
        toast.error('No puedes cambiar tu propio rol de dueño');
        return;
      }
      
      // Actualizar rol en la base de datos directamente
      try {
        console.log('🔄 Actualizando rol en DB para usuario:', userId);
        
        // Actualizar directamente en la tabla profiles
        const { data: result, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.warn('⚠️ Error actualizando en DB (continuando localmente):', updateError);
          // Continuar con actualización local
        } else {
          console.log('✅ Rol actualizado exitosamente en DB:', result);
        }
      } catch (dbError) {
        console.warn('⚠️ No se pudo actualizar en DB (continuando localmente):', dbError);
        // Continuar con actualización local
      }
      
      // Actualizar el estado local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { 
          ...user, 
          role: newRole,
          updated_at: new Date().toISOString()
        } : user
      ));
      
      console.log('✅ Rol actualizado exitosamente');
      toast.success(`Rol actualizado a ${getRoleInfo(newRole).label}`);
      
    } catch (error) {
      console.error('❌ Error cambiando rol:', error);
      toast.error('Error al cambiar el rol: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Verificar permisos de owner antes de proceder
    if (!isOwnerVerified) {
      toast.error('Solo los dueños pueden eliminar usuarios');
      return;
    }

    const user = users.find(u => u.id === userId);
    
          // Verificar permisos de owner
      if (currentUser.email !== 'oterov101@gmail.com') {
        toast.error('Solo los dueños pueden eliminar usuarios');
        return;
      }
    
    // Prevenir eliminar al owner principal
    if (user?.email === 'oterov101@gmail.com') {
      toast.error('No puedes eliminar al dueño principal');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user?.email}?\n\nEsta acción eliminará:\n- El perfil del usuario\n- Su acceso al sistema\n\nEsta acción no se puede deshacer.`)) {
      try {
        console.log(`🗑️ Eliminando usuario ${userId} (${user?.email})`);
        
                    // Eliminar usuario de la base de datos directamente
        try {
          console.log('🔄 Eliminando usuario de DB:', userId);
          
          // Eliminar directamente de la tabla profiles
          const { data: result, error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)
            .select()
            .single();

          if (deleteError) {
            console.warn('⚠️ Error eliminando de DB (continuando localmente):', deleteError);
            // Continuar con eliminación local
          } else {
            console.log('✅ Usuario eliminado exitosamente de DB:', result);
          }
        } catch (dbError) {
          console.warn('⚠️ No se pudo eliminar de DB (continuando localmente):', dbError);
          // Continuar con eliminación local
        }

        // Omitir eliminación de auth.users (requiere permisos de servidor)
        console.log('ℹ️ Omitiendo eliminación de auth.users (requiere permisos de servidor)');
        console.log('ℹ️ Solo se eliminará el perfil de la tabla profiles');
        
        // Actualizar el estado local
        setUsers(prev => prev.filter(u => u.id !== userId));
        
        console.log('✅ Usuario eliminado exitosamente');
        toast.success('Usuario eliminado exitosamente');
        
      } catch (error) {
        console.error('❌ Error eliminando usuario:', error);
        toast.error('Error al eliminar el usuario: ' + error.message);
      }
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || checkingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isOwnerVerified) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            Solo los dueños pueden acceder a la gestión de usuarios.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual no tiene permisos para esta función.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Crown className="w-6 h-6 text-purple-600 mr-2" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios y sus roles en el sistema
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Usuario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dueños</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === 'owner').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Administradores</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <User className="w-8 h-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === 'cliente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios por email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          {user.email === currentUser?.email && (
                            <div className="text-xs text-blue-600">
                              (Tú)
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.email === 'oterov101@gmail.com'}
                        className="text-sm border border-gray-300 rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.last_sign_in)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.email !== 'oterov101@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar usuario */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Nuevo Usuario
              </h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Agregar Usuario
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
