import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainMenu from '../components/MainMenu';
import './AjustesScreen.css';

const AjustesScreen = () => {
  const navigate = useNavigate();
  const { usuarioActual } = useAuth();
  const [formData, setFormData] = useState({
    nombre: usuarioActual?.nombre || 'lucianoba77',
    email: usuarioActual?.email || 'lucianoba77@hotmail.com',
    notificacionesActivas: true,
    tonoAlarma: 'por-defecto',
    repeticionesAlarma: 3,
    diasAntesStock: 7
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="ajustes-screen">
      <div className="ajustes-header">
        <button className="btn-home" onClick={() => navigate('/dashboard')}>🏠</button>
        <h1>Ajustes</h1>
      </div>

      <div className="ajustes-content">
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">👤</div>
            <h2 className="section-title">Información personal</h2>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🔔</div>
            <h2 className="section-title">Alarmas</h2>
          </div>

          <div className="toggle-group">
            <label htmlFor="notificacionesActivas">Activar notificaciones</label>
            <label className="switch">
              <input
                type="checkbox"
                id="notificacionesActivas"
                name="notificacionesActivas"
                checked={formData.notificacionesActivas}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="tonoAlarma">Tono de alarma</label>
            <select
              id="tonoAlarma"
              name="tonoAlarma"
              value={formData.tonoAlarma}
              onChange={handleChange}
            >
              <option value="por-defecto">Por defecto</option>
              <option value="suave">Suave</option>
              <option value="fuerte">Fuerte</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="repeticionesAlarma">Repeticiones de alarma</label>
            <input
              type="number"
              id="repeticionesAlarma"
              name="repeticionesAlarma"
              value={formData.repeticionesAlarma}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">⚠️</div>
            <h2 className="section-title">Alertas de stock</h2>
          </div>

          <div className="form-group">
            <label htmlFor="diasAntesStock">Días antes de aviso por stock bajo</label>
            <input
              type="number"
              id="diasAntesStock"
              name="diasAntesStock"
              value={formData.diasAntesStock}
              onChange={handleChange}
              min="1"
              max="30"
            />
          </div>

          <p className="info-text">
            Recibirás una notificación cuando el stock sea suficiente para {formData.diasAntesStock} días o menos
          </p>
        </div>
      </div>

      <MainMenu />
    </div>
  );
};

export default AjustesScreen;

