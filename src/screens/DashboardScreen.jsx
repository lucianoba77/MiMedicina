import React from 'react';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import MedicamentoCard from '../components/MedicamentoCard';
import MainMenu from '../components/MainMenu';
import './DashboardScreen.css';

const DashboardScreen = () => {
  const { medicamentos } = useMed();
  const { usuarioActual } = useAuth();

  // Filtrar medicamentos del día de hoy
  const medicamentosHoy = medicamentos.filter(medicamento => {
    // Esta lógica se puede expandir según necesidad
    return medicamento.activo !== false;
  });

  // Ordenar por hora
  const ordenados = [...medicamentosHoy].sort((medicamentoA, medicamentoB) => {
    const horaA = parseInt(medicamentoA.primeraToma.replace(':', ''));
    const horaB = parseInt(medicamentoB.primeraToma.replace(':', ''));
    return horaA - horaB;
  });

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="greeting">¡Hola, {usuarioActual?.nombre || 'Usuario'}!</h1>
          <p className="sub-greeting">Mantén tu tratamiento al día</p>
        </div>
        <div className="header-icon">👤</div>
      </div>

      <div className="dashboard-content">
        <h2 className="section-title">Medicamentos de hoy</h2>
        
        {ordenados.length === 0 ? (
          <div className="empty-state">
            <p>No hay medicamentos programados para hoy</p>
            <p className="empty-hint">Agrega tu primer medicamento</p>
          </div>
        ) : (
          <div className="medicamentos-list">
            {ordenados.map(medicamento => (
              <MedicamentoCard 
                key={medicamento.id} 
                medicamento={medicamento} 
                tipoVista="dashboard"
              />
            ))}
          </div>
        )}
      </div>

      <MainMenu />
    </div>
  );
};

export default DashboardScreen;

