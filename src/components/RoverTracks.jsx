import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainEngine } from '../game/terrain/terrainGenerator';

/**
 * 3D Pragyan Tyre Tracks Component
 * Leaves continuous dual wheel trail depressions on the lunar regolith as the rover drives.
 */
export function RoverTracks({ roverRef }) {
  const maxPoints = 250; // max track segments
  const lineRef = useRef();

  const { positions, trackPoints } = useMemo(() => {
    const pos = new Float32Array(maxPoints * 2 * 3); // 2 lines (left & right) * 3 coords
    const points = [];
    return { positions: pos, trackPoints: points };
  }, [maxPoints]);

  const lastPosRef = useRef([0, 0, 0]);

  useFrame(() => {
    if (!lineRef.current || !roverRef.current) return;

    const current = roverRef.current;
    const [rx, , rz] = current.position || [0, 0, 0];
    const heading = current.heading || Math.PI;
    const isDriving = current.isDriving;

    // Minimum distance before recording new track point
    const distSq = (rx - lastPosRef.current[0]) ** 2 + (rz - lastPosRef.current[1]) ** 2;

    if (isDriving && distSq > 0.15) {
      lastPosRef.current = [rx, rz];

      const cosH = Math.cos(heading);
      const sinH = Math.sin(heading);
      const rightX = cosH * 0.4;
      const rightZ = -sinH * 0.4;

      const lx = rx - rightX;
      const lz = rz - rightZ;
      const ly = terrainEngine.getTerrainHeight(lx, lz) + 0.02;

      const rxPos = rx + rightX;
      const rzPos = rz + rightZ;
      const ryPos = terrainEngine.getTerrainHeight(rxPos, rzPos) + 0.02;

      trackPoints.push({ left: [lx, ly, lz], right: [rxPos, ryPos, rzPos] });
      if (trackPoints.length > maxPoints) {
        trackPoints.shift();
      }

      const posAttr = lineRef.current.geometry.attributes.position;
      for (let i = 0; i < trackPoints.length; i++) {
        const pt = trackPoints[i];
        // Left wheel track point
        posAttr.setXYZ(i * 2, pt.left[0], pt.left[1], pt.left[2]);
        // Right wheel track point
        posAttr.setXYZ(i * 2 + 1, pt.right[0], pt.right[1], pt.right[2]);
      }

      lineRef.current.geometry.setDrawRange(0, trackPoints.length * 2);
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={lineRef}>
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
        size={3.2}
        color="#2c3545"
        transparent
        opacity={0.7}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
