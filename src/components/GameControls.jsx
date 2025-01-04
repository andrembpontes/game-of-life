import { memo } from 'react';
import '../styles/GameControls.css';

const GameControls = memo(({ 
  isRunning, 
  isMuted, 
  isFullscreen,
  onToggleRunning, 
  onReset, 
  onClear, 
  onToggleMute,
  onToggleFullscreen 
}) => {
  return (
    <div className="game-controls">
      <button onClick={onToggleRunning}>
        {isRunning ? 'Pause' : 'Start'} (Space)
      </button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onClear}>Clear</button>
      <button onClick={onToggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={onToggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
      </button>
    </div>
  );
});

GameControls.displayName = 'GameControls';

export default GameControls;
