import React from 'react';
import PropTypes from 'prop-types';
import './GameGrid.css';

const GameGrid = ({ grid, onCellToggle }) => {
  return (
    <div className="game-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-testid="grid-cell"
              className={`grid-cell ${cell ? 'alive' : ''}`}
              onClick={() => onCellToggle(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

GameGrid.propTypes = {
  grid: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.bool)
  ).isRequired,
  onCellToggle: PropTypes.func.isRequired,
};

export default GameGrid;
