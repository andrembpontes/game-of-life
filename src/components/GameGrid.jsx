import { memo } from 'react';
import '../styles/GameGrid.css';

const Cell = memo(({ isAlive, onClick }) => (
  <div
    className={`cell ${isAlive ? 'alive' : ''}`}
    onClick={onClick}
  />
));

const GameGrid = memo(({ grid, onToggleCell }) => {
  return (
    <div 
      className="game-grid"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
        width: `${grid[0].length * 20}px`
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <Cell
            key={`${i}-${j}`}
            isAlive={cell}
            onClick={() => onToggleCell(i, j)}
          />
        ))
      )}
    </div>
  );
});

export default GameGrid;
