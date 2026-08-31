import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LunarDust({ landerRef, actualThrustRatio = 0, groundY = 0 }) {
  const pointsRef = useRef();
  const count = 120; // Lightweight particle count for fast browser performance

  // Generate particle positions, velocities, and lifespans
  const { positions, particlesData } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const pData = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 8.0;
      pos[i * 3] = 0;
      pos[i * 3 + 1] = groundY + 0.1;
      pos[i * 3 + 2] = 0;

      pData.push({
        vx: Math.cos(angle) * speed,
        vy: 0.2 + Math.random() * 0.8,
        vz: Math.sin(angle) * speed,
        life: Math.random(),
        maxLife: 0.8 + Math.random() * 0.6,
      });
    }

    return { positions: pos, particlesData: pData };
  }, [count, groundY]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !landerRef.current) return;

    const [px, py, pz] = landerRef.current.position;
    const altitude = py - groundY - 3.5;
    const isDustActive = actualThrustRatio > 0.01 && altitude < 30.0 && altitude >= 0;

    pointsRef.current.visible = isDustActive;
    if (!isDustActive) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const intensity = (1.0 - Math.min(1.0, altitude / 30.0)) * actualThrustRatio;

    for (let i = 0; i < count; i++) {
      const p = particlesData[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        p.life = 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = (2.0 + Math.random() * 10.0) * intensity;
        p.vx = Math.cos(angle) * speed;
        p.vy = (0.2 + Math.random() * 1.2) * intensity;
        p.vz = Math.sin(angle) * speed;

        posAttr.setXYZ(i, px, groundY + 0.1, pz);
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
        size={2.4}
        color="#8c96a6"
        transparent
        opacity={0.45}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
