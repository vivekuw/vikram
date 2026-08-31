import React, { useRef, useEffect } from 'react';
import { TERRAIN_CONFIG } from '../game/terrain/terrainConfig';
import { terrainEngine } from '../game/terrain/terrainGenerator';

export function Minimap({ telemetry }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, width, height);

    const mapRange = TERRAIN_CONFIG.TERRAIN_SIZE * 0.45; // World size mapped to minimap
    const scale = width / (mapRange * 2);
    const centerX = width / 2;
    const centerY = height / 2;

    const toCanvasX = (worldX) => centerX + worldX * scale;
    const toCanvasY = (worldZ) => centerY + worldZ * scale;

    // 1. Draw Target Landing Zone Pad 🎯
    const targetX = toCanvasX(TERRAIN_CONFIG.TARGET_PAD_POSITION.x);
    const targetZ = toCanvasY(TERRAIN_CONFIG.TARGET_PAD_POSITION.z);
    const padRadius = TERRAIN_CONFIG.TARGET_PAD_RADIUS * scale;

    ctx.beginPath();
    ctx.arc(targetX, targetZ, padRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#00e676';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', targetX, targetZ);

    // 2. Draw Craters ○
    if (terrainEngine.craters) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      terrainEngine.craters.forEach((c) => {
        const cx = toCanvasX(c.x);
        const cz = toCanvasY(c.z);
        const r = c.radius * scale;

        ctx.beginPath();
        ctx.arc(cx, cz, r, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // 3. Draw Large Boulder Hazards 🪨
    if (terrainEngine.largeRocks) {
      ctx.fillStyle = '#ff9100';
      terrainEngine.largeRocks.forEach((r) => {
        const rx = toCanvasX(r.x);
        const rz = toCanvasY(r.z);

        ctx.beginPath();
        ctx.arc(rx, rz, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. Draw Vikram Lander Position 🛸 V
    const [px, , pz] = telemetry.position || [0, 250, 0];
    const vx = toCanvasX(px);
    const vz = toCanvasY(pz);

    // Radar pulse ring around Vikram
    ctx.beginPath();
    ctx.arc(vx, vz, 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vikram Icon
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(vx, vz, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('V', vx, vz - 8);
  }, [telemetry]);

  return (
    <div className="minimap-panel interactive">
      <div className="minimap-header">
        <span>MINIMAP</span>
        <span className="minimap-legend">
          <span style={{ color: '#00e5ff' }}>V</span> Vikram |{' '}
          <span style={{ color: '#00e676' }}>🎯</span> Pad |{' '}
          <span style={{ color: '#ff9100' }}>🪨</span> Rocks
        </span>
      </div>
      <canvas ref={canvasRef} width={130} height={130} className="minimap-canvas" />
    </div>
  );
}
