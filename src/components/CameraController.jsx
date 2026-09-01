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
      // DUAL VIEW: Camera is ALWAYS positioned above the lander satellite height (py + 45)
      // to guarantee that both the Lander (satellite) and Landing Spot are 100% visible!
      const requiredCamDist = Math.max(60, dist3D * 1.15 + 25);

      const camX = midX - 25;
      const camY = Math.max(py + 40, groundY + 45); // ALWAYS higher than Lander height py!
      const camZ = midZ + requiredCamDist;

      targetPos.current.set(camX, camY, camZ);
      lookAtPos.current.set(midX, Math.max(1.0, py * 0.35), midZ);
    } else if (cameraMode === 'top_down') {
      // TOP-DOWN OVERHEAD: Positioned high directly above midpoint between Satellite & Landing Spot
      targetPos.current.set(midX, Math.max(90, py + 60), midZ);
      lookAtPos.current.set(midX, 0, midZ);
    } else if (cameraMode === 'chase' || cameraMode === 'follow') {
      // CHASE: Behind & above Vikram, angled toward the Landing Spot
      const requiredCamDist = Math.max(45, dist3D * 0.8 + 20);
      targetPos.current.set(px - 10, Math.max(py + 18, groundY + 12), pz + requiredCamDist);
      lookAtPos.current.set(midX, Math.max(1.0, py * 0.35), midZ);
    } else if (cameraMode === 'wide') {
      // PANORAMIC WIDE VIEW: Wide orbital perspective framing Lander & Target Pad
      const requiredCamDist = Math.max(55, dist3D * 1.1 + 25);
      targetPos.current.set(midX + 45, Math.max(groundY + 25, midY + 45), midZ + requiredCamDist);
      lookAtPos.current.set(midX, Math.max(1.0, midY * 0.4), midZ);
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
