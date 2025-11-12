import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { guardarTokenGoogle } from '../services/calendarService';
import { obtenerTokenDeURL } from '../utils/googleAuthHelper';

/**
 * Componente que maneja el callback de OAuth de Google Calendar
 * Se ejecuta cuando Google redirige de vuelta después de la autorización
 */
const GoogleCalendarCallback = () => {
  const { usuarioActual } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const procesarCallback = async () => {
      try {
        // Obtener el token de la URL
        const tokenData = obtenerTokenDeURL();
        
        console.log('Callback OAuth - Token data:', tokenData ? 'Encontrado' : 'No encontrado');
        console.log('Callback OAuth - Usuario actual:', usuarioActual ? usuarioActual.id : 'No autenticado');

        if (!tokenData) {
          console.error('No se encontró token en la URL');
          alert('Error: No se pudo obtener el token de Google. Intenta nuevamente.');
          navigate('/ajustes');
          return;
        }

        if (!usuarioActual) {
          console.error('Usuario no autenticado en callback');
          alert('Error: Debes estar autenticado. Redirigiendo al login...');
          navigate('/login');
          return;
        }

        // Guardar el token
        console.log('Guardando token en callback...');
        const resultado = await guardarTokenGoogle(usuarioActual.id, tokenData);
        
        if (resultado.success) {
          console.log('Token guardado exitosamente');
          // Limpiar la URL antes de redirigir
          window.history.replaceState({}, document.title, '/ajustes');
          navigate('/ajustes', { replace: true });
          // Mostrar mensaje de éxito después de un pequeño delay para que la navegación se complete
          setTimeout(() => {
            alert('✅ Google Calendar conectado exitosamente');
          }, 500);
        } else {
          throw new Error(resultado.error || 'Error al guardar token');
        }
      } catch (error) {
        console.error('Error en callback OAuth:', error);
        alert('Error al conectar Google Calendar: ' + error.message);
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

