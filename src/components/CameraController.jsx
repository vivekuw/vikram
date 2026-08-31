import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from '../game/terrain/terrainGenerator';

export function CameraController({ landerRef, cameraMode = 'chase' }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const lookAtPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!landerRef.current || cameraMode === 'orbit') return;

    const [px, py, pz] = landerRef.current.position;
    const groundY = getTerrainHeight(px, pz);

    if (cameraMode === 'chase' || cameraMode === 'follow') {
      // CHASE: Positioned behind and above Vikram
      targetPos.current.set(px, Math.max(groundY + 4, py + 12), pz + 26);
      lookAtPos.current.set(px, py + 2, pz);
    } else if (cameraMode === 'wide') {
      // WIDE: Panoramic overview showing lander & lunar terrain
      targetPos.current.set(px + 28, Math.max(groundY + 20, py + 40), pz + 58);
      lookAtPos.current.set(px, py + 2, pz);
    } else if (cameraMode === 'landing') {
      // LANDING: Low close-up focusing on touchdown feet & landing pad
      targetPos.current.set(px, Math.max(groundY + 2.5, py + 4), pz + 14);
      lookAtPos.current.set(px, py + 1.2, pz);
    }

    // Smooth lerp camera interpolation
    camera.position.lerp(targetPos.current, Math.min(1, delta * 4.5));
    camera.lookAt(lookAtPos.current);
  });

  return (
    <>
      {cameraMode === 'orbit' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.02} // Don't clip beneath terrain
          minDistance={8}
          maxDistance={350}
        />
      )}
    </>
  );
}
