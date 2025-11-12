import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MedProvider } from './context/MedContext';
import { mockMedicamentos } from './data/mockData';

import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import NuevaMedicinaScreen from './screens/NuevaMedicinaScreen';
import BotiquinScreen from './screens/BotiquinScreen';
import HistorialScreen from './screens/HistorialScreen';
import AjustesScreen from './screens/AjustesScreen';

// Componente para proteger rutas
const RutaProtegida = ({ children }) => {
  const { usuarioActual } = useAuth();
  return usuarioActual ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MedProvider medicamentosIniciales={mockMedicamentos}>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            
            <Route 
              path="/dashboard" 
              element={
                <RutaProtegida>
                  <DashboardScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/nuevo" 
              element={
                <RutaProtegida>
                  <NuevaMedicinaScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/botiquin" 
              element={
                <RutaProtegida>
                  <BotiquinScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/historial" 
              element={
                <RutaProtegida>
                  <HistorialScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/ajustes" 
              element={
                <RutaProtegida>
                  <AjustesScreen />
                </RutaProtegida>
              } 
            />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MedProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

