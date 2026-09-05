import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VikramModel } from './VikramModel';
import { LunarDust } from './LunarDust';
import { getTerrainHeight } from '../game/terrain/terrainGenerator';

export function Lander({ landerRef, actualThrustRatio = 0, isInspectMode = false }) {
  const meshGroupRef = useRef();

  useFrame(() => {
    if (meshGroupRef.current && landerRef.current) {
      const { position, rotation } = landerRef.current;
      meshGroupRef.current.position.set(...position);
      meshGroupRef.current.rotation.set(...rotation);
    }
  });

  const [px, , pz] = landerRef.current?.position || [0, 180, 0];
  const groundY = getTerrainHeight(px, pz);

  return (
    <>
      <group ref={meshGroupRef}>
        {/* Stage 6 Realistic Vikram 3D Model with Fallback */}
        <VikramModel actualThrustRatio={actualThrustRatio} />

        {/* Debug Model Inspection Overlay (V key) */}
        {isInspectMode && (
          <group>
            {/* Bounding Box Box Representation */}
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[2.8, 2.6, 2.8]} />
              <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.7} />
            </mesh>

            {/* Center Origin Reference Marker */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#ff1744" />
            </mesh>

            {/* Engine Thrust Point Reference Marker */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>

            {/* Four Landing Foot Contact Points */}
            {[
              [1.48, -0.65, 1.48],
              [-1.48, -0.65, 1.48],
              [-1.48, -0.65, -1.48],
              [1.48, -0.65, -1.48],
            ].map((pt, i) => (
              <mesh key={`foot-inspect-${i}`} position={pt}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshBasicMaterial color="#00e676" />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* Surface Lunar Dust Effect Beneath Thrust Area */}
      <LunarDust
        landerRef={landerRef}
        actualThrustRatio={actualThrustRatio}
        groundY={groundY}
      />
    </>
  );
}
