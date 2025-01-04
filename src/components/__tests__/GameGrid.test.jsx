import { render, fireEvent } from '@testing-library/react';
import GameGrid from '../GameGrid';

describe('GameGrid', () => {
  const mockGrid = [
    [false, true],
    [true, false]
  ];
  const mockOnCellToggle = jest.fn();

  beforeEach(() => {
    mockOnCellToggle.mockClear();
  });

  test('renders correct number of cells', () => {
    const { container } = render(
      <GameGrid grid={mockGrid} onCellToggle={mockOnCellToggle} />
    );
    
    const cells = container.getElementsByClassName('grid-cell');
    expect(cells.length).toBe(4);
  });

  test('renders cells with correct alive/dead state', () => {
    const { container } = render(
      <GameGrid grid={mockGrid} onCellToggle={mockOnCellToggle} />
    );
    
    const cells = container.getElementsByClassName('grid-cell');
    expect(cells[0].classList.contains('alive')).toBe(false);
    expect(cells[1].classList.contains('alive')).toBe(true);
    expect(cells[2].classList.contains('alive')).toBe(true);
    expect(cells[3].classList.contains('alive')).toBe(false);
  });

  test('calls onCellToggle with correct coordinates when cell is clicked', () => {
    const { container } = render(
      <GameGrid grid={mockGrid} onCellToggle={mockOnCellToggle} />
    );
    
    const cells = container.getElementsByClassName('grid-cell');
    fireEvent.click(cells[0]);
    
    expect(mockOnCellToggle).toHaveBeenCalledWith(0, 0);
  });
});
