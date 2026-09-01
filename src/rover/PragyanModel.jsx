import React from 'react';
import { ROVER_CONSTANTS } from './roverConstants';

/**
 * 3D Pragyan Rover Model component
 * Physics body owns position and heading.
 * Visual model follows position and heading with MODEL_ROTATION_OFFSET.
 */
export function PragyanModel({ position = [0, 0.35, 0], heading = 0, wheelAngle = 0, steerAngle = 0, ...props }) {
  const visualHeading = heading + ROVER_CONSTANTS.MODEL_ROTATION_OFFSET;

  return (
    <group position={position} rotation={[0, visualHeading, 0]} {...props}>
      <ProceduralPragyanRover wheelAngle={wheelAngle} steerAngle={steerAngle} />
    </group>
  );
}

// High-Detail 3D 6-Wheeled Pragyan Rover with Dynamic Steering & Treaded ISRO Emblem Wheels
function ProceduralPragyanRover({ wheelAngle = 0, steerAngle = 0 }) {
  // Wheel positions: Front = -Z, Mid = 0, Rear = +Z
  const wheelPositions = [
    { pos: [-0.4, -0.15, -0.4], isFront: true, side: 'left' },   // Front Left (-Z)
    { pos: [0.4, -0.15, -0.4], isFront: true, side: 'right' },  // Front Right (-Z)
    { pos: [-0.4, -0.15, 0], isFront: false, side: 'left' },    // Mid Left
    { pos: [0.4, -0.15, 0], isFront: false, side: 'right' },   // Mid Right
    { pos: [-0.4, -0.15, 0.4], isFront: false, side: 'left' },  // Rear Left (+Z)
    { pos: [0.4, -0.15, 0.4], isFront: false, side: 'right' }, // Rear Right (+Z)
  ];

  // Tread notches around wheel perimeter (8 teeth per wheel for clear spin visual)
  const treadTeeth = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <group>
      {/* ================= DUAL FORWARD HEADLIGHT SPOTLIGHTS (-Z) ================= */}
      <spotLight
        position={[-0.2, 0.1, -0.45]}
        target-position={[-0.2, -0.2, -6.0]}
        color="#e0f7fa"
        intensity={5.5}
        angle={0.6}
        penumbra={0.3}
        distance={22}
        castShadow
      />
      <spotLight
        position={[0.2, 0.1, -0.45]}
        target-position={[0.2, -0.2, -6.0]}
        color="#e0f7fa"
        intensity={5.5}
        angle={0.6}
        penumbra={0.3}
        distance={22}
        castShadow
      />

      {/* Main Gold-Foil Rover Chassis Body */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.25, 0.8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Gold Thermal Foil Seam Detail Layer */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.71, 0.23, 0.81]} />
        <meshStandardMaterial color="#ffb300" metalness={0.8} roughness={0.3} wireframe={true} />
      </mesh>

      {/* Top Solar Panel Array */}
      <mesh position={[0, 0.19, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.76, 0.02, 0.86]} />
        <meshStandardMaterial color="#0d47a1" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Solar Panel Cells Grid (Visual Detail) */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={`grid-${i}`} position={[x, 0.205, 0]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.2, 0.005, 0.82]} />
          <meshStandardMaterial color="#1565c0" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* ================= FRONT IDENTIFICATION & BUMPER (-Z) ================= */}
      {/* Front High-Contrast Cyan Bumper Bar */}
      <mesh position={[0, 0.0, -0.42]}>
        <boxGeometry args={[0.74, 0.08, 0.05]} />
        <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Dual Glowing Front Headlamp Lenses */}
      <mesh position={[-0.2, 0.05, -0.44]}>
        <boxGeometry args={[0.12, 0.08, 0.04]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.2, 0.05, -0.44]}>
        <boxGeometry args={[0.12, 0.08, 0.04]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Front Volumetric Light Beam Cone */}
      <mesh position={[0, -0.05, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 1.5, 16]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* High-Visibility Roof Forward Arrow ("▲ FRONT") */}
      <mesh position={[0, 0.22, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.35, 3]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Ground Projection Arrow (-Z) showing Forward Direction */}
      <mesh position={[0, -0.28, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 3]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.65} side={2} />
      </mesh>

      {/* ================= SENSOR MAST & APXS ARM (FRONT -Z) ================= */}
      {/* LIBS Laser & Navigation Camera Mast */}
      <mesh position={[0, 0.35, -0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#b0bec5" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* NavCam Stereo Optics Box */}
      <mesh position={[0, 0.5, -0.3]}>
        <boxGeometry args={[0.14, 0.09, 0.09]} />
        <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Twin Camera Lenses */}
      <mesh position={[-0.04, 0.5, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.04, 0.5, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* APXS Spectrometer Sensor Arm */}
      <mesh position={[0.22, 0, -0.35]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#eceff1" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ================= ROCKER-BOGIE SUSPENSION LINKAGE STRUTS ================= */}
      {/* Left Rocker Arm */}
      <mesh position={[-0.38, -0.05, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.03, 0.04, 0.78]} />
        <meshStandardMaterial color="#546e7a" metalness={0.8} />
      </mesh>
      {/* Right Rocker Arm */}
      <mesh position={[0.38, -0.05, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.03, 0.04, 0.78]} />
        <meshStandardMaterial color="#546e7a" metalness={0.8} />
      </mesh>

      {/* ================= REAR IDENTIFICATION (+Z) ================= */}
      {/* Communication Antenna at REAR (+Z) */}
      <mesh position={[-0.25, 0.32, 0.25]}>
        <cylinderGeometry args={[0.006, 0.006, 0.45, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Rear Warning Red Light Lenses */}
      <mesh position={[-0.25, 0.05, 0.42]}>
        <boxGeometry args={[0.08, 0.06, 0.03]} />
        <meshBasicMaterial color="#ff1744" />
      </mesh>
      <mesh position={[0.25, 0.05, 0.42]}>
        <boxGeometry args={[0.08, 0.06, 0.03]} />
        <meshBasicMaterial color="#ff1744" />
      </mesh>

      {/* ================= HIGH-DETAIL 6-WHEEL ASSEMBLY WITH TYRE SPIN & STEERING ================= */}
      {wheelPositions.map((item, index) => {
        const pivotAngle = item.isFront ? steerAngle : 0;
        const isRightSide = item.side === 'right';

        return (
          <group key={index} position={item.pos} rotation={[0, pivotAngle, 0]}>
            {/* Steering Kingpin Pivot Shaft */}
            {item.isFront && (
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
                <meshStandardMaterial color="#37474f" metalness={0.9} />
              </mesh>
            )}

            {/* Wheel Axle Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.13, 12]} />
              <meshStandardMaterial color="#263238" metalness={0.9} />
            </mesh>

            {/* ROTATING METALLIC WHEEL & TREAD ASSEMBLY */}
            <group rotation={[wheelAngle, 0, Math.PI / 2]}>
              {/* Main Outer Cylindrical Tyre Rim */}
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.135, 0.135, 0.09, 24]} />
                <meshStandardMaterial color="#78909c" metalness={0.88} roughness={0.2} />
              </mesh>

              {/* Inner Metallic Hub Disk */}
              <mesh position={[0, isRightSide ? 0.046 : -0.046, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.005, 16]} />
                <meshStandardMaterial color="#37474f" metalness={0.95} roughness={0.1} />
              </mesh>

              {/* Embossed ISRO & Indian Emblem Relief on Outer Wheel Face */}
              <mesh position={[0, isRightSide ? 0.048 : -0.048, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.065, 0.008, 3]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Inner Center Emblem Ring */}
              <mesh position={[0, isRightSide ? 0.049 : -0.049, 0]}>
                <ringGeometry args={[0.02, 0.04, 16]} />
                <meshBasicMaterial color="#00e5ff" side={2} />
              </mesh>

              {/* 3D Tread Teeth/Notches Around Wheel Rim (Makes Tyre Spin Super Crisp!) */}
              {treadTeeth.map((deg, tIdx) => {
                const rad = (deg * Math.PI) / 180;
                const tx = Math.cos(rad) * 0.138;
                const ty = Math.sin(rad) * 0.138;
                return (
                  <mesh key={`tread-${tIdx}`} position={[tx, 0, ty]} rotation={[0, -rad, 0]}>
                    <boxGeometry args={[0.015, 0.092, 0.025]} />
                    <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.3} />
                  </mesh>
                );
              })}
            </group>
          </group>
        );
      })}
    </group>
  );
}
