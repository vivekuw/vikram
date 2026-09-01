import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { MoonSurface } from '../components/MoonSurface';
import { VikramModel } from '../components/VikramModel';
import { PragyanModel } from '../rover/PragyanModel';
import { RoverDustParticles } from '../components/RoverDustParticles';
import { RoverTracks } from '../components/RoverTracks';
import { soundEngine } from '../game/soundEngine';
import { ROVER_CONSTANTS } from '../rover/roverConstants';
import { useRoverControls } from '../rover/roverControls';
import { terrainEngine } from '../game/terrain/terrainGenerator';

export function RoverMissionScene({
  roverRef,
  roverState,
  objectivesStatus = {},
  deploymentProgress,
  cameraMode,
  updateRoverFrame,
  triggerScienceInteract,
  cycleCamera,
  toggleMap,
  togglePause,
  restartMission2,
  enabled = true,
}) {
  // Bind Keyboard Inputs (WASD / Arrows)
  const keysRef = useRoverControls({
    onInteract: triggerScienceInteract,
    onCycleCamera: cycleCamera,
    onToggleMap: toggleMap,
    onTogglePause: togglePause,
    onRestart: restartMission2,
    enabled,
  });

  // Calculate terrain heights for all checkpoints to keep them flush on ground
  const targetAY = terrainEngine.getTerrainHeight(ROVER_CONSTANTS.TARGET_A_POSITION.x, ROVER_CONSTANTS.TARGET_A_POSITION.z);
  const targetBY = terrainEngine.getTerrainHeight(ROVER_CONSTANTS.TARGET_B_POSITION.x, ROVER_CONSTANTS.TARGET_B_POSITION.z);
  const targetCY = terrainEngine.getTerrainHeight(ROVER_CONSTANTS.TARGET_C_POSITION.x, ROVER_CONSTANTS.TARGET_C_POSITION.z);
  const vikramY = terrainEngine.getTerrainHeight(0, 0);

  // Checkpoint Visibility Status: Vanish once reached!
  const showTargetA = !objectivesStatus?.targetADone;
  const showTargetB = !objectivesStatus?.targetBDone;
  const showTargetC = !objectivesStatus?.targetCDone;
  const showReturnVikram = objectivesStatus?.targetCDone && !objectivesStatus?.returnedToVikram;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b1021' }}>
      <Canvas gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
        {/* Soft Volumetric Atmosphere Fog */}
        <fog attach="fog" args={['#0b1224', 40, 250]} />

        {/* Enhanced Lighting for Crisp Visibility */}
        <ambientLight intensity={0.65} />
        <hemisphereLight skyColor="#90caf9" groundColor="#37474f" intensity={0.55} />
        <directionalLight position={[100, 150, 50]} intensity={2.4} castShadow />

        {/* Shared Lunar Surface Terrain */}
        <MoonSurface />

        {/* Dynamic 3D Wheel Track Trails on Regolith */}
        <RoverTracks roverRef={roverRef} />

        {/* Dynamic 3D Wheel Dust Particles */}
        <RoverDustParticles roverRef={roverRef} />

        {/* Landed Vikram Lander at (0, vikramY, 0) */}
        <group position={[0, vikramY + 0.4, 0]}>
          <VikramModel />
          {/* Deployment Ramp */}
          <mesh position={[0, 0.15, 1.2]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.8, 0.04, 2.0]} />
            <meshStandardMaterial color="#757575" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Return to Vikram Beacon (when all targets done) */}
        {showReturnVikram && (
          <TargetBeacon position={[0, vikramY, 0]} color="#00e676" label="🏠 RETURN TO VIKRAM LANDER" />
        )}

        {/* Target A Beacon Marker (Vanishes when target A reached) */}
        {showTargetA && (
          <TargetBeacon position={[ROVER_CONSTANTS.TARGET_A_POSITION.x, targetAY, ROVER_CONSTANTS.TARGET_A_POSITION.z]} color="#00e5ff" label="🎯 TARGET A (NAV)" />
        )}

        {/* Target B Science Rock & Beacon Marker (Beacon vanishes when target B reached) */}
        <group position={[ROVER_CONSTANTS.TARGET_B_POSITION.x, targetBY, ROVER_CONSTANTS.TARGET_B_POSITION.z]}>
          <mesh position={[0, 0.5, 0]}>
            <dodecahedronGeometry args={[1.1, 1]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.7} metalness={0.2} />
          </mesh>
          {showTargetB && (
            <TargetBeacon position={[0, 0, 0]} color="#ffd700" label="🔬 SCIENCE TARGET B (ROCK)" />
          )}
        </group>

        {/* Target C Beacon Marker (Vanishes when target C reached) */}
        {showTargetC && (
          <TargetBeacon position={[ROVER_CONSTANTS.TARGET_C_POSITION.x, targetCY, ROVER_CONSTANTS.TARGET_C_POSITION.z]} color="#ff007f" label="🏁 TARGET C (EXPLORE)" />
        )}

        {/* Pragyan Rover & Dynamic Camera Loop */}
        <RoverLoop
          roverRef={roverRef}
          roverState={roverState}
          deploymentProgress={deploymentProgress}
          cameraMode={cameraMode}
          keysRef={keysRef}
          updateRoverFrame={updateRoverFrame}
        />
      </Canvas>
    </div>
  );
}

// High-Visibility Holographic 3D Laser Beacon & Floating Sky Marker (Anchored to Ground Terrain)
function TargetBeacon({ position, color, label }) {
  return (
    <group position={position}>
      {/* Ground Glowing Rings Sitting Flat on Regolith Surface */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4.2, 32]} />
        <meshBasicMaterial color={color} side={2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color={color} side={2} transparent opacity={0.3} />
      </mesh>

      {/* Outer Volumetric Halo Column */}
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 30, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Inner Intense Laser Core */}
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 30, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>

      {/* Top Glowing Orb */}
      <mesh position={[0, 30, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <pointLight position={[0, 3, 0]} color={color} intensity={6} distance={25} />

      {/* Floating 3D Text Tag in the Sky */}
      <Html position={[0, 16, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: `2px solid ${color}`,
          color: color,
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          fontWeight: 900,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 20px ${color}80, inset 0 0 10px ${color}40`,
          pointerEvents: 'none',
          letterSpacing: '0.5px',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// Dynamic Frame Loop & Single Camera Controller Rig
function RoverLoop({ roverRef, roverState, deploymentProgress, cameraMode, keysRef, updateRoverFrame }) {
  const cameraRef = useRef();
  const roverGroupRef = useRef();

  // Reusable THREE objects to prevent garbage collection per frame
  const targetCamPos = useRef(new THREE.Vector3());
  const lookTargetVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // Update Rover Physics Frame
    updateRoverFrame(dt, keysRef.current);

    const current = roverRef.current || {};
    const [rx, ry, rz] = current.position || [0, 0.35, 2.5];
    const heading = current.heading || Math.PI;

    // Update Motor Audio Pitch & Slip Sound
    soundEngine.updateMotorSound(current.velocity / 1.5 || 0, current.slipRatio || 0);

    // Deployment Animation interpolation
    let renderPos = [rx, ry, rz];
    if (roverState === 'ROVER_DEPLOYMENT') {
      const zProgress = 0.5 + (deploymentProgress / 100) * 2.0;
      renderPos = [0, 0.35, zProgress];
      roverRef.current.position = renderPos;
    }

    // Move Rover 3D Mesh
    if (roverGroupRef.current) {
      roverGroupRef.current.position.set(renderPos[0], renderPos[1], renderPos[2]);
      roverGroupRef.current.rotation.y = heading + ROVER_CONSTANTS.MODEL_ROTATION_OFFSET;
    }

    // Single Unified Camera Controller System
    if (cameraRef.current) {
      const cam = cameraRef.current;
      const cfg = ROVER_CONSTANTS.CAMERA;

      // Local Forward Vector f = (-sin(heading), 0, -cos(heading))
      const fx = -Math.sin(heading);
      const fz = -Math.cos(heading);

      if (cameraMode === 'chase') {
        // CHASE: behind rover along local forward vector
        targetCamPos.current.set(
          renderPos[0] - fx * cfg.CHASE_DISTANCE,
          renderPos[1] + cfg.CHASE_HEIGHT,
          renderPos[2] - fz * cfg.CHASE_DISTANCE
        );
        lookTargetVec.current.set(
          renderPos[0] + fx * cfg.CHASE_LOOK_AHEAD,
          renderPos[1] + 0.4,
          renderPos[2] + fz * cfg.CHASE_LOOK_AHEAD
        );
      } else if (cameraMode === 'top') {
        // TOP: directly above rover looking down
        targetCamPos.current.set(
          renderPos[0],
          renderPos[1] + cfg.TOP_HEIGHT,
          renderPos[2]
        );
        lookTargetVec.current.set(
          renderPos[0],
          renderPos[1],
          renderPos[2]
        );
      } else if (cameraMode === 'front') {
        // FRONT: in front of rover looking ahead
        targetCamPos.current.set(
          renderPos[0] + fx * cfg.FRONT_DISTANCE,
          renderPos[1] + cfg.FRONT_HEIGHT,
          renderPos[2] + fz * cfg.FRONT_DISTANCE
        );
        lookTargetVec.current.set(
          renderPos[0] + fx * cfg.FRONT_LOOK_AHEAD,
          renderPos[1] + cfg.FRONT_HEIGHT,
          renderPos[2] + fz * cfg.FRONT_LOOK_AHEAD
        );
      } else if (cameraMode === 'science') {
        // SCIENCE: focus on Pragyan & Target B Rock
        const targetB = ROVER_CONSTANTS.TARGET_B_POSITION;
        targetCamPos.current.set(
          renderPos[0] + 2.0,
          renderPos[1] + 1.2,
          renderPos[2] + 2.0
        );
        lookTargetVec.current.set(
          (renderPos[0] + targetB.x) / 2,
          renderPos[1] + 0.5,
          (renderPos[2] + targetB.z) / 2
        );
      }

      // Smooth Camera Lerp Interpolation
      const alpha = Math.min(1.0, dt * cfg.SMOOTHING_FACTOR);
      cam.position.lerp(targetCamPos.current, alpha);

      // Camera Terrain Collision Prevention
      const camTerrainY = terrainEngine.getTerrainHeight(cam.position.x, cam.position.z);
      if (cam.position.y < camTerrainY + cfg.MIN_GROUND_OFFSET) {
        cam.position.y = camTerrainY + cfg.MIN_GROUND_OFFSET;
      }

      cam.lookAt(lookTargetVec.current);
    }
  });

  const current = roverRef.current || {};

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={55} near={0.1} far={1000} />
      <group ref={roverGroupRef}>
        {/* Soft Gold Rover Underglow / Fill Light */}
        <pointLight position={[0, 1.2, 0]} color="#fff8e7" intensity={2.5} distance={10} />
        <PragyanModel wheelAngle={current.wheelAngle || 0} steerAngle={current.steerAngle || 0} />
      </group>
    </>
  );
}
