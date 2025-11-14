import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, registro, loginWithGoogle } = useAuth();
  const { showError, showSuccess } = useNotification();
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

  const handleGoogleLogin = async () => {
    setError('');
    setCargando(true);

    try {
      const resultado = await loginWithGoogle();
      if (resultado.success) {
        showSuccess('¡Bienvenido!');
        // Redirigir según el rol
        if (resultado.usuario.role === 'asistente') {
          navigate('/botiquin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(resultado.error || 'Error al iniciar sesión con Google');
        showError(resultado.error || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      setError('Error inesperado. Intenta nuevamente.');
      showError('Error al iniciar sesión con Google');
      console.error('Error en login con Google:', error);
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

        <div className="divider">
          <span>o</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn-google"
          disabled={cargando}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

