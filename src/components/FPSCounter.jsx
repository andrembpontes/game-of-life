import { useState, useEffect, useRef } from 'react';
import '../styles/FPSCounter.css';

const FPSCounter = () => {
  const [fps, setFPS] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef();

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;

      if (elapsed >= 1000) {
        setFPS(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrameId.current = requestAnimationFrame(updateFPS);
    };

    updateFPS();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="fps-counter">
      FPS: {fps}
    </div>
  );
};

export default FPSCounter;
