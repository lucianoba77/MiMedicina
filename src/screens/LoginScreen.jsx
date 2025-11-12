import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      if (isLogin) {
        const resultado = await login(email, password);
        if (resultado.success) {
          navigate('/dashboard');
        } else {
          setError(resultado.error || 'Credenciales inválidas');
        }
      } else {
        if (!nombre.trim()) {
          setError('El nombre es requerido');
          setCargando(false);
          return;
        }
        const resultado = await registro(email, password, nombre);
        if (resultado.success) {
          navigate('/dashboard');
        } else {
          setError(resultado.error || 'Error al registrar usuario');
        }
      }
    } catch (error) {
      setError('Error inesperado. Intenta nuevamente.');
      console.error('Error en login/registro:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="app-icon">💊</div>
          <h1 className="app-title">MediControl</h1>
          <p className="app-subtitle">Tu asistente personal de medicamentos</p>
        </div>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={cargando}
          >
            {cargando 
              ? (isLogin ? 'Iniciando sesión...' : 'Registrando...') 
              : (isLogin ? 'Iniciar Sesión' : 'Registrarse')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;

