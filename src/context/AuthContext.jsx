import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  iniciarSesion as iniciarSesionFirebase,
  registrarUsuario as registrarUsuarioFirebase,
  cerrarSesion as cerrarSesionFirebase,
  observarEstadoAuth,
  iniciarSesionConGoogle as iniciarSesionConGoogleFirebase
} from '../services/authService';
import { esAsistenteDe } from '../services/asistentesService';

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

  const loginWithGoogle = async () => {
    setCargando(true);
    try {
      const resultado = await iniciarSesionConGoogleFirebase();
      
      if (resultado.success) {
        // Verificar si el usuario es asistente
        const asistenteResult = await esAsistenteDe(resultado.usuario.email);
        
        if (asistenteResult.success && asistenteResult.esAsistente) {
          // Si es asistente, actualizar el usuario con el rol y el pacienteId
          resultado.usuario.role = 'asistente';
          resultado.usuario.pacienteId = asistenteResult.pacienteId;
          resultado.usuario.paciente = asistenteResult.paciente;
        }
      }
      
      setCargando(false);
      return resultado;
    } catch (error) {
      setCargando(false);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión con Google'
      };
    }
  };

  const logout = async () => {
    setCargando(true);
    await cerrarSesionFirebase();
    setUsuarioActual(null);
    setCargando(false);
  };

  // Verificar si el usuario es asistente al cargar
  useEffect(() => {
    const verificarRolAsistente = async () => {
      if (usuarioActual && usuarioActual.email && !usuarioActual.role) {
        const asistenteResult = await esAsistenteDe(usuarioActual.email);
        
        if (asistenteResult.success && asistenteResult.esAsistente) {
          setUsuarioActual(prev => ({
            ...prev,
            role: 'asistente',
            pacienteId: asistenteResult.pacienteId,
            paciente: asistenteResult.paciente
          }));
        } else if (!usuarioActual.role) {
          // Si no es asistente y no tiene role, es paciente
          setUsuarioActual(prev => ({
            ...prev,
            role: 'paciente'
          }));
        }
      }
    };

    if (usuarioActual) {
      verificarRolAsistente();
    }
  }, [usuarioActual]);

  return (
    <AuthContext.Provider value={{ 
      usuarioActual, 
      login, 
      registro,
      loginWithGoogle,
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

