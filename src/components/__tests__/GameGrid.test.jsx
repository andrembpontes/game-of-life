import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GameGrid from '../GameGrid';

describe('GameGrid', () => {
  test('renders correct number of cells', () => {
    const grid = [
      [false, true],
      [true, false]
    ];
    
    const { container } = render(
      <GameGrid 
        grid={grid}
        onCellToggle={() => {}}
      />
    );
    
    const cells = container.querySelectorAll('[data-testid="grid-cell"]');
    expect(cells.length).toBe(4);
  });

  test('renders cells with correct alive/dead state', () => {
    const grid = [
      [false, true],
      [true, false]
    ];
    
    const { container } = render(
      <GameGrid 
        grid={grid}
        onCellToggle={() => {}}
      />
    );
    
    const cells = container.querySelectorAll('[data-testid="grid-cell"]');
    expect(cells[0].classList.contains('alive')).toBe(false);
    expect(cells[1].classList.contains('alive')).toBe(true);
    expect(cells[2].classList.contains('alive')).toBe(true);
    expect(cells[3].classList.contains('alive')).toBe(false);
  });

  test('calls onCellToggle with correct coordinates when cell is clicked', () => {
    const grid = [
      [false, false],
      [false, false]
    ];
    const mockOnCellToggle = jest.fn();
    
    const { container } = render(
      <GameGrid 
        grid={grid}
        onCellToggle={mockOnCellToggle}
      />
    );
    
    const cells = container.querySelectorAll('[data-testid="grid-cell"]');
    fireEvent.click(cells[0]);
    
    expect(mockOnCellToggle).toHaveBeenCalledWith(0, 0);
  });
});
