export const calculateNextGeneration = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGen = Array(rows).fill().map(() => new Array(cols).fill(false));

  // Pre-calculate neighbor offsets
  const neighborOffsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let count = 0;
      
      // Count neighbors using pre-calculated offsets
      for (const [di, dj] of neighborOffsets) {
        const newRow = (i + di + rows) % rows;
        const newCol = (j + dj + cols) % cols;
        if (grid[newRow][newCol]) count++;
      }
      
      // Apply rules directly without function call overhead
      nextGen[i][j] = count === 3 || (grid[i][j] && count === 2);
    }
  }

  return nextGen;
};

export const generateRandomGrid = (rows, cols) => {
  return Array(rows).fill().map(() => 
    Array(cols).fill().map(() => Math.random() > 0.7)
  );
};
