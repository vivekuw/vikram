import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Thruster Engine Exhaust Visual Component.
 * Dynamically scales flame geometry & light intensity based on ACTUAL thrust ratio (0.0 to 1.0).
 * Completely turns OFF (opacity = 0) when actual thrust is 0 (or fuel is depleted).
 *
 * @param {number} actualThrustRatio - Actual thrust normalized ratio (0.0 to 1.0)
 */
export function EngineEffect({ actualThrustRatio = 0 }) {
  const flameRef = useRef();
  const flameLightRef = useRef();

  useFrame((state) => {
    const isActive = actualThrustRatio > 0.01;

    if (flameRef.current) {
      flameRef.current.visible = isActive;
      if (isActive) {
        // Pulse exhaust flicker effect
        const flicker = 1.0 + Math.sin(state.clock.elapsedTime * 40) * 0.15;
        const scaleY = actualThrustRatio * 1.5 * flicker;
        const scaleXZ = actualThrustRatio * 0.95;
        flameRef.current.scale.set(scaleXZ, scaleY, scaleXZ);
      }
    }

    if (flameLightRef.current) {
      flameLightRef.current.intensity = isActive ? actualThrustRatio * 5.0 : 0;
    }
  });

  return (
    <group position={[0, 0.05, 0]}>
      {/* Flame Glow Cone */}
      <mesh ref={flameRef} position={[0, -0.6, 0]}>
        <coneGeometry args={[0.55, 1.4, 16, 1, true]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Thruster Dynamic Light */}
      <pointLight
        ref={flameLightRef}
        color="#ffaa00"
        distance={14}
        decay={2}
        position={[0, -0.5, 0]}
      />
    </group>
  );
}
