import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MoonSurface } from '../components/MoonSurface';
import { VikramModel } from '../components/VikramModel';
import { PragyanModel } from '../rover/PragyanModel';
import { ROVER_CONSTANTS } from '../rover/roverConstants';
import { useRoverControls } from '../rover/roverControls';
import { terrainEngine } from '../game/terrain/terrainGenerator';

export function RoverMissionScene({
  roverRef,
  roverState,
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

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020408' }}>
      <Canvas gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[100, 150, 50]} intensity={1.8} castShadow />

        {/* Shared Lunar Surface Terrain */}
        <MoonSurface />

        {/* Landed Vikram Lander at (0,0,0) */}
        <group position={[0, 0.4, 0]}>
          <VikramModel />
          {/* Deployment Ramp */}
          <mesh position={[0, 0.15, 1.2]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.8, 0.04, 2.0]} />
            <meshStandardMaterial color="#757575" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Target A Beacon Marker */}
        <TargetBeacon position={[ROVER_CONSTANTS.TARGET_A_POSITION.x, 0, ROVER_CONSTANTS.TARGET_A_POSITION.z]} color="#00e5ff" label="🎯 TARGET A (NAV)" />

        {/* Target B Science Rock & Beacon Marker */}
        <group position={[ROVER_CONSTANTS.TARGET_B_POSITION.x, 0, ROVER_CONSTANTS.TARGET_B_POSITION.z]}>
          <mesh position={[0, 0.5, 0]}>
            <dodecahedronGeometry args={[1.1, 1]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.7} metalness={0.2} />
          </mesh>
          <TargetBeacon position={[0, 0, 0]} color="#ffd700" label="🔬 SCIENCE TARGET B (ROCK)" />
        </group>

        {/* Target C Beacon Marker */}
        <TargetBeacon position={[ROVER_CONSTANTS.TARGET_C_POSITION.x, 0, ROVER_CONSTANTS.TARGET_C_POSITION.z]} color="#ff007f" label="🏁 TARGET C (EXPLORE)" />

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

// Tall Holographic 3D Laser Beacon & Floating Sky Marker
function TargetBeacon({ position, color, label }) {
  return (
    <group position={position}>
      {/* Ground Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.0, 3.8, 32]} />
        <meshBasicMaterial color={color} side={2} transparent opacity={0.7} />
      </mesh>

      {/* 20-meter Tall Holographic Laser Light Beam */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 20, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>

      <pointLight position={[0, 2, 0]} color={color} intensity={4} distance={15} />

      {/* Floating 3D Text Tag in the Sky */}
      <Html position={[0, 12, 0]} center distanceFactor={25}>
        <div style={{
          background: 'rgba(6, 10, 20, 0.9)',
          border: `1.5px solid ${color}`,
          color: color,
          padding: '4px 10px',
          borderRadius: '6px',
          fontFamily: 'sans-serif',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 15px ${color}60`,
          pointerEvents: 'none',
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
        <PragyanModel wheelAngle={current.wheelAngle || 0} />
      </group>
    </>
  );
}
