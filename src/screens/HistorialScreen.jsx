import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import MainMenu from '../components/MainMenu';
import { 
  calcularAdherencia, 
  calcularAdherenciaPromedio, 
  obtenerEstadoAdherencia,
  calcularTomasSemana,
  calcularTomasMensuales
} from '../utils/adherenciaUtils';
import './HistorialScreen.css';

const HistorialScreen = () => {
  const navigate = useNavigate();
  const { medicamentos } = useMed();
  const { usuarioActual } = useAuth();

  const totalMedicamentos = medicamentos.length;
  const activos = medicamentos.filter(medicamento => medicamento.activo !== false).length;
  const completados = medicamentos.filter(medicamento => medicamento.stockActual === 0 || medicamento.activo === false).length;
  const adherenciaPromedio = calcularAdherenciaPromedio(medicamentos);
  const estadoAdherencia = obtenerEstadoAdherencia(adherenciaPromedio);
  const esAsistente = usuarioActual?.role === 'asistente';

  // Redirigir según el rol al hacer clic en home
  const handleHomeClick = () => {
    if (esAsistente) {
      navigate('/botiquin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="historial-screen">
      <div className="historial-header">
        <button className="btn-home" onClick={handleHomeClick}>🏠</button>
        <h1>Historial{esAsistente && ' del Paciente'}</h1>
      </div>

      <div className="historial-content">
        {/* Tarjeta de adherencia promedio */}
        <div className="adherencia-promedio-card" style={{ borderLeftColor: estadoAdherencia.color }}>
          <div className="adherencia-promedio-header">
            <div className="adherencia-icon">{estadoAdherencia.icono}</div>
            <div>
              <h2>Adherencia Promedio</h2>
              <p className="adherencia-mensaje">{estadoAdherencia.mensaje}</p>
            </div>
          </div>
          <div className="adherencia-porcentaje-grande" style={{ color: estadoAdherencia.color }}>
            {adherenciaPromedio}%
          </div>
          <div className="adherencia-bar-large">
            <div 
              className="adherencia-bar-fill" 
              style={{ 
                width: `${adherenciaPromedio}%`,
                backgroundColor: estadoAdherencia.color
              }}
            />
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
              💊
            </div>
            <div className="stat-number">{totalMedicamentos}</div>
            <div className="stat-label">Total medicamentos</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
              ✓
            </div>
            <div className="stat-number">{activos}</div>
            <div className="stat-label">Activos</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#F3E5F5' }}>
              📈
            </div>
            <div className="stat-number">{completados}</div>
            <div className="stat-label">Completados</div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">📈</div>
            <h2 className="section-title">Adherencia por medicamento</h2>
          </div>
          
          <div className="adherencia-list">
            {medicamentos.filter(med => med.activo !== false).length === 0 ? (
              <p className="empty-message">No hay medicamentos activos</p>
            ) : (
              medicamentos
                .filter(med => med.activo !== false)
                .map(medicamento => {
                  const adherencia = calcularAdherencia(medicamento);
                  const estado = obtenerEstadoAdherencia(adherencia);
                  const tomasMensuales = calcularTomasMensuales(medicamento);
                  
                  return (
                    <div key={medicamento.id} className="adherencia-item">
                      <div className="adherencia-item-header">
                        <span className="adherencia-nombre">{medicamento.nombre}</span>
                        <span className="adherencia-porcentaje" style={{ color: estado.color }}>
                          {adherencia}%
                        </span>
                      </div>
                      <div className="adherencia-bar-container">
                        <div 
                          className="adherencia-bar"
                          style={{ 
                            width: `${adherencia}%`,
                            backgroundColor: estado.color
                          }}
                        />
                      </div>
                      <div className="adherencia-stats">
                        <span className="stat-label">Tomas: {tomasMensuales.realizadas}/{tomasMensuales.esperadas}</span>
                        <span className="stat-label">{estado.mensaje}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {medicamentos.filter(med => med.activo !== false).length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">📅</div>
              <h2 className="section-title">Resumen semanal</h2>
            </div>
            
            <div className="weekly-summary">
              {medicamentos
                .filter(med => med.activo !== false)
                .slice(0, 1) // Mostrar solo el primer medicamento activo
                .map(medicamento => {
                  const tomasSemana = calcularTomasSemana(medicamento);
                  const tomasDiarias = medicamento.tomasDiarias || 1;
                  
                  return (
                    <div key={medicamento.id} className="medicamento-semana">
                      <h4 className="medicamento-semana-nombre">{medicamento.nombre}</h4>
                      <div className="days-row">
                        {tomasSemana.map((dia, index) => {
                          const cumplido = dia.tomas >= tomasDiarias;
                          const parcial = dia.tomas > 0 && dia.tomas < tomasDiarias;
                          
                          return (
                            <div key={index} className="day-cell">
                              <div className="day-letter">{dia.dia}</div>
                              <div className={`day-dot ${cumplido ? 'cumplido' : parcial ? 'parcial' : 'perdido'}`}>
                                <span className="dot-inner"></span>
                              </div>
                              <div className="day-tomas">{dia.tomas}/{tomasDiarias}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot cumplido"></div>
                <span>Cumplido</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot parcial"></div>
                <span>Parcial</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot perdido"></div>
                <span>Perdido</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <MainMenu />
    </div>
  );
};

export default HistorialScreen;

