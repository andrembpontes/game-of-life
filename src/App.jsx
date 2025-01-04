import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GameGridCanvas from './components/GameGridCanvas';
import GameControls from './components/GameControls';
import GridSizeControls from './components/GridSizeControls';
import FPSCounter from './components/FPSCounter';
import { createGameState } from './utils/gameLogic';
import soundEffects from './utils/soundEffects';
import { useGameWorker } from './hooks/useGameWorker';
import './App.css';

function App() {
  const [rows, setRows] = useState(30);
  const [cols, setCols] = useState(30);
  const [grid, setGrid] = useState(() => new Uint8Array(rows * cols));
  const [version, setVersion] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const lastUpdateTime = useRef(performance.now());
  const frameTimeRef = useRef(null);

  const { initGame, nextGeneration } = useGameWorker(rows, cols, (newGrid) => {
    setGrid(newGrid);
    setVersion(v => v + 1);
  });

  // Handle grid updates and sound effects
  const handleGridUpdate = useCallback(() => {
    const now = performance.now();
    frameTimeRef.current = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    const oldGrid = grid;
    nextGeneration();

    // Handle sound effects
    if (!isMuted) {
      let births = 0;
      let deaths = 0;
      const sampleSize = Math.min(100, rows * cols);
      
      for (let k = 0; k < sampleSize; k++) {
        const i = Math.floor(Math.random() * rows);
        const j = Math.floor(Math.random() * cols);
        const idx = i * cols + j;
        if (!oldGrid[idx] && grid[idx]) births++;
        if (oldGrid[idx] && !grid[idx]) deaths++;
      }
      
      if (births > 0) soundEffects.playBirth();
      if (deaths > 0) soundEffects.playDeath();
    }
  }, [isMuted, rows, cols, grid, nextGeneration]);

  // Handle size changes
  const handleSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    const newGrid = new Uint8Array(newRows * newCols);
    setGrid(newGrid);
    initGame(newGrid);
    setVersion(v => v + 1);
    setIsRunning(false);
  }, [initGame]);

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
    const newGrid = new Uint8Array(rows * cols);
    for (let i = 0; i < newGrid.length; i++) {
      newGrid[i] = Math.random() > 0.5 ? 1 : 0;
    }
    setGrid(newGrid);
    initGame(newGrid);
    setVersion(v => v + 1);
    setIsRunning(false);
  }, [rows, cols, initGame]);

  const clearGrid = useCallback(() => {
    const newGrid = new Uint8Array(rows * cols);
    setGrid(newGrid);
    initGame(newGrid);
    setVersion(v => v + 1);
    setIsRunning(false);
  }, [rows, cols, initGame]);

  const toggleCell = useCallback((row, col) => {
    if (!isRunning) {
      const newGrid = new Uint8Array(grid);
      const idx = row * cols + col;
      newGrid[idx] = newGrid[idx] ? 0 : 1;
      setGrid(newGrid);
      initGame(newGrid);
      setVersion(v => v + 1);
    }
  }, [isRunning, grid, cols, initGame]);

  // Initialize game
  useEffect(() => {
    initGame(grid);
  }, [initGame, grid]);

  // Handle game loop with dynamic interval based on frame time
  useEffect(() => {
    if (!isRunning) return;

    const update = () => {
      handleGridUpdate();
    };

    const intervalId = setInterval(update, 100);
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
          showLegend={showLegend}
          version={version}
        />
      </div>
    </div>
  );
}

export default App;
