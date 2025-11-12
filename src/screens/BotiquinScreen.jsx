import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import MainMenu from '../components/MainMenu';
import './BotiquinScreen.css';

const BotiquinScreen = () => {
  const navigate = useNavigate();
  const { medicamentos, eliminarMedicina, suspenderMedicina } = useMed();

  return (
    <div className="botiquin-screen">
      <div className="botiquin-header">
        <button className="btn-home" onClick={() => navigate('/dashboard')}>🏠</button>
        <h1>Mi Botiquín</h1>
      </div>

      <div className="botiquin-content">
        {medicamentos.length === 0 ? (
          <div className="empty-state">
            <p>No hay medicamentos en tu botiquín</p>
            <p className="empty-hint">Agrega tu primer medicamento</p>
          </div>
        ) : (
          <div className="medicamentos-grid">
            {medicamentos.map(medicamento => (
              <div key={medicamento.id} className="medicamento-card-container">
                <div className="med-card-header">
                  <div className="med-icon-circle" style={{ backgroundColor: medicamento.color }}>
                    {medicamento.presentacion === 'inyeccion' ? '💉' : '💊'}
                  </div>
                  <div className="med-title-section">
                    <h3 className="med-nombre">{medicamento.nombre}</h3>
                    <span className={`status-badge ${medicamento.activo !== false ? 'activo' : 'inactivo'}`}>
                      {medicamento.activo !== false ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>
                
                <div className="med-details">
                  <div className="detail-row">
                    <span className="detail-label">Presentación:</span>
                    <span className="detail-value">{medicamento.presentacion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tomas diarias:</span>
                    <span className="detail-value">{medicamento.tomasDiarias}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Primera toma:</span>
                    <span className="detail-value">{medicamento.primeraToma}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Condición:</span>
                    <span className="detail-value">{medicamento.afeccion}</span>
                  </div>
                  
                  <div className="stock-row">
                    <span className="detail-label">Stock:</span>
                    <div className="stock-bar-container">
                      <div 
                        className="stock-bar"
                        style={{ 
                          width: `${(medicamento.stockActual / medicamento.stockInicial) * 100}%`,
                          backgroundColor: medicamento.stockActual <= 7 ? '#f44336' : '#4CAF50'
                        }}
                      />
                    </div>
                    <span className="stock-text">{medicamento.stockActual} de {medicamento.stockInicial}</span>
                  </div>
                </div>

                <div className="med-actions">
                  <button 
                    className="btn-suspender"
                    onClick={async () => {
                      await suspenderMedicina(medicamento.id);
                    }}
                  >
                    Suspender
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={async () => {
                      if (window.confirm('¿Estás seguro de eliminar este medicamento?')) {
                        await eliminarMedicina(medicamento.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MainMenu />
    </div>
  );
};

export default BotiquinScreen;

