/**
 * Utilidades para manejar la autenticación con Google Calendar
 * 
 * NOTA: Para producción, el intercambio de tokens debe hacerse en un backend
 * por seguridad (el Client Secret no debe estar en el frontend)
 */

/**
 * Abre una ventana para autorizar acceso a Google Calendar
 * Usa el flujo OAuth 2.0 implícito
 */
export const autorizarGoogleCalendar = (clientId) => {
  const redirectUri = window.location.origin + '/auth/google/callback';
  const scope = 'https://www.googleapis.com/auth/calendar.events';
  const responseType = 'token';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${responseType}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `include_granted_scopes=true`;

  window.location.href = authUrl;
};

/**
 * Obtiene el access_token de la URL después de la redirección OAuth
 */
export const obtenerTokenDeURL = () => {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const tokenType = params.get('token_type');

  if (accessToken) {
    return {
      access_token: accessToken,
      expires_in: parseInt(expiresIn) || 3600,
      token_type: tokenType || 'Bearer',
      fechaObtencion: new Date().toISOString()
    };
  }

  return null;
};

/**
 * Verifica si el token está expirado
 */
export const esTokenExpirado = (tokenData) => {
  if (!tokenData || !tokenData.fechaObtencion || !tokenData.expires_in) {
    return true;
  }

  const fechaObtencion = new Date(tokenData.fechaObtencion);
  const fechaExpiracion = new Date(fechaObtencion.getTime() + (tokenData.expires_in * 1000));
  const ahora = new Date();

  return ahora >= fechaExpiracion;
};

/**
 * Renueva el token si es necesario (requiere backend en producción)
 */
export const renovarToken = async (refreshToken) => {
  // Esta función debe implementarse en el backend
  // por seguridad (requiere Client Secret)
  throw new Error('Renovación de token debe hacerse en el backend');
};

