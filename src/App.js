import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import VehicleDetail from './pages/VehicleDetail';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/vehiculo/:id" element={<VehicleDetail />} />
            <Route path="/nosotros" element={<About />} />
                                    <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route
                          path="/perfil"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
