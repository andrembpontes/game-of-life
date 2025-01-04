import { useState, useCallback, useRef } from 'react'
import GameGrid from './components/GameGrid'
import GameControls from './components/GameControls'
import { calculateNextGeneration, generateRandomGrid } from './utils/gameLogic'
import './App.css'

function App() {
  const [grid, setGrid] = useState(() => Array(30).fill().map(() => Array(30).fill(false)));
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid(prevGrid => calculateNextGeneration(prevGrid));
    setTimeout(runSimulation, 100);
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    runningRef.current = true;
    runSimulation();
  };

  const handleStop = () => {
    setIsRunning(false);
    runningRef.current = false;
  };

  const handleClear = () => {
    setGrid(Array(30).fill().map(() => Array(30).fill(false)));
  };

  const handleRandom = () => {
    setGrid(generateRandomGrid(30, 30));
  };

  const handleCellToggle = useCallback((row, col) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(arr => [...arr]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  }, []);

  return (
    <div className="app">
      <h1>Conway's Game of Life</h1>
      <div className="game-container">
        <GameControls
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onClear={handleClear}
          onRandom={handleRandom}
        />
        <GameGrid 
          grid={grid} 
          onCellToggle={handleCellToggle}
        />
      </div>
    </div>
  )
}

export default App
