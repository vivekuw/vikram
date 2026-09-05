import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MoonSurface } from '../components/MoonSurface';
import { Lander } from '../components/Lander';
import { LandingZone } from '../components/LandingZone';
import { CameraController } from '../components/CameraController';
import { TARGET_LANDING_ZONE } from '../game/constants';

import { getTerrainHeight } from '../game/terrain/terrainGenerator';

// Ground Shadow Ring & Ground Path Arrow connecting directly to Landing Zone
function GroundShadowProjection({ landerRef }) {
  const shadowGroupRef = useRef();
  const lineRef = useRef();

  useFrame(() => {
    if (!shadowGroupRef.current || !landerRef.current) return;
    const [px, py, pz] = landerRef.current.position;
    const groundY = getTerrainHeight(px, pz);

    shadowGroupRef.current.position.set(px, groundY + 0.04, pz);

    if (lineRef.current) {
      const targetX = TARGET_LANDING_ZONE.x;
      const targetZ = TARGET_LANDING_ZONE.z;
      const posAttr = lineRef.current.geometry.attributes.position;
      // Drop line from Lander down to ground
      posAttr.setXYZ(0, px, py, pz);
      posAttr.setXYZ(1, px, groundY + 0.04, pz);

      // Ground line from Lander shadow to Target Landing Zone
      posAttr.setXYZ(2, px, groundY + 0.04, pz);
      posAttr.setXYZ(3, targetX, 0.08, targetZ);

      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ground Projection Target Ring under Vikram Lander */}
      <group ref={shadowGroupRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Laser Drop Line & Ground Path Line */}
      <line ref={lineRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={new Float32Array([0, 180, 0, 0, 0, 0, 0, 0, 0, 35, 0.1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#ffd700" transparent opacity={0.85} linewidth={2} />
      </line>
    </>
  );
}

// Dynamic 3D Trajectory Beam connecting Spacecraft Satellite (Lander) to Target Spot
function TargetGuidanceBeam({ landerRef }) {
  const lineRef = useRef();

  useFrame(() => {
    if (!lineRef.current || !landerRef.current) return;
    const [px, py, pz] = landerRef.current.position;
    const targetX = TARGET_LANDING_ZONE.x;
    const targetY = 0.1;
    const targetZ = TARGET_LANDING_ZONE.z;

    const posAttr = lineRef.current.geometry.attributes.position;
    // Point 0: Spacecraft Satellite center
    posAttr.setXYZ(0, px, py, pz);
    // Point 1: Target Landing Spot
    posAttr.setXYZ(1, targetX, targetY, targetZ);
    posAttr.needsUpdate = true;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([0, 0, 0, 35, 0.1, 0])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        attach="material"
        color="#00e5ff"
        dashSize={1.5}
        gapSize={1.0}
        linewidth={3}
        transparent
        opacity={0.8}
      />
    </line>
  );
}

// Inner component to execute physics/control loop on every frame tick
function FrameLoopManager({ updateLanderFrame }) {
  useFrame((state, delta) => {
    // Limit max delta to prevent physics jumps on lag spikes
    const clampedDelta = Math.min(delta, 0.1);
    updateLanderFrame(clampedDelta);
  });
  return null;
}

export function GameScene({ landerRef, telemetry, cameraMode, isInspectMode, updateLanderFrame }) {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 95, 30], fov: 50, near: 0.1, far: 2500 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Deep Space Background Color */}
        <color attach="background" args={['#04060d']} />

        {/* Clear Atmospheric Fog (Far distance to prevent hiding high altitude objects) */}
        <fog attach="fog" args={['#04060d', 800, 4000]} />

        {/* --- ENHANCED CRISP LIGHTING --- */}
        <ambientLight intensity={0.55} color="#b0bec5" />
        <hemisphereLight skyColor="#42a5f5" groundColor="#263238" intensity={0.7} />
        <directionalLight
          position={[140, 120, 90]}
          intensity={3.0}
          color="#fff8e7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={600}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
          shadow-bias={-0.0005}
        />

        {/* --- SCENE OBJECTS --- */}
        <MoonSurface />
        <LandingZone position={[TARGET_LANDING_ZONE.x, 0.05, TARGET_LANDING_ZONE.z]} />
        <TargetGuidanceBeam landerRef={landerRef} />
        <GroundShadowProjection landerRef={landerRef} />

        <Lander
          landerRef={landerRef}
          actualThrustRatio={telemetry.actualThrust / 3200.0}
          isInspectMode={isInspectMode}
        />

        {/* Camera controller & frame tick manager */}
        <CameraController landerRef={landerRef} cameraMode={cameraMode} />
        <FrameLoopManager updateLanderFrame={updateLanderFrame} />
      </Canvas>
    </div>
  );
}
