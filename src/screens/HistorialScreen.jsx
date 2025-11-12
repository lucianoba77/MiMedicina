import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import MainMenu from '../components/MainMenu';
import './HistorialScreen.css';

const HistorialScreen = () => {
  const navigate = useNavigate();
  const { medicamentos } = useMed();

  const totalMedicamentos = medicamentos.length;
  const activos = medicamentos.filter(medicamento => medicamento.activo !== false).length;
  const completados = medicamentos.filter(medicamento => medicamento.stockActual === 0 || medicamento.activo === false).length;

  return (
    <div className="historial-screen">
      <div className="historial-header">
        <button className="btn-home" onClick={() => navigate('/dashboard')}>🏠</button>
        <h1>Historial</h1>
      </div>

      <div className="historial-content">
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
            <h2 className="section-title">Adherencia al tratamiento</h2>
          </div>
          
          <div className="adherencia-list">
            {medicamentos.map(medicamento => (
              <div key={medicamento.id} className="adherencia-item">
                <span className="adherencia-nombre">{medicamento.nombre}</span>
                <span className="adherencia-porcentaje">
                  {medicamento.tomasRealizadas.length > 0 ? '10%' : '0%'}
                </span>
                <div className="adherencia-bar-container">
                  <div 
                    className="adherencia-bar"
                    style={{ 
                      width: medicamento.tomasRealizadas.length > 0 ? '10%' : '0%' 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">📅</div>
            <h2 className="section-title">Resumen semanal</h2>
          </div>
          
          <div className="weekly-summary">
            <div className="days-row">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, index) => (
                <div key={dia} className="day-cell">
                  <div className="day-letter">{dia}</div>
                  <div className={`day-dot ${index % 2 === 0 ? 'cumplido' : 'perdido'}`}>
                    <span className="dot-inner"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot cumplido"></div>
              <span>Cumplido</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot perdido"></div>
              <span>Perdido</span>
            </div>
          </div>
        </div>
      </div>

      <MainMenu />
    </div>
  );
};

export default HistorialScreen;

