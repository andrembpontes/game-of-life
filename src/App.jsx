import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GameGridCanvas from './components/GameGridCanvas';
import GameControls from './components/GameControls';
import GridSizeControls from './components/GridSizeControls';
import FPSCounter from './components/FPSCounter';
import { createGameState } from './utils/gameLogic';
import soundEffects from './utils/soundEffects';
import './App.css';

function App() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const gameStateRef = useRef(createGameState(rows, cols));
  const [grid, setGrid] = useState(() => gameStateRef.current.currentState);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastUpdateTime = useRef(performance.now());
  const frameTimeRef = useRef(null);

  // Handle grid updates and sound effects
  const handleGridUpdate = useCallback(() => {
    // Measure frame time
    const now = performance.now();
    frameTimeRef.current = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    const gameState = gameStateRef.current;
    const oldGrid = grid;

    // Update game state
    const newGrid = gameState.nextGeneration();

    // Handle sound effects
    if (!isMuted) {
      let births = 0;
      let deaths = 0;
      const sampleSize = Math.min(100, rows * cols);
      
      for (let k = 0; k < sampleSize; k++) {
        const i = Math.floor(Math.random() * rows);
        const j = Math.floor(Math.random() * cols);
        const idx = i * cols + j;
        if (!oldGrid[idx] && newGrid[idx]) births++;
        if (oldGrid[idx] && !newGrid[idx]) deaths++;
      }
      
      if (births > 0) soundEffects.playBirth();
      if (deaths > 0) soundEffects.playDeath();
    }

    setGrid(newGrid);
  }, [isMuted, rows, cols, grid]);

  // Handle size changes
  const handleSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    const gameState = createGameState(newRows, newCols);
    gameStateRef.current = gameState;
    setGrid(gameState.currentState);
    setIsRunning(false);
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = soundEffects.toggleMute();
    setIsMuted(newMutedState);
  }, []);

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const resetGrid = useCallback(() => {
    const gameState = gameStateRef.current;
    const newGrid = gameState.randomize();
    setGrid(newGrid);
    setIsRunning(false);
  }, []);

  const clearGrid = useCallback(() => {
    const gameState = gameStateRef.current;
    const newGrid = gameState.clear();
    setGrid(newGrid);
    setIsRunning(false);
  }, []);

  const toggleCell = useCallback((row, col) => {
    if (!isRunning) {
      const gameState = gameStateRef.current;
      gameState.toggleCell(row, col);
      setGrid(gameState.currentState);
    }
  }, [isRunning]);

  // Handle game loop with dynamic interval based on frame time
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      const interval = Math.max(16, frameTimeRef.current || 100); // Minimum 60 FPS, default to 100ms
      intervalId = setInterval(handleGridUpdate, interval);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, handleGridUpdate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleRunning();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleFullscreen, toggleRunning]);

  const controlProps = useMemo(() => ({
    isRunning,
    isMuted,
    isFullscreen,
    onToggleRunning: toggleRunning,
    onReset: resetGrid,
    onClear: clearGrid,
    onToggleMute: toggleMute,
    onToggleFullscreen: toggleFullscreen
  }), [isRunning, isMuted, isFullscreen, toggleRunning, resetGrid, clearGrid, toggleMute, toggleFullscreen]);

  const gridSizeProps = useMemo(() => ({
    rows,
    cols,
    onSizeChange: handleSizeChange
  }), [rows, cols, handleSizeChange]);

  return (
    <div className="app">
      <FPSCounter />
      <h1>Game of Life</h1>
      <div className={`game-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {!isFullscreen && <GridSizeControls {...gridSizeProps} />}
        {!isFullscreen && <GameControls {...controlProps} />}
        <GameGridCanvas
          grid={grid}
          rows={rows}
          cols={cols}
          onToggleCell={toggleCell}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
}

export default App;
