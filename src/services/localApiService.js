// Servicio de API Local con datos simulados (sin JSON Server)
const sampleData = {
  "vehicles": [
    {
      "id": "1",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2023,
      "kilometers": 15000,
      "price": 25000,
      "priceARS": 25000000,
      "condition": "new",
      "transmission": "automatic",
      "fuelType": "gasoline",
      "color": "Blanco",
      "type": "sedan",
      "location": "Buenos Aires",
      "engine": "2.0L",
      "power": "150hp",
      "features": ["Aire acondicionado", "Bluetooth", "Cámara de reversa"],
      "images": [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
      ],
      "isFeatured": true,
      "isPromotion": false,
      "views": 45,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "2",
      "brand": "Honda",
      "model": "Civic",
      "year": 2022,
      "kilometers": 25000,
      "price": 22000,
      "priceARS": 22000000,
      "condition": "used",
      "transmission": "automatic",
      "fuelType": "gasoline",
      "color": "Negro",
      "type": "sedan",
      "location": "Buenos Aires",
      "engine": "1.8L",
      "power": "140hp",
      "features": ["Aire acondicionado", "Bluetooth", "ABS", "Airbag"],
      "images": [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"
      ],
      "isFeatured": false,
      "isPromotion": true,
      "views": 32,
      "createdAt": "2024-01-10T14:20:00Z",
      "updatedAt": "2024-01-10T14:20:00Z"
    },
    {
      "id": "3",
      "brand": "Ford",
      "model": "Ranger",
      "year": 2023,
      "kilometers": 8000,
      "price": 35000,
      "priceARS": 35000000,
      "condition": "new",
      "transmission": "automatic",
      "fuelType": "diesel",
      "color": "Gris",
      "type": "pickup",
      "location": "Buenos Aires",
      "engine": "3.2L",
      "power": "200hp",
      "features": ["Aire acondicionado", "Bluetooth", "Tracción 4x4", "Cámara de reversa"],
      "images": [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"
      ],
      "isFeatured": true,
      "isPromotion": false,
      "views": 78,
      "createdAt": "2024-01-20T09:15:00Z",
      "updatedAt": "2024-01-20T09:15:00Z"
    }
  ],
  "users": [
    {
      "id": "1",
      "email": "admin@ricars.com",
      "displayName": "Administrador",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "email": "cliente@example.com",
      "displayName": "Cliente Ejemplo",
      "role": "cliente",
      "createdAt": "2024-01-05T12:00:00Z"
    }
  ],
  "statistics": {
    "totalVehicles": 3,
    "totalViews": 155,
    "featuredVehicles": 2,
    "promotionVehicles": 1
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
