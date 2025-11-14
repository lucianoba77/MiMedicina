import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { agregarAsistente, obtenerAsistentes, eliminarAsistente } from '../services/asistentesService';
import './GestionarAsistentes.css';

const GestionarAsistentes = () => {
  const { usuarioActual } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotification();
  const [asistentes, setAsistentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nombre: ''
  });

  useEffect(() => {
    if (usuarioActual && usuarioActual.role === 'paciente') {
      cargarAsistentes();
    }
  }, [usuarioActual]);

  const cargarAsistentes = async () => {
    if (!usuarioActual) return;

    setCargando(true);
    const resultado = await obtenerAsistentes(usuarioActual.id);
    if (resultado.success) {
      setAsistentes(resultado.asistentes);
    } else {
      showError(resultado.error || 'Error al cargar asistentes');
    }
    setCargando(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.nombre.trim()) {
      showError('Por favor completa todos los campos');
      return;
    }

    setCargando(true);
    const resultado = await agregarAsistente(
      usuarioActual.id,
      formData.email.trim(),
      formData.nombre.trim()
    );

    if (resultado.success) {
      showSuccess(`Asistente ${formData.nombre} agregado exitosamente`);
      setFormData({ email: '', nombre: '' });
      setMostrarFormulario(false);
      cargarAsistentes();
    } else {
      showError(resultado.error || 'Error al agregar asistente');
    }
    setCargando(false);
  };

  const handleEliminar = async (asistenteId, nombreAsistente) => {
    const confirmado = await showConfirm({
      title: 'Eliminar asistente',
      message: `¿Estás seguro de que deseas eliminar a "${nombreAsistente}"? Ya no podrá ver tu información.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmado) {
      setCargando(true);
      const resultado = await eliminarAsistente(asistenteId);
      
      if (resultado.success) {
        showSuccess('Asistente eliminado exitosamente');
        cargarAsistentes();
      } else {
        showError(resultado.error || 'Error al eliminar asistente');
      }
      setCargando(false);
    }
  };

  if (!usuarioActual || usuarioActual.role !== 'paciente') {
    return null;
  }

  return (
    <div className="gestionar-asistentes">
      <div className="asistentes-header">
        <div>
          <h3>Gestionar Asistentes</h3>
          <p>Agrega asistentes que puedan ver tu botiquín e historial de adherencia</p>
        </div>
        <button
          className="btn-agregar-asistente"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          disabled={cargando}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar Asistente'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-asistente">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre del asistente</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: María García"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email del asistente</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                required
              />
              <p className="help-text">
                El asistente podrá iniciar sesión con este email (preferiblemente con Google)
              </p>
            </div>

            <button type="submit" className="btn-enviar" disabled={cargando}>
              {cargando ? 'Agregando...' : 'Agregar Asistente'}
            </button>
          </form>
        </div>
      )}

      <div className="lista-asistentes">
        {cargando && asistentes.length === 0 ? (
          <p className="loading-text">Cargando asistentes...</p>
        ) : asistentes.length === 0 ? (
          <div className="empty-state">
            <p>No tienes asistentes agregados</p>
            <p className="empty-hint">Agrega un asistente para que pueda ver tu botiquín e historial</p>
          </div>
        ) : (
          <div className="asistentes-grid">
            {asistentes.map(asistente => (
              <div key={asistente.id} className="asistente-card">
                <div className="asistente-info">
                  <div className="asistente-avatar">
                    {asistente.nombreAsistente.charAt(0).toUpperCase()}
                  </div>
                  <div className="asistente-details">
                    <h4>{asistente.nombreAsistente}</h4>
                    <p className="asistente-email">{asistente.emailAsistente}</p>
                    <p className="asistente-fecha">
                      Agregado el {new Date(asistente.fechaAgregado).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  className="btn-eliminar-asistente"
                  onClick={() => handleEliminar(asistente.id, asistente.nombreAsistente)}
                  disabled={cargando}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-box">
        <h4>ℹ️ Información importante</h4>
        <ul>
          <li>Los asistentes solo pueden ver tu botiquín e historial de adherencia</li>
          <li>No pueden ver tu dashboard diario ni ajustes</li>
          <li>No pueden agregar, editar o eliminar medicamentos</li>
          <li>Los asistentes deben iniciar sesión con el email que proporcionaste</li>
          <li>Recomendamos que usen login con Google para mayor seguridad</li>
        </ul>
      </div>
    </div>
  );
};

export default GestionarAsistentes;

