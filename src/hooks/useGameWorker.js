import { useEffect, useRef, useCallback } from 'react';

export function useGameWorker(rows, cols, onGridUpdate) {
  const workerRef = useRef(null);
  const callbackRef = useRef(onGridUpdate);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onGridUpdate;
  }, [onGridUpdate]);

  // Initialize or reinitialize worker when dimensions change
  useEffect(() => {
    // Clean up previous worker if it exists
    workerRef.current?.terminate();

    // Create new worker
    workerRef.current = new Worker(new URL('../workers/gameWorker.js', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, grid } = e.data;
      if (type === 'next' && callbackRef.current) {
        callbackRef.current(grid);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [rows, cols]);

  // Initialize game with dimensions
  const initGame = useCallback((initialGrid) => {
    if (!workerRef.current) return;
    
    workerRef.current.postMessage({
      type: 'init',
      rows,
      cols,
      grid: initialGrid
    });
  }, [rows, cols]);

  // Request next generation
  const nextGeneration = useCallback(() => {
    workerRef.current?.postMessage({ type: 'next' });
  }, []);

  return {
    initGame,
    nextGeneration
  };
}
