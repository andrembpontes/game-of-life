import '../styles/GridSizeControls.css';

const GridSizeControls = ({ rows, cols, onSizeChange }) => {
  const handleChange = (dimension, value) => {
    const size = parseInt(value, 10);
    if (size >= 3 && size <= 100) {
      onSizeChange(dimension === 'rows' ? size : rows, dimension === 'cols' ? size : cols);
    }
  };

  return (
    <div className="grid-size-controls">
      <div className="size-control">
        <label htmlFor="rows">Rows:</label>
        <input
          type="number"
          id="rows"
          min="3"
          max="100"
          value={rows}
          onChange={(e) => handleChange('rows', e.target.value)}
        />
      </div>
      <div className="size-control">
        <label htmlFor="cols">Columns:</label>
        <input
          type="number"
          id="cols"
          min="3"
          max="100"
          value={cols}
          onChange={(e) => handleChange('cols', e.target.value)}
        />
      </div>
    </div>
  );
};

export default GridSizeControls;
