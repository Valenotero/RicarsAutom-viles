// Servicio de API Local sin datos simulados
const sampleData = {
  "vehicles": [],
  "users": [],
  "statistics": {
    "totalVehicles": 0,
    "totalViews": 0,
    "featuredVehicles": 0,
    "promotionVehicles": 0
  }
};

// Simular base de datos en localStorage
const initializeLocalDB = () => {
  if (!localStorage.getItem('ricars_db')) {
    localStorage.setItem('ricars_db', JSON.stringify(sampleData));
  }
};

// Obtener datos de localStorage
const getLocalData = () => {
  initializeLocalDB();
  return JSON.parse(localStorage.getItem('ricars_db'));
};

// Guardar datos en localStorage
const saveLocalData = (data) => {
  localStorage.setItem('ricars_db', JSON.stringify(data));
};

// Función helper para simular delay de red
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 100));

// Servicio de Vehículos
export const vehicleService = {
  // Obtener todos los vehículos con filtros
  async getVehicles(filters = {}) {
    await simulateNetworkDelay();
    const data = getLocalData();
    let vehicles = data.vehicles;

    // Aplicar filtros
    if (filters.brand) {
      vehicles = vehicles.filter(v => v.brand === filters.brand);
    }
    if (filters.type) {
      vehicles = vehicles.filter(v => v.type === filters.type);
    }
    if (filters.condition) {
      vehicles = vehicles.filter(v => v.condition === filters.condition);
    }
    if (filters.minPrice) {
      vehicles = vehicles.filter(v => v.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      vehicles = vehicles.filter(v => v.price <= filters.maxPrice);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      vehicles = vehicles.filter(v => 
        v.brand.toLowerCase().includes(searchTerm) ||
        v.model.toLowerCase().includes(searchTerm)
      );
    }

    return vehicles;
  },

  // Obtener vehículo por ID
  async getVehicleById(id) {
    await simulateNetworkDelay();
    const data = getLocalData();
    const vehicle = data.vehicles.find(v => v.id === id);
    
    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    // Incrementar vistas
    await this.incrementViews(id);
    
    return vehicle;
  },

  // Crear nuevo vehículo
  async createVehicle(vehicleData) {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    const newVehicle = {
      ...vehicleData,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.vehicles.push(newVehicle);
    saveLocalData(data);

    return newVehicle;
  },

  // Actualizar vehículo
  async updateVehicle(id, vehicleData) {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    const vehicleIndex = data.vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) {
      throw new Error('Vehículo no encontrado');
    }

    const updatedVehicle = {
      ...data.vehicles[vehicleIndex],
      ...vehicleData,
      updatedAt: new Date().toISOString(),
    };

    data.vehicles[vehicleIndex] = updatedVehicle;
    saveLocalData(data);

    return updatedVehicle;
  },

  // Eliminar vehículo
  async deleteVehicle(id) {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    const vehicleIndex = data.vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) {
      throw new Error('Vehículo no encontrado');
    }

    data.vehicles.splice(vehicleIndex, 1);
    saveLocalData(data);

    return { success: true };
  },

  // Incrementar vistas
  async incrementViews(id) {
    const data = getLocalData();
    const vehicleIndex = data.vehicles.findIndex(v => v.id === id);
    
    if (vehicleIndex !== -1) {
      data.vehicles[vehicleIndex].views = (data.vehicles[vehicleIndex].views || 0) + 1;
      saveLocalData(data);
    }
  },

  // Obtener vehículos destacados
  async getFeaturedVehicles() {
    await simulateNetworkDelay();
    const data = getLocalData();
    return data.vehicles.filter(v => v.isFeatured);
  },

  // Obtener vehículos en promoción
  async getPromotionVehicles() {
    await simulateNetworkDelay();
    const data = getLocalData();
    return data.vehicles.filter(v => v.isPromotion);
  },

  // Obtener vehículos similares
  async getSimilarVehicles(currentVehicle, limit = 3) {
    await simulateNetworkDelay();
    const data = getLocalData();
    const { brand, type, price } = currentVehicle;
    
    return data.vehicles
      .filter(v => v.id !== currentVehicle.id)
      .filter(v => v.brand === brand || v.type === type)
      .sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price))
      .slice(0, limit);
  },
};

// Servicio de Usuarios
export const userService = {
  // Obtener usuario por email
  async getUserByEmail(email) {
    await simulateNetworkDelay();
    const data = getLocalData();
    return data.users.find(user => user.email === email);
  },

  // Crear nuevo usuario
  async createUser(userData) {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveLocalData(data);

    return newUser;
  },

  // Actualizar usuario
  async updateUser(id, userData) {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    const userIndex = data.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    data.users[userIndex] = { ...data.users[userIndex], ...userData };
    saveLocalData(data);

    return data.users[userIndex];
  },
};

// Servicio de Estadísticas
export const statisticsService = {
  // Obtener estadísticas generales
  async getStatistics() {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    return {
      totalVehicles: data.vehicles.length,
      totalViews: data.vehicles.reduce((sum, v) => sum + (v.views || 0), 0),
      featuredVehicles: data.vehicles.filter(v => v.isFeatured).length,
      promotionVehicles: data.vehicles.filter(v => v.isPromotion).length,
    };
  },

  // Obtener vehículos más visitados
  async getMostViewedVehicles(limit = 5) {
    await simulateNetworkDelay();
    const data = getLocalData();
    return data.vehicles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },
};

// Servicio de Autenticación Simulado
export const authService = {
  // Login simulado
  async login(email, password) {
    await simulateNetworkDelay();
    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // En un entorno real, verificarías la contraseña
    // Por ahora, simulamos que cualquier contraseña es válida
    return {
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      userRole: user.role,
    };
  },

  // Registro simulado
  async register(userData) {
    await simulateNetworkDelay();
    const existingUser = await userService.getUserByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const newUser = await userService.createUser({
      ...userData,
      role: 'cliente', // Rol por defecto
    });

    return {
      user: {
        uid: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
      },
      userRole: newUser.role,
    };
  },

  // Obtener rol de usuario
  async getUserRole(userId) {
    await simulateNetworkDelay();
    const data = getLocalData();
    const user = data.users.find(u => u.id === userId);
    return user?.role || 'usuario';
  },
};

export default {
  vehicleService,
  userService,
  statisticsService,
  authService,
};
