import React, { createContext, useState, useContext } from 'react';
import { puedeAgregarMedicamento } from '../utils/subscription';

const MedContext = createContext();

export const MedProvider = ({ children, medicamentosIniciales }) => {
  const [medicamentos, setMedicamentos] = useState(medicamentosIniciales);

  const agregarMedicina = (medicina, tipoSuscripcion = 'gratis') => {
    // Verificar límite de medicamentos
    if (!puedeAgregarMedicamento(medicamentos.length, tipoSuscripcion)) {
      return {
        success: false,
        error: 'Límite de medicamentos alcanzado. Suscríbete a Premium para agregar más.'
      };
    }

    const nuevoId = `${Date.now()}`;
    const nuevaMedicina = {
      ...medicina,
      id: nuevoId,
      stockActual: medicina.stockInicial,
      tomasRealizadas: []
    };
    setMedicamentos([...medicamentos, nuevaMedicina]);
    return { success: true, medicina: nuevaMedicina };
  };

  const editarMedicina = (id, datosActualizados) => {
    setMedicamentos(medicamentos.map(medicamento => 
      medicamento.id === id ? { ...medicamento, ...datosActualizados } : medicamento
    ));
  };

  const eliminarMedicina = (id) => {
    setMedicamentos(medicamentos.filter(medicamento => medicamento.id !== id));
  };

  const suspenderMedicina = (id) => {
    setMedicamentos(medicamentos.map(medicamento => 
      medicamento.id === id ? { ...medicamento, activo: false } : medicamento
    ));
  };

  const marcarToma = (id, hora) => {
    const fecha = new Date().toISOString().split('T')[0];
    setMedicamentos(medicamentos.map(medicamento => {
      if (medicamento.id === id) {
        const nuevaToma = {
          fecha,
          hora,
          tomada: true
        };
        return {
          ...medicamento,
          stockActual: medicamento.stockActual > 0 ? medicamento.stockActual - 1 : 0,
          tomasRealizadas: [...medicamento.tomasRealizadas, nuevaToma]
        };
      }
      return medicamento;
    }));
  };

  return (
    <MedContext.Provider value={{
      medicamentos,
      agregarMedicina,
      editarMedicina,
      eliminarMedicina,
      suspenderMedicina,
      marcarToma
    }}>
      {children}
    </MedContext.Provider>
  );
};

export const useMed = () => {
  const context = useContext(MedContext);
  if (!context) {
    throw new Error('useMed debe ser usado dentro de MedProvider');
  }
  return context;
};

