import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { guardarTokenGoogle } from '../services/calendarService';
import { obtenerTokenDeURL } from '../utils/googleAuthHelper';

/**
 * Componente que maneja el callback de OAuth de Google Calendar
 * Se ejecuta cuando Google redirige de vuelta después de la autorización
 */
const GoogleCalendarCallback = () => {
  const { usuarioActual } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const procesarCallback = async () => {
      try {
        // Obtener el token de la URL
        const tokenData = obtenerTokenDeURL();
        
        if (!tokenData) {
          showError('No se pudo obtener el token de Google. Intenta nuevamente.');
          navigate('/ajustes');
          return;
        }

        if (!usuarioActual) {
          showError('Debes estar autenticado. Redirigiendo al login...');
          navigate('/login');
          return;
        }

        const resultado = await guardarTokenGoogle(usuarioActual.id, tokenData);
        
        if (resultado.success) {
          window.history.replaceState({}, document.title, '/ajustes');
          navigate('/ajustes', { replace: true });
          setTimeout(() => {
            showSuccess('Google Calendar conectado exitosamente');
          }, 500);
        } else {
          throw new Error(resultado.error || 'Error al guardar token');
        }
      } catch (error) {
        console.error('Error en callback OAuth:', error);
        showError('Error al conectar Google Calendar: ' + error.message);
        navigate('/ajustes');
      }
    };

    procesarCallback();
  }, [usuarioActual, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <p>Procesando conexión con Google Calendar...</p>
    </div>
  );
};

export default GoogleCalendarCallback;

