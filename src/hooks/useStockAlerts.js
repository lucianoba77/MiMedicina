import { useEffect, useRef } from 'react';
import { useMed } from '../context/MedContext';
import { useNotification } from '../context/NotificationContext';

/**
 * Hook para monitorear el stock de medicamentos y mostrar alertas
 */
export const useStockAlerts = (diasAntesAlerta = 7) => {
  const { medicamentos } = useMed();
  const { showWarning, showError } = useNotification();
  const alertadosRef = useRef(new Set());

  useEffect(() => {
    if (!medicamentos || medicamentos.length === 0) return;

    medicamentos.forEach(medicamento => {
      if (!medicamento.activo) return;

      const stockActual = medicamento.stockActual || 0;
      const tomasDiarias = medicamento.tomasDiarias || 1;
      const diasRestantes = Math.floor(stockActual / tomasDiarias);
      const medicamentoId = medicamento.id;

      // Si el stock está en 0 o negativo
      if (stockActual <= 0) {
        if (!alertadosRef.current.has(`${medicamentoId}-agotado`)) {
          showError(
            `⚠️ ${medicamento.nombre} se ha agotado. Por favor, recarga tu stock.`,
            5000
          );
          alertadosRef.current.add(`${medicamentoId}-agotado`);
        }
      }
      // Si el stock es suficiente para menos días que el umbral
      else if (diasRestantes <= diasAntesAlerta && diasRestantes > 0) {
        if (!alertadosRef.current.has(`${medicamentoId}-bajo`)) {
          const mensaje = diasRestantes === 1
            ? `⚠️ ${medicamento.nombre} se acabará mañana. Solo queda 1 día de stock.`
            : `⚠️ ${medicamento.nombre} tiene stock bajo. Quedan aproximadamente ${diasRestantes} días.`;
          
          showWarning(mensaje, 5000);
          alertadosRef.current.add(`${medicamentoId}-bajo`);
        }
      } else {
        // Si el stock se recuperó, remover de alertados
        alertadosRef.current.delete(`${medicamentoId}-bajo`);
        alertadosRef.current.delete(`${medicamentoId}-agotado`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicamentos, diasAntesAlerta]);

  // Limpiar alertados cuando cambian los medicamentos
  useEffect(() => {
    const medicamentoIds = new Set(medicamentos.map(m => m.id));
    alertadosRef.current.forEach(key => {
      const medicamentoId = key.split('-')[0];
      if (!medicamentoIds.has(medicamentoId)) {
        alertadosRef.current.delete(key);
      }
    });
  }, [medicamentos]);
};

