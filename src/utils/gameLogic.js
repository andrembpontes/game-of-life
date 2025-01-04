export const calculateNextGeneration = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGen = Array(rows).fill().map(() => Array(cols).fill(false));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors = countNeighbors(grid, i, j);
      
      if (grid[i][j]) { // Live cell
        nextGen[i][j] = neighbors === 2 || neighbors === 3;
      } else { // Dead cell
        nextGen[i][j] = neighbors === 3;
      }
    }
  }

  return nextGen;
};

const countNeighbors = (grid, row, col) => {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  // Check all 8 neighbors, including wrapping around edges
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      // Calculate wrapped coordinates
      let newRow = row + i;
      let newCol = col + j;
      
      // Handle wrapping
      if (newRow < 0) newRow = rows - 1;
      if (newRow >= rows) newRow = 0;
      if (newCol < 0) newCol = cols - 1;
      if (newCol >= cols) newCol = 0;
      
      if (grid[newRow][newCol]) {
        count++;
      }
    }
  }

  return count;
};

export const generateRandomGrid = (rows, cols) => {
  return Array(rows).fill().map(() => 
    Array(cols).fill().map(() => Math.random() > 0.7)
  );
};
