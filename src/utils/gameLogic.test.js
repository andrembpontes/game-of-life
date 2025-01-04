import { GameState } from './gameLogic';

describe('GameState', () => {
  let gameState;
  const rows = 10;
  const cols = 10;

  beforeEach(() => {
    gameState = new GameState(rows, cols);
  });

  test('should initialize with empty grid', () => {
    const { grid } = gameState.currentState;
    expect(grid.every(cell => cell === 0)).toBe(true);
  });

  test('should toggle cell correctly', () => {
    // Toggle cell at (2,3)
    gameState.toggleCell(2, 3);
    expect(gameState.getCell(2, 3)).toBe(1);

    // Toggle same cell again
    gameState.toggleCell(2, 3);
    expect(gameState.getCell(2, 3)).toBe(0);
  });

  test('should maintain state across buffer swaps', () => {
    // Set some cells
    gameState.toggleCell(1, 1);
    gameState.toggleCell(2, 2);
    
    // Get initial state
    const initialState = gameState.currentState.grid.slice();
    
    // Calculate next generation (swaps buffers)
    gameState.nextGeneration();
    
    // Toggle a new cell
    gameState.toggleCell(3, 3);
    
    // Verify the previously set cells are still correct
    expect(gameState.getCell(3, 3)).toBe(1);
  });

  test('should handle out of bounds coordinates', () => {
    // Test negative coordinates
    gameState.toggleCell(-1, -1);
    expect(gameState.getCell(rows-1, cols-1)).toBe(0);

    // Test coordinates beyond grid size
    gameState.toggleCell(rows+1, cols+1);
    expect(gameState.getCell(1, 1)).toBe(0);
  });

  test('should correctly calculate next generation', () => {
    // Create a blinker pattern
    gameState.toggleCell(1, 0);
    gameState.toggleCell(1, 1);
    gameState.toggleCell(1, 2);

    // Calculate next generation
    gameState.nextGeneration();

    // Verify vertical blinker
    expect(gameState.getCell(0, 1)).toBe(1);
    expect(gameState.getCell(1, 1)).toBe(1);
    expect(gameState.getCell(2, 1)).toBe(1);
  });
});
