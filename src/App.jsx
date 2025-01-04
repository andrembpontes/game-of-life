import { useState, useCallback, useEffect } from 'react';
import GameGrid from './components/GameGrid';
import GameControls from './components/GameControls';
import GridSizeControls from './components/GridSizeControls';
import { calculateNextGeneration, generateRandomGrid } from './utils/gameLogic';
import soundEffects from './utils/soundEffects';
import './App.css';

function App() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [grid, setGrid] = useState(() => generateRandomGrid(rows, cols));
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    setGrid(generateRandomGrid(newRows, newCols));
    setIsRunning(false);
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = soundEffects.toggleMute();
    setIsMuted(newMutedState);
  }, []);

  const nextGeneration = useCallback(() => {
    setGrid(prevGrid => {
      const nextGrid = calculateNextGeneration(prevGrid);
      
      // Play sounds based on cell changes
      if (!isMuted) {
        let births = 0;
        let deaths = 0;
        
        for (let i = 0; i < prevGrid.length; i++) {
          for (let j = 0; j < prevGrid[0].length; j++) {
            if (!prevGrid[i][j] && nextGrid[i][j]) births++;
            if (prevGrid[i][j] && !nextGrid[i][j]) deaths++;
          }
        }
        
        if (births > 0) soundEffects.playBirth();
        if (deaths > 0) soundEffects.playDeath();
      }
      
      return nextGrid;
    });
  }, [isMuted]);

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetGrid = useCallback(() => {
    setGrid(generateRandomGrid(rows, cols));
    setIsRunning(false);
  }, [rows, cols]);

  const clearGrid = useCallback(() => {
    setGrid(Array(rows).fill().map(() => Array(cols).fill(false)));
    setIsRunning(false);
  }, [rows, cols]);

  const toggleCell = useCallback((row, col) => {
    if (!isRunning) {
      setGrid(prev => {
        const newGrid = prev.map(arr => [...arr]);
        newGrid[row][col] = !newGrid[row][col];
        return newGrid;
      });
    }
  }, [isRunning]);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(nextGeneration, 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, nextGeneration]);

  return (
    <div className="app">
      <h1>Game of Life</h1>
      <GridSizeControls
        rows={rows}
        cols={cols}
        onSizeChange={handleSizeChange}
      />
      <GameControls
        isRunning={isRunning}
        isMuted={isMuted}
        onToggleRunning={toggleRunning}
        onReset={resetGrid}
        onClear={clearGrid}
        onToggleMute={toggleMute}
      />
      <GameGrid
        grid={grid}
        onToggleCell={toggleCell}
      />
    </div>
  );
}

export default App;
