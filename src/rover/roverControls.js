import { useEffect, useRef } from 'react';

/**
 * Key controls hook for Pragyan Rover.
 * WASD & Arrow Keys for driving/steering.
 * Space: Brake.
 * C: Camera cycle (edge triggered on keydown).
 * E: Science interact. M: Toggle Map. P: Pause. R: Restart.
 */
export function useRoverControls({
  onInteract,
  onCycleCamera,
  onToggleMap,
  onTogglePause,
  onRestart,
  enabled = true,
}) {
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  // Track key press state for edge detection (e.g. C key)
  const edgeKeysRef = useRef({
    c: false,
    e: false,
    m: false,
    p: false,
    r: false,
  });

  useEffect(() => {
    if (!enabled) {
      // Clear keys when disabled
      keysRef.current = { forward: false, backward: false, left: false, right: false, brake: false };
      return;
    }

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;
      const key = e.key.toLowerCase();

      // Driving & Steering Inputs (WASD + Arrow Keys)
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = true;
      if (code === 'Space') keysRef.current.brake = true;

      // Single Trigger Edge Detection Keys
      if (key === 'c' && !edgeKeysRef.current.c) {
        edgeKeysRef.current.c = true;
        if (onCycleCamera) onCycleCamera();
      }

      if (key === 'e' && !edgeKeysRef.current.e) {
        edgeKeysRef.current.e = true;
        if (onInteract) onInteract();
      }

      if (key === 'm' && !edgeKeysRef.current.m) {
        edgeKeysRef.current.m = true;
        if (onToggleMap) onToggleMap();
      }

      if (key === 'p' && !edgeKeysRef.current.p) {
        edgeKeysRef.current.p = true;
        if (onTogglePause) onTogglePause();
      }

      if (key === 'r' && !edgeKeysRef.current.r) {
        edgeKeysRef.current.r = true;
        if (onRestart) onRestart();
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = false;
      if (code === 'Space') keysRef.current.brake = false;

      // Clear Edge Trigger Flags
      if (key === 'c') edgeKeysRef.current.c = false;
      if (key === 'e') edgeKeysRef.current.e = false;
      if (key === 'm') edgeKeysRef.current.m = false;
      if (key === 'p') edgeKeysRef.current.p = false;
      if (key === 'r') edgeKeysRef.current.r = false;
    };

    const handleBlur = () => {
      // Clear all active keys on window blur to prevent stuck keys
      keysRef.current = { forward: false, backward: false, left: false, right: false, brake: false };
      edgeKeysRef.current = { c: false, e: false, m: false, p: false, r: false };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, onInteract, onCycleCamera, onToggleMap, onTogglePause, onRestart]);

  return keysRef;
}
