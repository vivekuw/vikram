import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MoonSurface } from '../components/MoonSurface';
import { Lander } from '../components/Lander';
import { LandingZone } from '../components/LandingZone';
import { CameraController } from '../components/CameraController';
import { TARGET_LANDING_ZONE } from '../game/constants';

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
        camera={{ position: [0, 95, 30], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Deep Space Background Color */}
        <color attach="background" args={['#04060d']} />

        {/* Subtle Lunar Atmospheric Fog */}
        <fog attach="fog" args={['#04060d', 100, 450]} />

        {/* --- LIGHTING --- */}
        {/* Soft Ambient Light for Shadowed Lunar Areas */}
        <ambientLight intensity={0.15} color="#8ab4f8" />

        {/* Hemisphere Light mimicking deep sky + moon surface bounce */}
        <hemisphereLight skyColor="#1a233a" groundColor="#10141d" intensity={0.35} />

        {/* Primary Lunar Sun Directional Light casting sharp shadows */}
        <directionalLight
          position={[120, 60, 90]}
          intensity={2.2}
          color="#fff8e7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={400}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-bias={-0.0005}
        />

        {/* --- SCENE OBJECTS --- */}
        <MoonSurface />
        <LandingZone position={[TARGET_LANDING_ZONE.x, 0.05, TARGET_LANDING_ZONE.z]} />
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
