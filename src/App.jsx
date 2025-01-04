import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GameGrid from './components/GameGrid';
import GameControls from './components/GameControls';
import GridSizeControls from './components/GridSizeControls';
import FPSCounter from './components/FPSCounter';
import { generateRandomGrid } from './utils/gameLogic';
import { useGameWorker } from './hooks/useGameWorker';
import soundEffects from './utils/soundEffects';
import './App.css';

function App() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [grid, setGrid] = useState(() => generateRandomGrid(rows, cols));
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lastUpdateTime = useRef(performance.now());
  const frameTimeRef = useRef(null);

  // Handle grid updates and sound effects
  const handleGridUpdate = useCallback((newGrid) => {
    // Measure frame time
    const now = performance.now();
    frameTimeRef.current = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    setGrid(prevGrid => {
      // Handle sound effects only if we have a previous grid
      if (!isMuted && prevGrid) {
        let births = 0;
        let deaths = 0;
        const sampleSize = Math.min(100, rows * cols);
        
        for (let k = 0; k < sampleSize; k++) {
          const i = Math.floor(Math.random() * rows);
          const j = Math.floor(Math.random() * cols);
          if (!prevGrid[i][j] && newGrid[i][j]) births++;
          if (prevGrid[i][j] && !newGrid[i][j]) deaths++;
        }
        
        if (births > 0) soundEffects.playBirth();
        if (deaths > 0) soundEffects.playDeath();
      }
      return newGrid;
    });
  }, [isMuted, rows, cols]);

  // Initialize game worker
  const { initGame, nextGeneration } = useGameWorker(rows, cols, handleGridUpdate);

  // Handle size changes
  const handleSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    const newGrid = generateRandomGrid(newRows, newCols);
    setGrid(newGrid);
    initGame(newGrid);
    setIsRunning(false);
  }, [initGame]);

  const toggleMute = useCallback(() => {
    const newMutedState = soundEffects.toggleMute();
    setIsMuted(newMutedState);
  }, []);

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetGrid = useCallback(() => {
    const newGrid = generateRandomGrid(rows, cols);
    setGrid(newGrid);
    initGame(newGrid);
    setIsRunning(false);
  }, [rows, cols, initGame]);

  const clearGrid = useCallback(() => {
    const newGrid = Array(rows).fill().map(() => Array(cols).fill(false));
    setGrid(newGrid);
    initGame(newGrid);
    setIsRunning(false);
  }, [rows, cols, initGame]);

  const toggleCell = useCallback((row, col) => {
    if (!isRunning) {
      const newGrid = grid.map(arr => [...arr]);
      newGrid[row][col] = !newGrid[row][col];
      setGrid(newGrid);
      initGame(newGrid);
    }
  }, [isRunning, grid, initGame]);

  // Initialize worker with initial grid
  useEffect(() => {
    initGame(grid);
  }, [initGame, grid]);

  // Handle game loop with dynamic interval based on frame time
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      const interval = Math.max(16, frameTimeRef.current || 100); // Minimum 60 FPS, default to 100ms
      intervalId = setInterval(nextGeneration, interval);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, nextGeneration]);

  const controlProps = useMemo(() => ({
    isRunning,
    isMuted,
    onToggleRunning: toggleRunning,
    onReset: resetGrid,
    onClear: clearGrid,
    onToggleMute: toggleMute
  }), [isRunning, isMuted, toggleRunning, resetGrid, clearGrid, toggleMute]);

  const gridSizeProps = useMemo(() => ({
    rows,
    cols,
    onSizeChange: handleSizeChange
  }), [rows, cols, handleSizeChange]);

  return (
    <div className="app">
      <FPSCounter />
      <h1>Game of Life</h1>
      <GridSizeControls {...gridSizeProps} />
      <GameControls {...controlProps} />
      <GameGrid
        grid={grid}
        onToggleCell={toggleCell}
      />
    </div>
  );
}

export default App;
