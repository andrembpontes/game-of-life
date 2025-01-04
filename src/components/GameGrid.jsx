import '../styles/GameGrid.css';

const GameGrid = ({ grid, onCellToggle }) => {
  return (
    <div className="game-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`grid-cell ${cell ? 'alive' : ''}`}
              onClick={() => onCellToggle(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameGrid;
