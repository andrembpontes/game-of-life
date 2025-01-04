import '../styles/GameControls.css';

const GameControls = ({ isRunning, onStart, onStop, onClear, onRandom }) => {
  return (
    <div className="game-controls">
      {!isRunning ? (
        <button onClick={onStart}>Start</button>
      ) : (
        <button onClick={onStop}>Stop</button>
      )}
      <button onClick={onClear}>Clear</button>
      <button onClick={onRandom}>Random</button>
    </div>
  );
};

export default GameControls;
