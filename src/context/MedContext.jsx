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

export const MedProvider = ({ children, medicamentosIniciales = [] }) => {
  const { usuarioActual } = useAuth();
  const [medicamentos, setMedicamentos] = useState(medicamentosIniciales);
  const [cargando, setCargando] = useState(false);

  // Cargar medicamentos cuando el usuario se autentica
  useEffect(() => {
    if (usuarioActual) {
      cargarMedicamentos();
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = suscribirMedicamentos(usuarioActual.id, (medicamentosActualizados) => {
        setMedicamentos(medicamentosActualizados);
      });

      return () => unsubscribe();
    } else {
      // Si no hay usuario, usar datos mock
      setMedicamentos(medicamentosIniciales);
    }
  }, [usuarioActual]);

  const cargarMedicamentos = async () => {
    if (!usuarioActual) return;

    setCargando(true);
    const resultado = await obtenerMedicamentos(usuarioActual.id);
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
      // Fallback a datos locales si Firebase falla
      console.warn('Error al agregar en Firestore, usando datos locales:', error);
      const nuevoId = `${Date.now()}`;
      const nuevaMedicina = {
        ...medicina,
        id: nuevoId,
        stockActual: medicina.stockInicial,
        tomasRealizadas: []
      };
      setMedicamentos([...medicamentos, nuevaMedicina]);
      return { success: true, medicina: nuevaMedicina };
    }
  };

  const editarMedicina = async (id, datosActualizados) => {
    try {
      const resultado = await actualizarMedicamento(id, datosActualizados);
      if (resultado.success) {
        // La suscripción en tiempo real actualizará el estado automáticamente
        return resultado;
      }
      // Fallback a datos locales
      setMedicamentos(medicamentos.map(medicamento => 
        medicamento.id === id ? { ...medicamento, ...datosActualizados } : medicamento
      ));
      return { success: true };
    } catch (error) {
      // Fallback a datos locales
      setMedicamentos(medicamentos.map(medicamento => 
        medicamento.id === id ? { ...medicamento, ...datosActualizados } : medicamento
      ));
      return { success: true };
    }
  };

  const eliminarMedicina = async (id) => {
    try {
      const resultado = await eliminarMedicamentoFirebase(id);
      if (resultado.success) {
        // La suscripción en tiempo real actualizará el estado automáticamente
        return resultado;
      }
      // Fallback a datos locales
      setMedicamentos(medicamentos.filter(medicamento => medicamento.id !== id));
      return { success: true };
    } catch (error) {
      // Fallback a datos locales
      setMedicamentos(medicamentos.filter(medicamento => medicamento.id !== id));
      return { success: true };
    }
  };

  const suspenderMedicina = async (id) => {
    return await editarMedicina(id, { activo: false });
  };

  const marcarToma = async (id, hora) => {
    try {
      const resultado = await marcarTomaRealizadaFirebase(id, hora);
      if (resultado.success) {
        // La suscripción en tiempo real actualizará el estado automáticamente
        return resultado;
      }
      // Fallback a datos locales
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
      return { success: true };
    } catch (error) {
      // Fallback a datos locales
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
      return { success: true };
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

