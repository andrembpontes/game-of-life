import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GameGridCanvas from './components/GameGridCanvas';
import GameControls from './components/GameControls';
import GridSizeControls from './components/GridSizeControls';
import FPSCounter from './components/FPSCounter';
import { createGameState } from './utils/gameLogic';
import soundEffects from './utils/soundEffects';
import './App.css';

function App() {
  const [rows, setRows] = useState(30);
  const [cols, setCols] = useState(30);
  const gameStateRef = useRef(createGameState(rows, cols));
  const [version, setVersion] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const lastUpdateTime = useRef(performance.now());
  const frameTimeRef = useRef(null);

  // Handle grid updates and sound effects
  const handleGridUpdate = useCallback(() => {
    const now = performance.now();
    frameTimeRef.current = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    const gameState = gameStateRef.current;
    const oldGrid = gameState.currentState.grid;
    gameState.nextGeneration();
    setVersion(v => v + 1);

    // Handle sound effects
    if (!isMuted) {
      let births = 0;
      let deaths = 0;
      const sampleSize = Math.min(100, rows * cols);
      const newGrid = gameState.currentState.grid;
      
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
  }, [isMuted, rows, cols]);

  // Handle size changes
  const handleSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    const gameState = createGameState(newRows, newCols);
    gameStateRef.current = gameState;
    setVersion(v => v + 1);
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

  const toggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  const resetGrid = useCallback(() => {
    gameStateRef.current.randomize();
    setVersion(v => v + 1);
    setIsRunning(false);
  }, []);

  const clearGrid = useCallback(() => {
    gameStateRef.current.clear();
    setVersion(v => v + 1);
    setIsRunning(false);
  }, []);

  const toggleCell = useCallback((row, col) => {
    if (!isRunning) {
      console.log('Toggling cell:', row, col);
      gameStateRef.current.toggleCell(row, col);
      setVersion(v => v + 1);
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
      } else if (e.key === 'm') {
        toggleLegend();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleFullscreen, toggleRunning, toggleLegend]);

  const controlProps = useMemo(() => ({
    isRunning,
    isMuted,
    isFullscreen,
    showLegend,
    onToggleRunning: toggleRunning,
    onReset: resetGrid,
    onClear: clearGrid,
    onToggleMute: toggleMute,
    onToggleFullscreen: toggleFullscreen,
    onToggleLegend: toggleLegend
  }), [isRunning, isMuted, isFullscreen, showLegend, toggleRunning, resetGrid, clearGrid, toggleMute, toggleFullscreen, toggleLegend]);

  const gridSizeProps = useMemo(() => ({
    rows,
    cols,
    onSizeChange: handleSizeChange
  }), [rows, cols, handleSizeChange]);

  const currentState = gameStateRef.current.currentState;

  return (
    <div className="app">
      <FPSCounter />
      <h1>Game of Life</h1>
      <div className={`game-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {!isFullscreen && <GridSizeControls {...gridSizeProps} />}
        {!isFullscreen && <GameControls {...controlProps} />}
        <GameGridCanvas
          grid={currentState.grid}
          rows={rows}
          cols={cols}
          onToggleCell={toggleCell}
          isFullscreen={isFullscreen}
          showLegend={showLegend}
          version={version}
        />
      </div>
    </div>
  );
}

export default App;
