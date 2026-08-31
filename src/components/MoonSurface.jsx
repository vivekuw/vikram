import React, { useMemo } from 'react';
import { Terrain } from './Terrain';
import { Rocks } from './Rocks';

export function MoonSurface() {
  return (
    <group>
      {/* Stage 5 3D Heightmap Terrain */}
      <Terrain />

      {/* Low-Poly Instanced Rocks & Boulders */}
      <Rocks />

      {/* Starfield Background */}
      <Stars />
    </group>
  );
}

// Procedural starfield background component
function Stars() {
  const count = 1200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 350 + Math.random() * 100;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 10; // keep above horizon
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={1.5}
        color="#ffffff"
        sizeAttenuation={false}
        transparent
        opacity={0.85}
      />
    </points>
  );
}
