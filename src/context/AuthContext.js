import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);

  const login = (email, password, usuarios) => {
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email && usuario.password === password);
    if (usuarioEncontrado) {
      setUsuarioActual(usuarioEncontrado);
      return { success: true, usuario: usuarioEncontrado };
    }
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUsuarioActual(null);
  };

  return (
    <AuthContext.Provider value={{ usuarioActual, login, logout }}>
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

