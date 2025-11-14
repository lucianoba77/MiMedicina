import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MedProvider } from './context/MedContext';
import { NotificationProvider } from './context/NotificationContext';

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
const RutaProtegida = ({ children, rolesPermitidos = ['paciente', 'asistente'] }) => {
  const { usuarioActual } = useAuth();
  
  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene el rol permitido
  const tieneRolPermitido = rolesPermitidos.includes(usuarioActual.role || 'paciente');
  
  if (!tieneRolPermitido) {
    // Redirigir según el rol
    if (usuarioActual.role === 'asistente') {
      return <Navigate to="/botiquin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <MedProvider>
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
            
            {/* Rutas para pacientes */}
            <Route 
              path="/dashboard" 
              element={
                <RutaProtegida rolesPermitidos={['paciente']}>
                  <DashboardScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/nuevo" 
              element={
                <RutaProtegida rolesPermitidos={['paciente']}>
                  <NuevaMedicinaScreen />
                </RutaProtegida>
              } 
            />
            
            {/* Rutas para ambos roles */}
            <Route 
              path="/botiquin" 
              element={
                <RutaProtegida rolesPermitidos={['paciente', 'asistente']}>
                  <BotiquinScreen />
                </RutaProtegida>
              } 
            />
            
            <Route 
              path="/historial" 
              element={
                <RutaProtegida rolesPermitidos={['paciente', 'asistente']}>
                  <HistorialScreen />
                </RutaProtegida>
              } 
            />
            
            {/* Rutas solo para pacientes */}
            <Route 
              path="/ajustes" 
              element={
                <RutaProtegida rolesPermitidos={['paciente']}>
                  <AjustesScreen />
                </RutaProtegida>
              } 
            />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </MedProvider>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

