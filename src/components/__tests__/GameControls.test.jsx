import { render, fireEvent } from '@testing-library/react';
import GameControls from '../GameControls';

describe('GameControls', () => {
  const mockHandlers = {
    onStart: jest.fn(),
    onStop: jest.fn(),
    onClear: jest.fn(),
    onRandom: jest.fn(),
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach(handler => handler.mockClear());
  });

  test('renders Start button when not running', () => {
    const { getByText } = render(
      <GameControls isRunning={false} {...mockHandlers} />
    );
    
    expect(getByText('Start')).toBeInTheDocument();
  });

  test('renders Stop button when running', () => {
    const { getByText } = render(
      <GameControls isRunning={true} {...mockHandlers} />
    );
    
    expect(getByText('Stop')).toBeInTheDocument();
  });

  test('calls correct handlers when buttons are clicked', () => {
    const { getByText } = render(
      <GameControls isRunning={false} {...mockHandlers} />
    );
    
    fireEvent.click(getByText('Start'));
    expect(mockHandlers.onStart).toHaveBeenCalled();

    fireEvent.click(getByText('Clear'));
    expect(mockHandlers.onClear).toHaveBeenCalled();

    fireEvent.click(getByText('Random'));
    expect(mockHandlers.onRandom).toHaveBeenCalled();
  });

  test('switches between Start and Stop buttons', () => {
    const { getByText, rerender } = render(
      <GameControls isRunning={false} {...mockHandlers} />
    );
    
    expect(getByText('Start')).toBeInTheDocument();
    
    rerender(<GameControls isRunning={true} {...mockHandlers} />);
    expect(getByText('Stop')).toBeInTheDocument();
  });
});
