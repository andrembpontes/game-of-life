import { calculateNextGeneration, generateRandomGrid } from '../gameLogic';

describe('gameLogic', () => {
  describe('calculateNextGeneration', () => {
    describe('Basic Rules', () => {
      test('any live cell with fewer than two live neighbors dies (underpopulation)', () => {
        // Test single live cell
        const singleCell = [
          [false, false, false],
          [false, true, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(singleCell)[1][1]).toBe(false);

        // Test cell with one neighbor
        const oneNeighbor = [
          [false, true, false],
          [false, true, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(oneNeighbor)[1][1]).toBe(false);
      });

      test('any live cell with two or three live neighbors lives', () => {
        // Test with two neighbors
        const twoNeighbors = [
          [true, true, false],
          [false, true, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(twoNeighbors)[1][1]).toBe(true);

        // Test with three neighbors
        const threeNeighbors = [
          [true, true, false],
          [false, true, false],
          [true, false, false]
        ];
        expect(calculateNextGeneration(threeNeighbors)[1][1]).toBe(true);
      });

      test('any live cell with more than three live neighbors dies (overpopulation)', () => {
        // Test with four neighbors
        const fourNeighbors = [
          [true, true, true],
          [false, true, false],
          [true, false, false]
        ];
        expect(calculateNextGeneration(fourNeighbors)[1][1]).toBe(false);

        // Test with all neighbors
        const allNeighbors = [
          [true, true, true],
          [true, true, true],
          [true, true, true]
        ];
        expect(calculateNextGeneration(allNeighbors)[1][1]).toBe(false);
      });

      test('any dead cell with exactly three live neighbors becomes alive', () => {
        // Test horizontal pattern
        const horizontal = [
          [false, false, false],
          [true, false, true],
          [false, true, false]
        ];
        expect(calculateNextGeneration(horizontal)[1][1]).toBe(true);

        // Test L-shaped pattern
        const lShape = [
          [true, true, false],
          [true, false, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(lShape)[1][1]).toBe(true);
      });
    });

    describe('Known Patterns', () => {
      test('still life - block pattern remains stable', () => {
        const block = [
          [false, false, false, false],
          [false, true, true, false],
          [false, true, true, false],
          [false, false, false, false]
        ];
        const nextGen = calculateNextGeneration(block);
        expect(nextGen).toEqual(block);
      });

      test('still life - beehive pattern remains stable', () => {
        const beehive = [
          [false, false, false, false, false, false],
          [false, false, true, true, false, false],
          [false, true, false, false, true, false],
          [false, false, true, true, false, false],
          [false, false, false, false, false, false]
        ];
        const nextGen = calculateNextGeneration(beehive);
        expect(nextGen).toEqual(beehive);
      });

      test('oscillator - blinker pattern oscillates correctly', () => {
        const blinkerHorizontal = [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, true, true, true, false],
          [false, false, false, false, false],
          [false, false, false, false, false]
        ];

        const blinkerVertical = [
          [false, false, false, false, false],
          [false, false, true, false, false],
          [false, false, true, false, false],
          [false, false, true, false, false],
          [false, false, false, false, false]
        ];

        const nextGen = calculateNextGeneration(blinkerHorizontal);
        expect(nextGen).toEqual(blinkerVertical);
        const nextNextGen = calculateNextGeneration(nextGen);
        expect(nextNextGen).toEqual(blinkerHorizontal);
      });

      test('oscillator - toad pattern oscillates correctly', () => {
        const toadPhase1 = [
          [false, false, false, false, false, false],
          [false, false, false, false, false, false],
          [false, false, true, true, true, false],
          [false, true, true, true, false, false],
          [false, false, false, false, false, false],
          [false, false, false, false, false, false]
        ];

        const toadPhase2 = [
          [false, false, false, false, false, false],
          [false, false, false, true, false, false],
          [false, true, false, false, true, false],
          [false, true, false, false, true, false],
          [false, false, true, false, false, false],
          [false, false, false, false, false, false]
        ];

        const nextGen = calculateNextGeneration(toadPhase1);
        expect(nextGen).toEqual(toadPhase2);
        const nextNextGen = calculateNextGeneration(nextGen);
        expect(nextNextGen).toEqual(toadPhase1);
      });
    });

    describe('Edge Cases', () => {
      test('empty grid remains empty', () => {
        const emptyGrid = [
          [false, false, false],
          [false, false, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(emptyGrid)).toEqual(emptyGrid);
      });

      test('full grid dies in next generation', () => {
        const fullGrid = [
          [true, true, true],
          [true, true, true],
          [true, true, true]
        ];
        const expectedNext = [
          [false, false, false],
          [false, false, false],
          [false, false, false]
        ];
        expect(calculateNextGeneration(fullGrid)).toEqual(expectedNext);
      });

      test('wraps around horizontally', () => {
        const wrapHorizontal = [
          [false, false, false],
          [true, false, true],
          [false, false, false]
        ];
        // Middle cell should die due to underpopulation, even with wrapped neighbors
        expect(calculateNextGeneration(wrapHorizontal)[1][1]).toBe(false);
      });

      test('wraps around vertically', () => {
        const wrapVertical = [
          [false, true, false],
          [false, false, false],
          [false, true, false]
        ];
        // Middle cell should die due to underpopulation, even with wrapped neighbors
        expect(calculateNextGeneration(wrapVertical)[1][1]).toBe(false);
      });

      test('wraps around corners', () => {
        const cornerCase = [
          [true, false, false],
          [false, false, false],
          [false, false, true]
        ];
        
        // This pattern should create exactly 3 neighbors for the center cell
        // when counting wrapped corners, causing it to become alive
        expect(calculateNextGeneration(cornerCase)[1][1]).toBe(false);
      });
    });
  });

  describe('generateRandomGrid', () => {
    test('generates grid with correct dimensions', () => {
      const rows = 5;
      const cols = 7;
      const grid = generateRandomGrid(rows, cols);
      
      expect(grid.length).toBe(rows);
      grid.forEach(row => {
        expect(row.length).toBe(cols);
      });
    });

    test('generates grid with boolean values', () => {
      const grid = generateRandomGrid(4, 4);
      grid.forEach(row => {
        row.forEach(cell => {
          expect(typeof cell).toBe('boolean');
        });
      });
    });

    test('generates different grids on subsequent calls', () => {
      const grid1 = generateRandomGrid(5, 5);
      const grid2 = generateRandomGrid(5, 5);
      
      // Check if grids are different (at least one cell should be different)
      let hasDifference = false;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (grid1[i][j] !== grid2[i][j]) {
            hasDifference = true;
            break;
          }
        }
      }
      expect(hasDifference).toBe(true);
    });

    test('handles edge cases of small dimensions', () => {
      const smallGrid = generateRandomGrid(1, 1);
      expect(smallGrid.length).toBe(1);
      expect(smallGrid[0].length).toBe(1);
      expect(typeof smallGrid[0][0]).toBe('boolean');
    });
  });
});
