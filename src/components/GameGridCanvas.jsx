import { useEffect, useRef, useCallback } from 'react';
import '../styles/GameGridCanvas.css';

const CELL_SIZE = 20;
const CELL_PADDING = 1;

const GameGridCanvas = ({ grid, onToggleCell }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const width = grid[0].length * CELL_SIZE;
  const height = grid.length * CELL_SIZE;

  // Draw the entire grid
  const drawGrid = useCallback((ctx, canvasWidth, canvasHeight) => {
    const scaleX = canvasWidth / width;
    const scaleY = canvasHeight / height;
    const scale = Math.min(scaleX, scaleY);
    
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Center the grid
    const offsetX = (canvasWidth - width * scale) / 2;
    const offsetY = (canvasHeight - height * scale) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Draw cell background
        ctx.fillStyle = grid[row][col] ? '#4CAF50' : '#1a1a1a';
        ctx.fillRect(
          x + CELL_PADDING,
          y + CELL_PADDING,
          CELL_SIZE - CELL_PADDING * 2,
          CELL_SIZE - CELL_PADDING * 2
        );
      }
    }
    ctx.restore();
  }, [grid, width, height]);

  // Initialize canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Set canvas size to match container while maintaining aspect ratio
      const containerAspect = containerWidth / containerHeight;
      const gridAspect = width / height;
      
      let canvasWidth, canvasHeight;
      if (containerAspect > gridAspect) {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * gridAspect;
      } else {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / gridAspect;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Enable crisp pixels
      ctx.imageSmoothingEnabled = false;
      
      // Draw grid
      drawGrid(ctx, canvasWidth, canvasHeight);
    };

    // Initial size update
    updateCanvasSize();

    // Handle window resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [width, height, drawGrid]);

  // Handle mouse/touch interaction
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    let x, y;
    if (event.type.startsWith('touch')) {
      const touch = event.touches[0] || event.changedTouches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      x = (event.clientX - rect.left) * scaleX;
      y = (event.clientY - rect.top) * scaleY;
    }

    const row = Math.floor(y / CELL_SIZE);
    const col = Math.floor(x / CELL_SIZE);

    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      onToggleCell(row, col);
    }
  }, [grid, onToggleCell, width, height]);

  return (
    <div ref={containerRef} className="game-grid-container">
      <canvas
        ref={canvasRef}
        className="game-grid-canvas"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
    </div>
  );
};

export default GameGridCanvas;
