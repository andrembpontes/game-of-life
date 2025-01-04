export const calculateNextGeneration = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGen = grid.map(arr => [...arr]);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors = countNeighbors(grid, i, j);
      
      if (grid[i][j]) { // Live cell
        if (neighbors < 2 || neighbors > 3) {
          nextGen[i][j] = false; // Dies
        }
      } else { // Dead cell
        if (neighbors === 3) {
          nextGen[i][j] = true; // Becomes alive
        }
      }
    }
  }

  return nextGen;
};

const countNeighbors = (grid, row, col) => {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = (row + i + rows) % rows;
      const newCol = (col + j + cols) % cols;
      
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
