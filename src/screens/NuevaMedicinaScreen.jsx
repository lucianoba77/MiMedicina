import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { coloresMedicamento } from '../constants/colores';
import { esUsuarioPremium, obtenerMensajeLimite } from '../utils/subscription';
import './NuevaMedicinaScreen.css';

const NuevaMedicinaScreen = () => {
  const navigate = useNavigate();
  const { agregarMedicina, medicamentos } = useMed();
  const { usuarioActual } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    nombre: '',
    presentacion: 'comprimidos',
    tomasDiarias: 1,
    primeraToma: '',
    afeccion: '',
    stockInicial: 30,
    color: '#FFFFFF',
    diasTratamiento: 30,
    esCronico: false,
    alarmasActivas: true,
    detalles: ''
  });

  const [colorSeleccionado, setColorSeleccionado] = useState('#FFFFFF');

  /**
   * Maneja los cambios en los campos del formulario
   * Actualiza el estado del formulario según el tipo de campo (text, checkbox, select, etc.)
   */
  const cambioCampoFormulario = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Maneja la selección de color para el medicamento
   * Actualiza tanto el estado local del color seleccionado como el estado del formulario
   */
  const seleccionColor = (color) => {
    setColorSeleccionado(color.valor);
    setFormData(prev => ({ ...prev, color: color.valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tipoSuscripcion = esUsuarioPremium(usuarioActual) ? 'premium' : 'gratis';
    const resultado = await agregarMedicina(formData, tipoSuscripcion);
    
    if (resultado.success) {
      showSuccess(`${formData.nombre} ha sido agregado correctamente`);
      navigate('/botiquin');
    } else {
      showError(resultado.error || 'Error al agregar medicamento');
    }
  };

  // Verificar si puede agregar más medicamentos
  const esPremium = esUsuarioPremium(usuarioActual);
  const puedeAgregar = esPremium || medicamentos.length < 5;
  const mensajeLimite = !esPremium ? obtenerMensajeLimite(medicamentos.length) : '';

  const presentaciones = ['comprimidos', 'inyeccion', 'jarabe', 'gotas', 'crema', 'supositorio'];

  return (
    <div className="nueva-medicina-screen">
      <div className="nm-header">
        <button className="btn-back" onClick={() => navigate('/botiquin')}>🏠</button>
        <h1>Nueva Medicina</h1>
      </div>

      <div className="nm-container">
        {!puedeAgregar && (
          <div className="limit-warning">
            <p>⚠️ {mensajeLimite}</p>
            <button 
              className="btn-premium"
              onClick={() => navigate('/ajustes')}
            >
              Suscribirse a Premium
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="nm-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del medicamento *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={cambioCampoFormulario}
              placeholder="Ej: Paracetamol"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="presentacion">Presentación</label>
            <select
              id="presentacion"
              name="presentacion"
              value={formData.presentacion}
              onChange={cambioCampoFormulario}
            >
              {presentaciones.map(presentacion => (
                <option key={presentacion} value={presentacion}>{presentacion}</option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="tomasDiarias">Tomas diarias</label>
              <input
                type="number"
                id="tomasDiarias"
                name="tomasDiarias"
                value={formData.tomasDiarias}
                onChange={cambioCampoFormulario}
                min="1"
                max="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="primeraToma">Primera toma</label>
              <input
                type="time"
                id="primeraToma"
                name="primeraToma"
                value={formData.primeraToma}
                onChange={cambioCampoFormulario}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="afeccion">Condición que trata</label>
            <input
              type="text"
              id="afeccion"
              name="afeccion"
              value={formData.afeccion}
              onChange={cambioCampoFormulario}
              placeholder="Ej: Dolor de cabeza, Hipertensión"
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="stockInicial">Stock inicial</label>
              <input
                type="number"
                id="stockInicial"
                name="stockInicial"
                value={formData.stockInicial}
                onChange={cambioCampoFormulario}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="diasTratamiento">Días de tratamiento</label>
              <input
                type="number"
                id="diasTratamiento"
                name="diasTratamiento"
                value={formData.diasTratamiento}
                onChange={cambioCampoFormulario}
                min="1"
                required
              />
              <button
                type="button"
                className="btn-cronico"
                onClick={() => setFormData(prev => ({ ...prev, esCronico: !prev.esCronico }))}
              >
                {formData.esCronico ? 'Crónico ✓' : 'Crónico'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Color del medicamento</label>
            <p className="color-description">
              Selecciona el color que más se parezca a tu medicamento o envase
            </p>
            <div className="color-grid">
              {coloresMedicamento.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${colorSeleccionado === color.valor ? 'selected' : ''}`}
                  style={{ backgroundColor: color.valor }}
                  onClick={() => seleccionColor(color)}
                >
                  {colorSeleccionado === color.valor && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="toggle-group">
              <label htmlFor="alarmasActivas">Activar alarmas</label>
              <input
                type="checkbox"
                id="alarmasActivas"
                name="alarmasActivas"
                checked={formData.alarmasActivas}
                onChange={cambioCampoFormulario}
                className="checkbox-toggle"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="detalles">Detalles adicionales</label>
            <textarea
              id="detalles"
              name="detalles"
              value={formData.detalles}
              onChange={cambioCampoFormulario}
              rows="4"
              placeholder="Instrucciones especiales, efectos secundarios a vigilar, etc."
            />
          </div>

          <button type="submit" className="btn-submit">
            + Agregar Medicamento
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevaMedicinaScreen;

