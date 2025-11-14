import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { puedeAgregarMedicamento } from '../utils/subscription';
import { 
  obtenerMedicamentos,
  agregarMedicamento as agregarMedicamentoFirebase,
  actualizarMedicamento,
  eliminarMedicamento as eliminarMedicamentoFirebase,
  marcarTomaRealizada as marcarTomaRealizadaFirebase,
  suscribirMedicamentos
} from '../services/medicamentosService';

const MedContext = createContext();

export const MedProvider = ({ children }) => {
  const { usuarioActual } = useAuth();
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Cargar medicamentos cuando el usuario se autentica
  useEffect(() => {
    if (usuarioActual) {
      cargarMedicamentos();
      
      // Determinar el userId: si es asistente, usar pacienteId; si no, usar su propio id
      const userId = usuarioActual.role === 'asistente' 
        ? usuarioActual.pacienteId 
        : usuarioActual.id;
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = suscribirMedicamentos(userId, (medicamentosActualizados) => {
        setMedicamentos(medicamentosActualizados);
      });

      return () => unsubscribe();
    } else {
      setMedicamentos([]);
    }
  }, [usuarioActual]);

  const cargarMedicamentos = async () => {
    if (!usuarioActual) return;

    // Si es asistente, cargar medicamentos del paciente; si no, los suyos
    const userId = usuarioActual.role === 'asistente' 
      ? usuarioActual.pacienteId 
      : usuarioActual.id;

    setCargando(true);
    const resultado = await obtenerMedicamentos(userId);
    if (resultado.success) {
      setMedicamentos(resultado.medicamentos);
    }
    setCargando(false);
  };

  const agregarMedicina = async (medicina, tipoSuscripcion = 'gratis') => {
    if (!usuarioActual) {
      return {
        success: false,
        error: 'Debes estar autenticado para agregar medicamentos'
      };
    }

    // Verificar límite de medicamentos
    if (!puedeAgregarMedicamento(medicamentos.length, tipoSuscripcion)) {
      return {
        success: false,
        error: 'Límite de medicamentos alcanzado. Suscríbete a Premium para agregar más.'
      };
    }

    // Si Firebase está disponible, usar Firestore
    try {
      const resultado = await agregarMedicamentoFirebase(usuarioActual.id, medicina);
      if (resultado.success) {
        // La suscripción en tiempo real actualizará el estado automáticamente
        return resultado;
      }
      return resultado;
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al agregar medicamento'
      };
    }
  };

  const editarMedicina = async (id, datosActualizados) => {
    try {
      const resultado = await actualizarMedicamento(id, datosActualizados);
      return resultado;
    } catch (error) {
      console.error('Error al editar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al editar medicamento'
      };
    }
  };

  const eliminarMedicina = async (id) => {
    try {
      const resultado = await eliminarMedicamentoFirebase(id);
      return resultado;
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar medicamento'
      };
    }
  };

  const suspenderMedicina = async (id) => {
    return await editarMedicina(id, { activo: false });
  };

  const marcarToma = async (id, hora) => {
    try {
      const resultado = await marcarTomaRealizadaFirebase(id, hora);
      return resultado;
    } catch (error) {
      console.error('Error al marcar toma:', error);
      return {
        success: false,
        error: error.message || 'Error al marcar toma'
      };
    }
  };

  return (
    <MedContext.Provider value={{
      medicamentos,
      agregarMedicina,
      editarMedicina,
      eliminarMedicina,
      suspenderMedicina,
      marcarToma,
      cargando,
      recargarMedicamentos: cargarMedicamentos
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

