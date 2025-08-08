# Sistema de Autenticación y Roles - Ricars Automóviles

## 📋 Descripción

Este documento explica cómo funciona el sistema de autenticación y roles en Ricars Automóviles, incluyendo la configuración de usuarios, permisos y protección de rutas.

## 👥 Tipos de Usuario

### 1. Usuario (No logueado)
- **Rol**: `usuario`
- **Permisos**:
  - Navegar por el catálogo
  - Ver información básica de vehículos
  - Acceder a páginas públicas (Inicio, Nosotros)
  - Ver filtros y búsquedas

### 2. Cliente (Logueado)
- **Rol**: `cliente`
- **Permisos**:
  - Todas las funcionalidades de usuario
  - Ver detalles completos de vehículos
  - Contactar por WhatsApp/Facebook
  - Guardar favoritos
  - Acceder a funcionalidades que requieren autenticación

### 3. Administrador
- **Rol**: `admin`
- **Permisos**:
  - Todas las funcionalidades de cliente
  - Acceso al panel de administración
  - Gestionar vehículos (crear, editar, eliminar)
  - Ver estadísticas y métricas
  - Subir imágenes a Firebase Storage
  - Gestionar promociones y destacados

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario
```javascript
// src/contexts/AuthContext.js
async function signup(email, password, displayName) {
  // 1. Crear usuario en Firebase Auth
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // 2. Actualizar perfil con nombre
  await updateProfile(result.user, { displayName });
  
  // 3. Crear documento en Firestore con rol 'cliente'
  await setDoc(doc(db, 'users', result.user.uid), {
    email: email,
    displayName: displayName,
    role: 'cliente', // Rol por defecto
    createdAt: new Date(),
    favorites: []
  });
}
```

### 2. Inicio de Sesión
```javascript
async function login(email, password) {
  // Autenticación con Firebase Auth
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // El rol se obtiene automáticamente del documento en Firestore
  const role = await getUserRole(result.user.uid);
  setUserRole(role);
}
```

### 3. Verificación de Rol
```javascript
// Obtener rol del usuario desde Firestore
async function getUserRole(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role || 'cliente';
  }
  return 'cliente';
}
```

## 🛡️ Protección de Rutas

### 1. Rutas Públicas
```javascript
// Rutas que no requieren autenticación
<Route path="/" element={<Home />} />
<Route path="/catalogo" element={<Catalog />} />
<Route path="/nosotros" element={<About />} />
<Route path="/login" element={<Login />} />
<Route path="/registro" element={<Register />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

### 2. Rutas Protegidas (Cliente)
```javascript
// src/components/auth/ProtectedRoute.js
const ProtectedRoute = ({ children }) => {
  const { currentUser, isClient } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isClient()) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

### 3. Rutas de Administrador
```javascript
// src/components/auth/AdminRoute.js
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

## 🔧 Configuración de Roles

### 1. Estructura de Datos en Firestore

#### Colección: `users`
```javascript
{
  "uid_del_usuario": {
    email: "usuario@ejemplo.com",
    displayName: "Nombre del Usuario",
    role: "cliente", // "usuario", "cliente", "admin"
    createdAt: Timestamp,
    favorites: ["vehicle_id_1", "vehicle_id_2"],
    lastLogin: Timestamp
  }
}
```

### 2. Crear Usuario Administrador

#### Método 1: Desde Firebase Console
1. Ve a Authentication > Users
2. Haz clic en "Agregar usuario"
3. Ingresa email y contraseña
4. Ve a Firestore Database
5. Crea documento en colección `users` con ID del UID
6. Agrega campos:
```javascript
{
  email: "admin@ricarsautomotores.com",
  displayName: "Administrador",
  role: "admin",
  createdAt: Timestamp.now(),
  favorites: []
}
```

#### Método 2: Desde la Aplicación
1. Registra un usuario normal
2. Ve a Firebase Console > Firestore
3. Encuentra el documento del usuario
4. Cambia el campo `role` de `cliente` a `admin`

### 3. Verificar Roles en la Aplicación
```javascript
// src/contexts/AuthContext.js
function isAdmin() {
  return userRole === 'admin';
}

function isClient() {
  return userRole === 'cliente' || userRole === 'admin';
}
```

## 🔒 Seguridad y Validación

### 1. Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer y escribir su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Solo admins pueden escribir vehículos
    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. Reglas de Storage
```javascript
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

### 3. Validación en Frontend
```javascript
// Verificar permisos antes de mostrar funcionalidades
const { currentUser, isAdmin, isClient } = useAuth();

// Mostrar botón de contacto solo si está logueado
{currentUser && (
  <button onClick={handleContact}>Contactar</button>
)}

// Mostrar panel admin solo si es admin
{isAdmin() && (
  <Link to="/admin">Panel Admin</Link>
)}
```

## 🔄 Gestión de Estados

### 1. Contexto de Autenticación
```javascript
// src/contexts/AuthContext.js
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('usuario');
  const [loading, setLoading] = useState(true);

  // ... lógica de autenticación

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    isAdmin,
    isClient,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### 2. Hook Personalizado
```javascript
// src/hooks/useAuth.js
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

## 🚨 Manejo de Errores

### 1. Errores de Autenticación
```javascript
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/invalid-credential': 'Credenciales inválidas'
  };
  return errorMessages[errorCode] || 'Error desconocido';
}
```

### 2. Errores de Permisos
```javascript
// Componente para mostrar error de permisos
const PermissionDenied = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Acceso Denegado
    </h2>
    <p className="text-gray-600 mb-6">
      No tienes permisos para acceder a esta página.
    </p>
    <Link to="/" className="btn-primary">
      Volver al Inicio
    </Link>
  </div>
);
```

## 🔧 Configuración Avanzada

### 1. Persistencia de Sesión
```javascript
// src/firebase/config.js
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Configurar persistencia local
setPersistence(auth, browserLocalPersistence);
```

### 2. Timeout de Sesión
```javascript
// Verificar sesión cada 5 minutos
useEffect(() => {
  const interval = setInterval(() => {
    auth.currentUser?.reload();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

### 3. Logout Automático
```javascript
// Logout después de inactividad
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

useEffect(() => {
  let inactivityTimer;

  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer);
  });

  resetTimer();

  return () => {
    clearTimeout(inactivityTimer);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
  };
}, [logout]);
```

## 📊 Monitoreo y Logs

### 1. Logs de Autenticación
```javascript
// Registrar eventos de autenticación
const logAuthEvent = (event, userId, details = {}) => {
  console.log(`Auth Event: ${event}`, { userId, ...details });
  // Aquí podrías enviar a un servicio de analytics
};
```

### 2. Métricas de Usuario
```javascript
// Actualizar último login
const updateLastLogin = async (uid) => {
  await updateDoc(doc(db, 'users', uid), {
    lastLogin: new Date()
  });
};
```

## 🔄 Actualización de Roles

### 1. Cambiar Rol de Usuario
```javascript
// Función para cambiar rol (solo admins)
const changeUserRole = async (userId, newRole) => {
  if (!isAdmin()) {
    throw new Error('Solo los administradores pueden cambiar roles');
  }

  await updateDoc(doc(db, 'users', userId), {
    role: newRole,
    updatedAt: new Date()
  });
};
```

### 2. Verificar Permisos en Tiempo Real
```javascript
// Escuchar cambios en el documento del usuario
useEffect(() => {
  if (!currentUser) return;

  const unsubscribe = onSnapshot(
    doc(db, 'users', currentUser.uid),
    (doc) => {
      if (doc.exists()) {
        const newRole = doc.data().role;
        setUserRole(newRole);
      }
    }
  );

  return unsubscribe;
}, [currentUser]);
```

## 🐛 Solución de Problemas

### Error: "User not found"
- **Causa**: Usuario existe en Auth pero no en Firestore
- **Solución**: Crear documento en Firestore manualmente

### Error: "Insufficient permissions"
- **Causa**: Reglas de Firestore muy restrictivas
- **Solución**: Verificar y ajustar reglas de seguridad

### Error: "Role not defined"
- **Causa**: Campo `role` faltante en documento de usuario
- **Solución**: Agregar campo `role` con valor por defecto

### Error: "Session expired"
- **Causa**: Token de autenticación expirado
- **Solución**: Implementar refresh token o redirigir a login

## 📞 Soporte

Para problemas relacionados con autenticación:

1. **Verificar logs**: Revisar console del navegador
2. **Verificar Firebase Console**: Authentication > Users
3. **Verificar Firestore**: Colección `users`
4. **Contactar soporte**: soporte@ricarsautomotores.com

---

**¡Sistema de autenticación configurado correctamente!**
