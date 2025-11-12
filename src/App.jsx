import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import VerificarFirebase from './components/VerificarFirebase';
import GoogleCalendarCallback from './components/GoogleCalendarCallback';

// Componente para proteger rutas
const RutaProtegida = ({ children }) => {
  const { usuarioActual } = useAuth();
  return usuarioActual ? children : <Navigate to="/login" replace />;
};

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <MedProvider medicamentosIniciales={mockMedicamentos}>
            <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/verificar-firebase" element={<VerificarFirebase />} />
            <Route 
              path="/auth/google/callback" 
              element={
                <RutaProtegida>
                  <GoogleCalendarCallback />
                </RutaProtegida>
              } 
            />
            
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
    </GoogleOAuthProvider>
  );
}

export default App;

