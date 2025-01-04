import '../styles/GameControls.css';

const GameControls = ({ isRunning, isMuted, onToggleRunning, onReset, onClear, onToggleMute }) => {
  return (
    <div className="game-controls">
      <button onClick={onToggleRunning}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={onReset}>
        Random
      </button>
      <button onClick={onClear}>
        Clear
      </button>
      <button onClick={onToggleMute} className={isMuted ? 'muted' : ''}>
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default GameControls;
