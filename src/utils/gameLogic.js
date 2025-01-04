// Convert 2D coordinates to 1D index
const getIndex = (row, cols, col) => row * cols + col;

// Create a new game state with double buffering
export class GameState {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.size = rows * cols;
    // Create two buffers for double buffering
    this.buffers = [
      new Uint8Array(this.size),
      new Uint8Array(this.size)
    ];
    this.currentBuffer = 0;
    this.version = 0;
  }

  // Get current state
  get currentState() {
    return {
      grid: this.buffers[this.currentBuffer],
      version: this.version,
      rows: this.rows,
      cols: this.cols
    };
  }

  // Get cell value
  getCell(row, col) {
    return this.buffers[this.currentBuffer][getIndex(row, this.cols, col)];
  }

  // Set cell value
  setCell(row, col, value) {
    this.buffers[this.currentBuffer][getIndex(row, this.cols, col)] = value ? 1 : 0;
    this.version++;
  }

  // Toggle cell value
  toggleCell(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      console.warn('Invalid cell coordinates:', row, col);
      return this.currentState;
    }

    const idx = getIndex(row, this.cols, col);
    console.log('Toggling cell at index:', idx, 'current value:', this.buffers[this.currentBuffer][idx]);
    
    // Toggle in both buffers to maintain state
    const newValue = this.buffers[this.currentBuffer][idx] ? 0 : 1;
    this.buffers[0][idx] = newValue;
    this.buffers[1][idx] = newValue;
    
    this.version++;
    return this.currentState;
  }

  // Calculate next generation
  nextGeneration() {
    const currentBuf = this.buffers[this.currentBuffer];
    const nextBuf = this.buffers[this.currentBuffer ^ 1];
    const rows = this.rows;
    const cols = this.cols;

    let prevRowStart, currentRowStart, nextRowStart;
    for (let row = 0; row < rows; row++) {
      prevRowStart = row === 0 ? (rows - 1) * cols : (row - 1) * cols;
      currentRowStart = row * cols;
      nextRowStart = row === rows - 1 ? 0 : (row + 1) * cols;

      for (let col = 0; col < cols; col++) {
        const prevCol = col === 0 ? cols - 1 : col - 1;
        const nextCol = col === cols - 1 ? 0 : col + 1;

        // Count neighbors using direct indices
        const count = 
          currentBuf[prevRowStart + prevCol] +
          currentBuf[prevRowStart + col] +
          currentBuf[prevRowStart + nextCol] +
          currentBuf[currentRowStart + prevCol] +
          currentBuf[currentRowStart + nextCol] +
          currentBuf[nextRowStart + prevCol] +
          currentBuf[nextRowStart + col] +
          currentBuf[nextRowStart + nextCol];

        // Apply rules directly
        const idx = currentRowStart + col;
        nextBuf[idx] = count === 3 || (currentBuf[idx] && count === 2) ? 1 : 0;
      }
    }

    // Swap buffers
    this.currentBuffer ^= 1;
    this.version++;
    return this.currentState;
  }

  // Generate random state
  randomize() {
    const buffer = this.buffers[this.currentBuffer];
    for (let i = 0; i < this.size; i++) {
      buffer[i] = Math.random() < 0.3 ? 1 : 0;
    }
    // Copy to other buffer
    this.buffers[this.currentBuffer ^ 1].set(buffer);
    this.version++;
    return this.currentState;
  }

  // Clear the grid
  clear() {
    this.buffers[0].fill(0);
    this.buffers[1].fill(0);
    this.version++;
    return this.currentState;
  }
}

// Helper function to create a new game state
export const createGameState = (rows, cols) => {
  const gameState = new GameState(rows, cols);
  gameState.randomize();
  return gameState;
};

export function calculateNextGeneration(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGen = Array(rows).fill().map(() => Array(cols).fill(false));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let liveNeighbors = 0;

      // Count live neighbors (including wrapping)
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          
          const neighborRow = (row + i + rows) % rows;
          const neighborCol = (col + j + cols) % cols;
          
          if (grid[neighborRow][neighborCol]) {
            liveNeighbors++;
          }
        }
      }

      // Apply Conway's Game of Life rules
      if (grid[row][col]) {
        // Live cell
        nextGen[row][col] = liveNeighbors === 2 || liveNeighbors === 3;
      } else {
        // Dead cell
        nextGen[row][col] = liveNeighbors === 3;
      }
    }
  }

  return nextGen;
}

export function generateRandomGrid(rows, cols) {
  return Array(rows).fill().map(() => 
    Array(cols).fill().map(() => Math.random() > 0.5)
  );
}
