import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import GameGridCanvas from './GameGridCanvas';

// Mock canvas context
const mockContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fillStyle: '#000',
  strokeStyle: '#000',
  lineWidth: 1,
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn()
};

// Mock performance.now
const mockPerformanceNow = jest.fn(() => 1000);

// Mock ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    // Trigger the callback with mock entries
    this.callback([{
      target: element,
      contentRect: {
        width: 800,
        height: 600
      }
    }]);
  }
  disconnect() {}
}

describe('GameGridCanvas', () => {
  const defaultProps = {
    grid: new Array(4).fill(false),
    rows: 2,
    cols: 2,
    onToggleCell: jest.fn(),
    isFullscreen: false,
    showLegend: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(mockPerformanceNow);

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return setTimeout(() => {
        cb(performance.now());
      }, 0);
    });

    // Mock ResizeObserver
    window.ResizeObserver = ResizeObserverMock;

    // Create a real canvas element
    const canvas = document.createElement('canvas');

    // Add mock methods
    canvas.getContext = jest.fn(() => mockContext);
    canvas.getBoundingClientRect = jest.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600
    }));

    // Set initial dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Mock createElement only for canvas
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return canvas;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('should render grid correctly', async () => {
    const { container, rerender } = render(<GameGridCanvas {...defaultProps} />);
    
    // Check if canvas exists
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Force render cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(<GameGridCanvas {...defaultProps} />);
        jest.runAllTimers();
      });
    }

    // Verify canvas was initialized
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);

    // Check if context methods were called
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.scale).toHaveBeenCalled();
    expect(mockContext.translate).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  test('should handle click events', async () => {
    const mockOnToggleCell = jest.fn();
    const { container, rerender } = render(
      <GameGridCanvas 
        {...defaultProps}
        onToggleCell={mockOnToggleCell}
      />
    );

    const canvas = container.querySelector('canvas');

    // Force render cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(
          <GameGridCanvas 
            {...defaultProps}
            onToggleCell={mockOnToggleCell}
          />
        );
        jest.runAllTimers();
      });
    }

    await act(async () => {
      fireEvent.click(canvas, {
        clientX: 400,
        clientY: 300
      });
      jest.runAllTimers();
    });

    expect(mockOnToggleCell).toHaveBeenCalled();
  });
});
