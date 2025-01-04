import { useCallback } from 'react';
import '../styles/GameGrid.css';

const GameGrid = ({ grid, setGrid, rows = 30, cols = 30 }) => {
  const toggleCell = useCallback((row, col) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(arr => [...arr]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  }, [setGrid]);

  return (
    <div className="game-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`grid-cell ${cell ? 'alive' : ''}`}
              onClick={() => toggleCell(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameGrid;
