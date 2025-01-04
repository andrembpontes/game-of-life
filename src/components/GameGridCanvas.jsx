import { useEffect, useRef, useCallback, useState } from 'react';
import '../styles/GameGridCanvas.css';

const CELL_SIZE = 20;
const CELL_PADDING = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const PAN_STEP = 50;
const ZOOM_STEP = 1.2;

const GameGridCanvas = ({ grid, rows, cols, onToggleCell, isFullscreen }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const [fps, setFPS] = useState(0);
  const [camera, setCamera] = useState({ 
    x: 0, 
    y: 0, 
    zoom: 1 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  // Initialize camera to center the grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCamera(prev => ({
        ...prev,
        x: -width / 2,
        y: -height / 2
      }));
    }
  }, [width, height]);

  // Calculate visible area in grid coordinates
  const getVisibleArea = useCallback((canvasWidth, canvasHeight) => {
    const visibleLeft = Math.floor((-canvasWidth / 2 / camera.zoom - camera.x) / CELL_SIZE);
    const visibleTop = Math.floor((-canvasHeight / 2 / camera.zoom - camera.y) / CELL_SIZE);
    const visibleRight = Math.ceil((canvasWidth / 2 / camera.zoom - camera.x) / CELL_SIZE);
    const visibleBottom = Math.ceil((canvasHeight / 2 / camera.zoom - camera.y) / CELL_SIZE);

    return {
      left: Math.max(0, visibleLeft),
      top: Math.max(0, visibleTop),
      right: Math.min(cols, visibleRight),
      bottom: Math.min(rows, visibleBottom)
    };
  }, [camera, rows, cols]);

  // Draw the grid
  const drawGrid = useCallback((ctx, canvasWidth, canvasHeight) => {
    const startTime = performance.now();

    // Clear canvas with background color
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save context state and apply camera transform
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(camera.x, camera.y);

    // Get visible area
    const visible = getVisibleArea(canvasWidth, canvasHeight);

    // Draw visible grid background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(
      visible.left * CELL_SIZE,
      visible.top * CELL_SIZE,
      (visible.right - visible.left) * CELL_SIZE,
      (visible.bottom - visible.top) * CELL_SIZE
    );

    // Draw only visible cells
    ctx.fillStyle = '#4CAF50';
    for (let row = visible.top; row < visible.bottom; row++) {
      for (let col = visible.left; col < visible.right; col++) {
        if (grid[row * cols + col]) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          ctx.fillRect(
            x + CELL_PADDING,
            y + CELL_PADDING,
            CELL_SIZE - CELL_PADDING * 2,
            CELL_SIZE - CELL_PADDING * 2
          );
        }
      }
    }

    // Draw grid lines only when zoomed in enough
    if (camera.zoom > 0.5) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1 / camera.zoom;

      // Draw vertical grid lines
      for (let x = visible.left * CELL_SIZE; x <= visible.right * CELL_SIZE; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, visible.top * CELL_SIZE);
        ctx.lineTo(x, visible.bottom * CELL_SIZE);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let y = visible.top * CELL_SIZE; y <= visible.bottom * CELL_SIZE; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(visible.left * CELL_SIZE, y);
        ctx.lineTo(visible.right * CELL_SIZE, y);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Update FPS counter
    frameCountRef.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;
    
    if (elapsed >= 1000) {
      setFPS(Math.round((frameCountRef.current * 1000) / elapsed));
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }

    // Log rendering stats in development
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - startTime;
      console.debug(
        `Rendered ${(visible.right - visible.left) * (visible.bottom - visible.top)} cells in ${renderTime.toFixed(2)}ms`,
        `Visible area: ${visible.right - visible.left}x${visible.bottom - visible.top}`
      );
    }
  }, [camera, grid, getVisibleArea, cols]);

  // Reset view to center
  const resetView = useCallback(() => {
    setCamera({
      x: -width / 2,
      y: -height / 2,
      zoom: 1
    });
  }, [width, height]);

  // Initialize canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Enable crisp pixels
      ctx.imageSmoothingEnabled = false;
      
      // Draw grid
      drawGrid(ctx, containerWidth, containerHeight);
    };

    // Initial size update
    updateCanvasSize();

    // Handle window resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [drawGrid]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      const panLeft = () => setCamera(prev => ({ ...prev, x: prev.x + PAN_STEP / prev.zoom }));
      const panRight = () => setCamera(prev => ({ ...prev, x: prev.x - PAN_STEP / prev.zoom }));
      const panUp = () => setCamera(prev => ({ ...prev, y: prev.y + PAN_STEP / prev.zoom }));
      const panDown = () => setCamera(prev => ({ ...prev, y: prev.y - PAN_STEP / prev.zoom }));
      const zoomIn = () => setCamera(prev => ({ ...prev, zoom: Math.min(MAX_ZOOM, prev.zoom * ZOOM_STEP) }));
      const zoomOut = () => setCamera(prev => ({ ...prev, zoom: Math.max(MIN_ZOOM, prev.zoom / ZOOM_STEP) }));

      switch (e.key.toLowerCase()) {
        // Vim-style movement
        case 'h': panLeft(); break;
        case 'l': panRight(); break;
        case 'k': panUp(); break;
        case 'j': panDown(); break;
        // Arrow keys
        case 'arrowleft': panLeft(); break;
        case 'arrowright': panRight(); break;
        case 'arrowup': panUp(); break;
        case 'arrowdown': panDown(); break;
        // WASD movement
        case 'a': panLeft(); break;
        case 'd': panRight(); break;
        case 'w': panUp(); break;
        case 's': panDown(); break;
        // Zoom controls
        case 'i': zoomIn(); break;
        case 'o': zoomOut(); break;
        case '+': zoomIn(); break;
        case '-': zoomOut(); break;
        // Reset view
        case 'r': resetView(); break;
        default: return;
      }
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  // Handle mouse/touch interaction
  const handlePointerDown = useCallback((event) => {
    if (event.button === 1 || event.button === 2) { // Middle or right click for panning
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (isDragging) {
      const dx = (event.clientX - lastMousePos.x) / camera.zoom;
      const dy = (event.clientY - lastMousePos.y) / camera.zoom;
      setCamera(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  }, [isDragging, lastMousePos, camera.zoom]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * zoomFactor));
    
    setCamera(prev => ({
      ...prev,
      zoom: newZoom
    }));
  }, [camera.zoom]);

  const handleClick = useCallback((event) => {
    if (event.button !== 0) return; // Only handle left click

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (x - canvas.width / 2) / camera.zoom - camera.x;
    const worldY = (y - canvas.height / 2) / camera.zoom - camera.y;

    // Convert world coordinates to grid coordinates
    const col = Math.floor(worldX / CELL_SIZE);
    const row = Math.floor(worldY / CELL_SIZE);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      onToggleCell(row, col);
    }
  }, [camera, rows, cols, onToggleCell]);

  return (
    <div 
      ref={containerRef} 
      className={`game-grid-container ${isFullscreen ? 'fullscreen' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="game-grid-canvas"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
      />
      <div className="controls-overlay">
        <div className="performance-stats">
          <div>FPS: {fps}</div>
          <div>Zoom: {Math.round(camera.zoom * 100)}%</div>
        </div>
        <div className="controls-help">
          <div>Navigation:</div>
          <div>HJKL / Arrows / WASD - Pan</div>
          <div>I/O or +/- - Zoom in/out</div>
          <div>R - Reset view</div>
          <div>Mouse: Wheel to zoom, Right-click to pan</div>
        </div>
      </div>
    </div>
  );
};

export default GameGridCanvas;
