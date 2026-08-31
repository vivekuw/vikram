import React, { useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ROVER_CONSTANTS } from './roverConstants';

/**
 * 3D Pragyan Rover Model component
 * Physics body owns position and heading.
 * Visual model follows position and heading with MODEL_ROTATION_OFFSET.
 */
export function PragyanModel({ position = [0, 0.35, 0], heading = 0, wheelAngle = 0, ...props }) {
  const [modelError, setModelError] = useState(false);

  const visualHeading = heading + ROVER_CONSTANTS.MODEL_ROTATION_OFFSET;

  return (
    <group position={position} rotation={[0, visualHeading, 0]} {...props}>
      {!modelError ? (
        <GLBModel onError={() => setModelError(true)} wheelAngle={wheelAngle} />
      ) : (
        <ProceduralPragyanRover wheelAngle={wheelAngle} />
      )}
    </group>
  );
}

// Sub-component for GLB GLTF model loading
function GLBModel({ onError, wheelAngle }) {
  try {
    const { scene } = useGLTF('/models/pragyan/pragyan-rover.glb');
    return <primitive object={scene} scale={[0.8, 0.8, 0.8]} />;
  } catch (err) {
    if (onError) onError();
    return <ProceduralPragyanRover wheelAngle={wheelAngle} />;
  }
}

// Procedural 3D 6-Wheeled Pragyan Rover aligned to local forward (-Z)
function ProceduralPragyanRover({ wheelAngle = 0 }) {
  // Wheel positions: Front = -Z, Rear = +Z
  const wheelPositions = [
    [-0.4, -0.15, -0.4], // Front Left (-Z)
    [0.4, -0.15, -0.4],  // Front Right (-Z)
    [-0.4, -0.15, 0],    // Mid Left
    [0.4, -0.15, 0],     // Mid Right
    [-0.4, -0.15, 0.4],  // Rear Left (+Z)
    [0.4, -0.15, 0.4],   // Rear Right (+Z)
  ];

  return (
    <group>
      {/* Main Gold-Foil Rover Chassis Body */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Top Solar Panel Array */}
      <mesh position={[0, 0.19, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.75, 0.02, 0.85]} />
        <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* LIBS Laser & Navigation Camera Mast (Placed at FRONT -Z) */}
      <mesh position={[0, 0.35, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#9e9e9e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, -0.3]}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* APXS Spectrometer Sensor Arm (Placed at FRONT -Z) */}
      <mesh position={[0.2, 0, -0.35]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Communication Antenna (Placed at REAR +Z) */}
      <mesh position={[-0.25, 0.3, 0.2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 6-Wheel Rocker-Bogie Assembly */}
      {wheelPositions.map((pos, index) => (
        <group key={index} position={pos}>
          {/* Wheel Axle */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
            <meshStandardMaterial color="#424242" />
          </mesh>
          {/* Rotating Metallic Wheel with Treads */}
          <mesh rotation={[wheelAngle, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#616161" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

useGLTF.preload && useGLTF.preload('/models/pragyan/pragyan-rover.glb');
