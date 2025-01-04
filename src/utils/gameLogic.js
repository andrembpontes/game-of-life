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

    // Pre-calculate neighbor offsets
    this.neighborOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
  }

  // Get current state
  get currentState() {
    return new Uint8Array(this.buffers[this.currentBuffer]);
  }

  // Get cell value
  getCell(row, col) {
    return this.buffers[this.currentBuffer][getIndex(row, this.cols, col)];
  }

  // Set cell value
  setCell(row, col, value) {
    this.buffers[this.currentBuffer][getIndex(row, this.cols, col)] = value ? 1 : 0;
  }

  // Toggle cell value
  toggleCell(row, col) {
    const idx = getIndex(row, this.cols, col);
    this.buffers[this.currentBuffer][idx] = this.buffers[this.currentBuffer][idx] ? 0 : 1;
    return this.currentState;
  }

  // Calculate next generation
  nextGeneration() {
    const currentBuf = this.buffers[this.currentBuffer];
    const nextBuf = this.buffers[this.currentBuffer ^ 1];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let count = 0;
        const idx = getIndex(row, this.cols, col);
        
        // Count neighbors using pre-calculated offsets
        for (const [di, dj] of this.neighborOffsets) {
          const newRow = (row + di + this.rows) % this.rows;
          const newCol = (col + dj + this.cols) % this.cols;
          count += currentBuf[getIndex(newRow, this.cols, newCol)];
        }
        
        // Apply rules
        nextBuf[idx] = (count === 3 || (currentBuf[idx] && count === 2)) ? 1 : 0;
      }
    }

    // Swap buffers
    this.currentBuffer ^= 1;
    return this.currentState;
  }

  // Generate random state
  randomize(probability = 0.3) {
    const state = this.buffers[this.currentBuffer];
    for (let i = 0; i < this.size; i++) {
      state[i] = Math.random() < probability ? 1 : 0;
    }
    return this.currentState;
  }

  // Clear the grid
  clear() {
    this.buffers[0].fill(0);
    this.buffers[1].fill(0);
    return this.currentState;
  }
}

// Helper function to create a new game state
export const createGameState = (rows, cols) => {
  const gameState = new GameState(rows, cols);
  gameState.randomize();
  return gameState;
};
