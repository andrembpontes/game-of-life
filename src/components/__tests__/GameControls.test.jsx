import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GameControls from '../GameControls';

describe('GameControls', () => {
  const mockHandlers = {
    onToggleRunning: jest.fn(),
    onReset: jest.fn(),
    onClear: jest.fn(),
    onToggleMute: jest.fn(),
    onToggleFullscreen: jest.fn(),
    onToggleLegend: jest.fn(),
  };

  const defaultProps = {
    isRunning: false,
    isMuted: false,
    isFullscreen: false,
    showLegend: true,
    ...mockHandlers
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Start button when not running', () => {
    const { getByText } = render(
      <GameControls {...defaultProps} />
    );
    
    const startButton = getByText(/Start/);
    expect(startButton).toBeInTheDocument();
  });

  test('renders Pause button when running', () => {
    const { getByText } = render(
      <GameControls {...defaultProps} isRunning={true} />
    );
    
    const pauseButton = getByText(/Pause/);
    expect(pauseButton).toBeInTheDocument();
  });

  test('calls correct handlers when buttons are clicked', () => {
    const { getByText } = render(
      <GameControls {...defaultProps} />
    );
    
    const startButton = getByText(/Start/);
    fireEvent.click(startButton);
    expect(mockHandlers.onToggleRunning).toHaveBeenCalled();

    const clearButton = getByText(/Clear/);
    fireEvent.click(clearButton);
    expect(mockHandlers.onClear).toHaveBeenCalled();

    const resetButton = getByText(/Reset/);
    fireEvent.click(resetButton);
    expect(mockHandlers.onReset).toHaveBeenCalled();

    const muteButton = getByText(/Mute/);
    fireEvent.click(muteButton);
    expect(mockHandlers.onToggleMute).toHaveBeenCalled();

    const fullscreenButton = getByText(/Fullscreen/);
    fireEvent.click(fullscreenButton);
    expect(mockHandlers.onToggleFullscreen).toHaveBeenCalled();

    const overlayButton = getByText(/Hide Overlay/);
    fireEvent.click(overlayButton);
    expect(mockHandlers.onToggleLegend).toHaveBeenCalled();
  });

  test('switches between Start and Pause buttons', () => {
    const { getByText, rerender } = render(
      <GameControls {...defaultProps} />
    );
    
    const startButton = getByText(/Start/);
    expect(startButton).toBeInTheDocument();
    
    rerender(<GameControls {...defaultProps} isRunning={true} />);
    const pauseButton = getByText(/Pause/);
    expect(pauseButton).toBeInTheDocument();
  });
});
