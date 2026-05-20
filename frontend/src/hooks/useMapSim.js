import { useRef, useCallback } from 'react';

const useMapSim = () => {
  const activeIntervals = useRef({});

  // Realiza una interpolación lineal de coordenadas entre inicio y fin en un tiempo determinado
  const simulateRoute = useCallback((
    repartidorId, 
    startPos, // { lat, lng }
    endPos,   // { lat, lng }
    onStep,   // Callback paso a paso (lat, lng)
    onFinish, // Callback al completar
    durationMs = 8000 // Duración total de la ruta en milisegundos
  ) => {
    // Si ya hay una ruta activa para este repartidor, la cancelamos primero
    if (activeIntervals.current[repartidorId]) {
      clearInterval(activeIntervals.current[repartidorId]);
    }

    const intervalTime = 100; // Actualizaciones cada 100ms
    const totalSteps = durationMs / intervalTime;
    let currentStep = 0;

    const startLat = parseFloat(startPos.lat);
    const startLng = parseFloat(startPos.lng);
    const endLat = parseFloat(endPos.lat);
    const endLng = parseFloat(endPos.lng);

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;

      if (progress >= 1) {
        clearInterval(interval);
        delete activeIntervals.current[repartidorId];
        onStep(endLat, endLng);
        if (onFinish) onFinish();
      } else {
        // Interpolación lineal simple
        const currentLat = startLat + (endLat - startLat) * progress;
        const currentLng = startLng + (endLng - startLng) * progress;
        onStep(currentLat, currentLng);
      }
    }, intervalTime);

    activeIntervals.current[repartidorId] = interval;
  }, []);

  const stopSimulation = useCallback((repartidorId) => {
    if (activeIntervals.current[repartidorId]) {
      clearInterval(activeIntervals.current[repartidorId]);
      delete activeIntervals.current[repartidorId];
    }
  }, []);

  return { simulateRoute, stopSimulation };
};

export default useMapSim;
