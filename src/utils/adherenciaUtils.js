/**
 * Utilidades para calcular métricas de adherencia al tratamiento
 */

/**
 * Calcula el porcentaje de adherencia de un medicamento
 * @param {Object} medicamento - Objeto del medicamento con tomasRealizadas
 * @returns {number} Porcentaje de adherencia (0-100)
 */
export const calcularAdherencia = (medicamento) => {
  if (!medicamento) {
    return 0;
  }

  // Si no está activo, no calcular adherencia
  if (medicamento.activo === false) {
    return 0;
  }

  // Obtener fecha de inicio del tratamiento
  const fechaInicioStr = medicamento.fechaCreacion || medicamento.fechaInicio;
  if (!fechaInicioStr) {
    return 0;
  }

  const fechaInicio = new Date(fechaInicioStr);
  const fechaActual = new Date();
  
  // Resetear horas para comparar solo días
  fechaInicio.setHours(0, 0, 0, 0);
  fechaActual.setHours(0, 0, 0, 0);
  
  const diasTranscurridos = Math.max(1, Math.floor((fechaActual - fechaInicio) / (1000 * 60 * 60 * 24)));
  
  // Calcular tomas esperadas
  const tomasDiarias = medicamento.tomasDiarias || 1;
  const tomasEsperadas = diasTranscurridos * tomasDiarias;
  
  if (tomasEsperadas === 0) {
    return 0;
  }
  
  // Obtener tomas realizadas y contar por día
  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const tomasPorDia = {};
  
  tomasRealizadas.forEach(toma => {
    if (toma.fecha) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        // Verificar que la fecha esté dentro del rango del tratamiento
        if (fecha >= fechaInicio && fecha <= fechaActual) {
          if (!tomasPorDia[fechaKey]) {
            tomasPorDia[fechaKey] = 0;
          }
          tomasPorDia[fechaKey]++;
        }
      } catch (error) {
        console.warn('Error al procesar fecha de toma:', error);
      }
    }
  });
  
  // Contar días con tomas completas
  const diasConTomasCompletas = Object.values(tomasPorDia).filter(count => count >= tomasDiarias).length;
  
  // Calcular porcentaje basado en días con tomas completas
  const porcentaje = Math.min(100, Math.round((diasConTomasCompletas / diasTranscurridos) * 100));
  
  return porcentaje;
};

/**
 * Calcula las tomas realizadas en los últimos 7 días
 * @param {Object} medicamento - Objeto del medicamento
 * @returns {Array} Array con tomas por día de la semana
 */
export const calcularTomasSemana = (medicamento) => {
  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const resultado = [];
  
  // Crear array con los últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(0, 0, 0, 0);
    
    const fechaKey = fecha.toISOString().split('T')[0];
    const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que Lunes = 0
    
    resultado.push({
      dia: diasSemana[indiceDia],
      fecha: fechaKey,
      fechaObj: fecha,
      tomas: 0
    });
  }
  
  // Contar tomas por día
  tomasRealizadas.forEach(toma => {
    if (toma.fecha) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        // Buscar el día correspondiente
        const diaEncontrado = resultado.find(d => d.fecha === fechaKey);
        if (diaEncontrado) {
          diaEncontrado.tomas++;
        }
      } catch (error) {
        console.warn('Error al procesar fecha de toma:', error);
      }
    }
  });
  
  return resultado;
};

/**
 * Calcula la adherencia promedio de todos los medicamentos
 * @param {Array} medicamentos - Array de medicamentos
 * @returns {number} Porcentaje promedio de adherencia
 */
export const calcularAdherenciaPromedio = (medicamentos) => {
  if (!medicamentos || medicamentos.length === 0) {
    return 0;
  }
  
  const adherencias = medicamentos
    .filter(med => med.activo !== false)
    .map(med => calcularAdherencia(med));
  
  if (adherencias.length === 0) {
    return 0;
  }
  
  const suma = adherencias.reduce((acc, val) => acc + val, 0);
  return Math.round(suma / adherencias.length);
};

/**
 * Obtiene el estado de adherencia basado en el porcentaje
 * @param {number} porcentaje - Porcentaje de adherencia
 * @returns {Object} Objeto con estado, color y mensaje
 */
export const obtenerEstadoAdherencia = (porcentaje) => {
  if (porcentaje >= 90) {
    return {
      estado: 'excelente',
      color: '#4CAF50',
      mensaje: 'Excelente adherencia',
      icono: '✅'
    };
  } else if (porcentaje >= 70) {
    return {
      estado: 'buena',
      color: '#8BC34A',
      mensaje: 'Buena adherencia',
      icono: '👍'
    };
  } else if (porcentaje >= 50) {
    return {
      estado: 'regular',
      color: '#FF9800',
      mensaje: 'Adherencia regular',
      icono: '⚠️'
    };
  } else {
    return {
      estado: 'baja',
      color: '#F44336',
      mensaje: 'Adherencia baja',
      icono: '❌'
    };
  }
};

/**
 * Calcula las tomas esperadas vs realizadas en los últimos 30 días
 * @param {Object} medicamento - Objeto del medicamento
 * @returns {Object} Objeto con tomas esperadas y realizadas
 */
export const calcularTomasMensuales = (medicamento) => {
  if (!medicamento || medicamento.activo === false) {
    return {
      esperadas: 0,
      realizadas: 0,
      porcentaje: 0
    };
  }

  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0);
  
  // Calcular fecha límite (últimos 30 días)
  const fechaLimite = new Date(fechaActual);
  fechaLimite.setDate(fechaLimite.getDate() - 30);
  fechaLimite.setHours(0, 0, 0, 0);
  
  // Obtener fecha de inicio del tratamiento
  const fechaInicioStr = medicamento.fechaCreacion || medicamento.fechaInicio;
  const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr) : fechaLimite;
  fechaInicio.setHours(0, 0, 0, 0);
  
  // Usar la fecha más reciente entre fecha límite y fecha de inicio
  const fechaInicioPeriodo = fechaInicio > fechaLimite ? fechaInicio : fechaLimite;
  
  // Calcular días en el período
  const diasEnPeriodo = Math.max(1, Math.floor((fechaActual - fechaInicioPeriodo) / (1000 * 60 * 60 * 24)));
  const diasRevisar = Math.min(30, diasEnPeriodo);
  
  const tomasDiarias = medicamento.tomasDiarias || 1;
  const tomasEsperadas = diasRevisar * tomasDiarias;
  
  // Contar tomas en el período (últimos 30 días o desde inicio del tratamiento)
  const tomasEnPeriodo = tomasRealizadas.filter(toma => {
    if (toma.fecha) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        return fecha >= fechaInicioPeriodo && fecha <= fechaActual;
      } catch (error) {
        return false;
      }
    }
    return false;
  }).length;
  
  return {
    esperadas: tomasEsperadas,
    realizadas: tomasEnPeriodo,
    porcentaje: tomasEsperadas > 0 ? Math.round((tomasEnPeriodo / tomasEsperadas) * 100) : 0
  };
};

