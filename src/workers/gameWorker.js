// Pre-calculate neighbor offsets
const NEIGHBOR_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

class GameOfLife {
  constructor(rows, cols) {
    // Create two buffers for double buffering
    this.rows = rows;
    this.cols = cols;
    this.size = rows * cols;
    this.currentBuffer = new Uint8Array(this.size);
    this.nextBuffer = new Uint8Array(this.size);
    
    // Pre-calculate neighbor indices for each cell
    this.neighborIndices = new Int32Array(this.size * 8);
    this.calculateNeighborIndices();
  }

  calculateNeighborIndices() {
    let index = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cellIndex = i * this.cols + j;
        
        // Calculate and store neighbor indices for this cell
        for (const [di, dj] of NEIGHBOR_OFFSETS) {
          const newRow = (i + di + this.rows) % this.rows;
          const newCol = (j + dj + this.cols) % this.cols;
          this.neighborIndices[cellIndex * 8 + index % 8] = newRow * this.cols + newCol;
          index++;
        }
      }
    }
  }

  setGrid(grid) {
    // Convert 2D array to Uint8Array
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.currentBuffer[i * this.cols + j] = grid[i][j] ? 1 : 0;
      }
    }
  }

  getGrid() {
    // Convert Uint8Array back to 2D array
    const grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        grid[i][j] = this.currentBuffer[i * this.cols + j] === 1;
      }
    }
    return grid;
  }

  nextGeneration() {
    for (let i = 0; i < this.size; i++) {
      let neighbors = 0;
      
      // Count neighbors using pre-calculated indices
      for (let n = 0; n < 8; n++) {
        neighbors += this.currentBuffer[this.neighborIndices[i * 8 + n]];
      }
      
      // Apply rules
      this.nextBuffer[i] = neighbors === 3 || (this.currentBuffer[i] === 1 && neighbors === 2) ? 1 : 0;
    }

    // Swap buffers
    [this.currentBuffer, this.nextBuffer] = [this.nextBuffer, this.currentBuffer];
    
    return this.getGrid();
  }
}

// Web Worker message handler
self.onmessage = function(e) {
  const { type, rows, cols, grid } = e.data;
  
  if (type === 'init') {
    self.game = new GameOfLife(rows, cols);
    self.game.setGrid(grid);
    self.postMessage({ type: 'initialized' });
  } else if (type === 'next') {
    const nextGrid = self.game.nextGeneration();
    self.postMessage({ type: 'next', grid: nextGrid });
  }
};
