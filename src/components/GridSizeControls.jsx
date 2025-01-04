import { useState, useCallback } from 'react';
import '../styles/GridSizeControls.css';

const GridSizeControls = ({ rows, cols, onSizeChange }) => {
  const [rowsInput, setRowsInput] = useState(rows.toString());
  const [colsInput, setColsInput] = useState(cols.toString());

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const newRows = Math.max(3, parseInt(rowsInput, 10) || 3);
    const newCols = Math.max(3, parseInt(colsInput, 10) || 3);
    onSizeChange(newRows, newCols);
  }, [rowsInput, colsInput, onSizeChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <form className="grid-size-controls" onSubmit={handleSubmit}>
      <div className="size-control">
        <label htmlFor="rows">Rows:</label>
        <input
          type="number"
          id="rows"
          min="3"
          value={rowsInput}
          onChange={(e) => setRowsInput(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="size-control">
        <label htmlFor="cols">Columns:</label>
        <input
          type="number"
          id="cols"
          min="3"
          value={colsInput}
          onChange={(e) => setColsInput(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
};

export default GridSizeControls;
