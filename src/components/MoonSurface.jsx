import React, { useMemo } from 'react';
import { Terrain } from './Terrain';
import { Rocks } from './Rocks';

export function MoonSurface() {
  return (
    <group>
      {/* 3D Heightmap Terrain */}
      <Terrain />

      {/* Low-Poly Instanced Rocks & Boulders */}
      <Rocks />

      {/* 3D Earth in Lunar Sky */}
      <EarthSky />

      {/* Dense Starfield & Deep Space Nebulae */}
      <Stars />
    </group>
  );
}

// 3D Earth Marble hanging in the lunar sky with atmospheric glow halo
function EarthSky() {
  return (
    <group position={[120, 180, -280]}>
      {/* Outer Blue Atmosphere Glow Halo */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#00b0ff" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* Main Earth Blue Marble Sphere */}
      <mesh>
        <sphereGeometry args={[18, 32, 32]} />
        <meshStandardMaterial color="#1e88e5" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Earth Continent Swirls (Stylized Procedural Overlay) */}
      <mesh scale={[1.002, 1.002, 1.002]}>
        <dodecahedronGeometry args={[18, 2]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} transparent opacity={0.7} />
      </mesh>

      {/* Cloud Swirl Layer */}
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[18, 24, 24]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Procedural starfield background component
function Stars() {
  const count = 1800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 380 + Math.random() * 120;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 12; // keep above horizon
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
        size={1.6}
        color="#e0f7fa"
        sizeAttenuation={false}
        transparent
        opacity={0.9}
      />
    </points>
  );
}
