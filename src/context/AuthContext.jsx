import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  iniciarSesion as iniciarSesionFirebase,
  registrarUsuario as registrarUsuarioFirebase,
  cerrarSesion as cerrarSesionFirebase,
  observarEstadoAuth
} from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = observarEstadoAuth((usuario) => {
      setUsuarioActual(usuario);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setCargando(true);
    const resultado = await iniciarSesionFirebase(email, password);
    setCargando(false);
    return resultado;
  };

  const registro = async (email, password, nombre) => {
    setCargando(true);
    const resultado = await registrarUsuarioFirebase(email, password, nombre);
    setCargando(false);
    return resultado;
  };

  const logout = async () => {
    setCargando(true);
    await cerrarSesionFirebase();
    setUsuarioActual(null);
    setCargando(false);
  };

  return (
    <AuthContext.Provider value={{ 
      usuarioActual, 
      login, 
      registro,
      logout, 
      cargando 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

