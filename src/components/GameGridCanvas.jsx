import { useEffect, useRef, useCallback, useState } from 'react';
import '../styles/GameGridCanvas.css';

const CELL_SIZE = 20;
const CELL_PADDING = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const PAN_STEP = 50;
const ZOOM_STEP = 1.2;

const GameGridCanvas = ({ 
  grid, 
  rows = 30, 
  cols = 30, 
  onToggleCell, 
  isFullscreen, 
  showLegend 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [fps, setFPS] = useState(0);
  const prevCameraRef = useRef({ x: 0, y: 0, zoom: 1, grid: null });
  
  // Initialize camera to center of grid
  const [camera, setCamera] = useState(() => {
    const gridWidth = cols * CELL_SIZE;
    const gridHeight = rows * CELL_SIZE;
    return { 
      x: -(gridWidth / 2),  // Move grid left by half its width
      y: -(gridHeight / 2), // Move grid up by half its height
      zoom: 1.0  // Start at 100% zoom
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Reset view to center and fit grid
  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const gridWidth = cols * CELL_SIZE;
    const gridHeight = rows * CELL_SIZE;
    
    // Calculate zoom to fit grid in viewport
    const fitZoom = Math.min(
      width / gridWidth,
      height / gridHeight
    );
    
    setCamera({
      x: -(gridWidth / 2),
      y: -(gridHeight / 2),
      zoom: fitZoom
    });
  }, [rows, cols]);

  // Calculate visible area in grid coordinates
  const getVisibleArea = useCallback((canvasWidth, canvasHeight) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const viewWidth = rect.width / camera.zoom;
    const viewHeight = rect.height / camera.zoom;
    
    return {
      left: Math.floor(-camera.x / CELL_SIZE),
      top: Math.floor(-camera.y / CELL_SIZE),
      right: Math.ceil((-camera.x + viewWidth) / CELL_SIZE),
      bottom: Math.ceil((-camera.y + viewHeight) / CELL_SIZE)
    };
  }, [camera]);

  // Draw the grid
  const drawGrid = useCallback((ctx, canvasWidth, canvasHeight) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const start = performance.now();

    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);
    
    // Center and scale
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.translate(camera.x * camera.zoom, camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);
    
    // Draw grid background
    const gridWidth = cols * CELL_SIZE;
    const gridHeight = rows * CELL_SIZE;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, gridWidth, gridHeight);
    
    // Draw cells
    ctx.fillStyle = '#4CAF50';
    let activeCount = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i]) {
        activeCount++;
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.fillRect(
          col * CELL_SIZE + CELL_PADDING,
          row * CELL_SIZE + CELL_PADDING,
          CELL_SIZE - CELL_PADDING * 2,
          CELL_SIZE - CELL_PADDING * 2
        );
      }
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1 / camera.zoom;
    
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, gridHeight);
      ctx.stroke();
    }
    
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(gridWidth, i * CELL_SIZE);
      ctx.stroke();
    }
    
    ctx.restore();

    const elapsed = performance.now() - start;
    // console.log(`Grid draw time: ${elapsed.toFixed(2)}ms`);
  }, [camera.zoom, camera.x, camera.y, grid, cols, rows]);

  // Initialize canvas and handle resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      resetView();
    };

    // Initial size
    updateCanvasSize();

    // Handle window resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [resetView]);

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

  // Add wheel event listener with non-passive option
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setCamera(prev => ({
        ...prev,
        zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * zoomFactor))
      }));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handleClick = useCallback((event) => {
    if (event.button !== 0) return; // Only handle left click
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Get click position relative to canvas center
    const canvasX = event.clientX - rect.left - width / 2;
    const canvasY = event.clientY - rect.top - height / 2;
    
    // Convert to grid coordinates
    const gridX = (canvasX / camera.zoom) - camera.x;
    const gridY = (canvasY / camera.zoom) - camera.y;
    
    const col = Math.floor(gridX / CELL_SIZE);
    const row = Math.floor(gridY / CELL_SIZE);
    
    // Ensure coordinates are within bounds
    if(col < 0 || col >= cols || row < 0 || row >= rows) 
      return;
    
    onToggleCell(row, col);
  }, [camera.zoom, camera.x, camera.y, cols, rows, onToggleCell]);

  // Draw when grid or camera changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    drawGrid(ctx, rect.width, rect.height);
  }, [drawGrid, grid, camera]);

  // Update FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      
      if (elapsed >= 1000) {
        setFPS(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const animationId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

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
      />
      {showLegend && (
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
      )}
    </div>
  );
};

export default GameGridCanvas;
