import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainEngine } from '../game/terrain/terrainGenerator';

/**
 * 3D Dynamic Wheel Dust Spray Particle System
 * Emits lunar regolith particles from Pragyan's 6 spinning wheels when driving or slipping.
 */
export function RoverDustParticles({ roverRef }) {
  const pointsRef = useRef();
  const count = 180; // Total dust particles for wheels

  const { positions, particlesData } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const pData = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -10; // hidden initially
      pos[i * 3 + 2] = 0;

      pData.push({
        vx: 0,
        vy: 0,
        vz: 0,
        life: 1.0,
        maxLife: 0.4 + Math.random() * 0.4,
        wheelIndex: i % 6,
      });
    }

    return { positions: pos, particlesData: pData };
  }, [count]);

  // Relative wheel offsets from rover center
  const wheelOffsets = useMemo(
    () => [
      [-0.4, -0.4], // Front Left
      [0.4, -0.4],  // Front Right
      [-0.4, 0],    // Mid Left
      [0.4, 0],     // Mid Right
      [-0.4, 0.4],  // Rear Left
      [0.4, 0.4],   // Rear Right
    ],
    []
  );

  useFrame((_, delta) => {
    if (!pointsRef.current || !roverRef.current) return;

    const current = roverRef.current;
    const [rx, ry, rz] = current.position || [0, 0.35, 0];
    const heading = current.heading || Math.PI;
    const velocity = current.velocity || 0;
    const slipRatio = current.slipRatio || 0;
    const isDriving = current.isDriving || Math.abs(velocity) > 0.02 || slipRatio > 0.05;

    const intensity = Math.min(1.0, Math.abs(velocity) / 1.5 + slipRatio * 1.5);

    pointsRef.current.visible = isDriving;
    if (!isDriving) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const sinH = Math.sin(heading);
    const cosH = Math.cos(heading);

    // Rover forward & right vectors
    const fx = -sinH;
    const fz = -cosH;
    const rxVec = cosH;
    const rzVec = -sinH;

    for (let i = 0; i < count; i++) {
      const p = particlesData[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        p.life = 0;
        const offset = wheelOffsets[p.wheelIndex];
        // Calculate world pos of target wheel
        const wx = rx + rxVec * offset[0] - fx * offset[1];
        const wz = rz + rzVec * offset[0] - fz * offset[1];
        const wy = terrainEngine.getTerrainHeight(wx, wz) + 0.05;

        // Dust spray direction: kicked backward + random outward scatter
        const speed = (0.8 + Math.random() * 2.5) * intensity;
        const scatter = (Math.random() - 0.5) * 1.2;

        p.vx = -fx * speed + rxVec * scatter;
        p.vy = (0.2 + Math.random() * 0.8) * intensity;
        p.vz = -fz * speed + rzVec * scatter;

        posAttr.setXYZ(i, wx, wy, wz);
      } else {
        const curX = posAttr.getX(i) + p.vx * delta;
        const curY = posAttr.getY(i) + p.vy * delta;
        const curZ = posAttr.getZ(i) + p.vz * delta;

        posAttr.setXYZ(i, curX, curY, curZ);
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
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
        size={1.8}
        color="#a0abba"
        transparent
        opacity={0.5}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
