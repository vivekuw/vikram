import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle continuous keyboard input listening & event cleanup.
 * Prevents default page scroll for game keys and triggers hotkey handlers (R, C, F3).
 *
 * @param {Function} onReset - Callback when 'R' key is pressed
 * @param {Function} onToggleCamera - Callback when 'C' key is pressed
 * @param {Function} onToggleDebug - Callback when 'F3' or 'D' debug key is pressed
 */
export function useControls({ onReset, onToggleCamera, onToggleDebug, onToggleScanner, onToggleInspect, onTogglePause, enabled = true }) {
  const keysPressed = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    q: false,
    e: false,
  });

  useEffect(() => {
    if (!enabled) {
      keysPressed.current = { w: false, s: false, a: false, d: false, q: false, e: false };
      return;
    }
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const code = e.code;

      if (['w', 's', 'a', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'r', 'h', 'v', 'p'].includes(key)) {
        e.preventDefault();
      }

      // Vertical Main Engine Thrust (W / S)
      if (key === 'w') keysPressed.current.w = true;
      if (key === 's') keysPressed.current.s = true;

      // 3D Horizontal Directional Steering (A/D = Left/Right, Q/E or ArrowUp/ArrowDown = Forward/Backward)
      if (key === 'a' || key === 'arrowleft') keysPressed.current.a = true;
      if (key === 'd' || key === 'arrowright') keysPressed.current.d = true;
      if (key === 'q' || key === 'arrowup') keysPressed.current.q = true;
      if (key === 'e' || key === 'arrowdown') keysPressed.current.e = true;

      // Hotkeys
      if (key === 'p' && onTogglePause) {
        onTogglePause();
      }
      if (key === 'r' && onReset) {
        onReset();
      }
      if ((key === 'c' || key === 't') && onToggleCamera) {
        onToggleCamera();
      }
      if (key === 'h' && onToggleScanner) {
        onToggleScanner();
      }
      if (key === 'v' && onToggleInspect) {
        onToggleInspect();
      }
      if (code === 'F3' && onToggleDebug) {
        e.preventDefault();
        onToggleDebug();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keysPressed.current.w = false;
      if (key === 's') keysPressed.current.s = false;
      if (key === 'a' || key === 'arrowleft') keysPressed.current.a = false;
      if (key === 'd' || key === 'arrowright') keysPressed.current.d = false;
      if (key === 'q' || key === 'arrowup') keysPressed.current.q = false;
      if (key === 'e' || key === 'arrowdown') keysPressed.current.e = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onReset, onToggleCamera, onToggleDebug, onToggleScanner, onToggleInspect, onTogglePause]);

  const setControlState = (action, isPressed) => {
    if (action in keysPressed.current) {
      keysPressed.current[action] = isPressed;
    }
  };

  return { keysPressed, setControlState };
}
