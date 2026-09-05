import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from '../game/terrain/terrainGenerator';
import { TARGET_LANDING_ZONE } from '../game/constants';

export function CameraController({ landerRef, cameraMode = 'spot' }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const lookAtPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!landerRef.current || cameraMode === 'orbit') return;

    const [px, py, pz] = landerRef.current.position;
    const groundY = getTerrainHeight(px, pz);
    const targetX = TARGET_LANDING_ZONE.x; // 35
    const targetY = 0.1;
    const targetZ = TARGET_LANDING_ZONE.z; // 0

    // Midpoint between Spacecraft Satellite (px, py, pz) and Landing Spot (targetX, targetY, targetZ)
    const midX = (px + targetX) / 2;
    const midY = (py + targetY) / 2;
    const midZ = (pz + targetZ) / 2;

    // 3D Distance between Spacecraft Satellite and Target Spot
    const dist3D = Math.hypot(px - targetX, py - targetY, pz - targetZ);

    if (cameraMode === 'spot' || cameraMode === 'target') {
      // DUAL VIEW: Camera positioned to frame BOTH 180m Spacecraft Satellite and Target Pad on screen!
      const requiredCamDist = Math.max(65, dist3D * 1.25 + 30);

      const camX = midX - 25;
      const camY = Math.max(py + 30, groundY + 40); // Higher than lander for optimal perspective
      const camZ = midZ + requiredCamDist;

      targetPos.current.set(camX, camY, camZ);
      lookAtPos.current.set(midX, Math.max(5.0, midY * 0.95), midZ);
    } else if (cameraMode === 'top_down') {
      // TOP-DOWN OVERHEAD: High vertical perspective directly framing Satellite & Landing Spot
      targetPos.current.set(midX, Math.max(120, py + 80), midZ);
      lookAtPos.current.set(midX, midY * 0.5, midZ);
    } else if (cameraMode === 'chase' || cameraMode === 'follow') {
      // CHASE: Behind & above Spacecraft Satellite, angled toward the Landing Spot
      const requiredCamDist = Math.max(45, dist3D * 0.85 + 25);
      targetPos.current.set(px - 12, Math.max(py + 15, groundY + 12), pz + requiredCamDist);
      lookAtPos.current.set(midX, Math.max(5.0, py * 0.6 + midY * 0.35), midZ);
    } else if (cameraMode === 'wide') {
      // PANORAMIC WIDE VIEW: Wide orbital perspective framing Satellite & Target Pad
      const requiredCamDist = Math.max(60, dist3D * 1.2 + 30);
      targetPos.current.set(midX + 50, Math.max(groundY + 30, midY + 45), midZ + requiredCamDist);
      lookAtPos.current.set(midX, Math.max(5.0, midY * 0.85), midZ);
    } else if (cameraMode === 'landing') {
      // LANDING FEET CLOSE-UP: Close to Lander feet but angled toward Landing Spot
      targetPos.current.set(px, Math.max(groundY + 2.5, py + 4), pz + 14);
      lookAtPos.current.set((px * 2 + targetX) / 3, py + 1.2, (pz * 2 + targetZ) / 3);
    }

    // Smooth lerp camera movement
    camera.position.lerp(targetPos.current, Math.min(1, delta * 5.5));
    camera.lookAt(lookAtPos.current);
  });

  return (
    <>
      {cameraMode === 'orbit' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={8}
          maxDistance={400}
        />
      )}
    </>
  );
}
