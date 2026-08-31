import React, { useRef, useEffect } from 'react';
import { TERRAIN_CONFIG } from '../game/terrain/terrainConfig';
import { terrainEngine } from '../game/terrain/terrainGenerator';
import { Compass } from 'lucide-react';

export function Minimap({ telemetry }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, width, height);

    // Draw Radar Grid Lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const mapRange = TERRAIN_CONFIG.TERRAIN_SIZE * 0.45;
    const scaleX = width / (mapRange * 2);
    const scaleZ = height / (mapRange * 2);
    const centerX = width / 2;
    const centerY = height / 2;

    const toCanvasX = (worldX) => centerX + worldX * scaleX;
    const toCanvasY = (worldZ) => centerY + worldZ * scaleZ;

    // 1. Draw Landing Pad 🎯
    const targetX = toCanvasX(TERRAIN_CONFIG.TARGET_PAD_POSITION.x);
    const targetZ = toCanvasY(TERRAIN_CONFIG.TARGET_PAD_POSITION.z);
    const padRadius = Math.max(6, TERRAIN_CONFIG.TARGET_PAD_RADIUS * scaleX);

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

    // 2. Draw Craters
    if (terrainEngine.craters) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      terrainEngine.craters.forEach((c) => {
        const cx = toCanvasX(c.x);
        const cz = toCanvasY(c.z);
        const r = Math.max(3, c.radius * scaleX);

        ctx.beginPath();
        ctx.arc(cx, cz, r, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // 3. Draw Rocks 🪨
    if (terrainEngine.largeRocks) {
      ctx.fillStyle = '#ff9100';
      terrainEngine.largeRocks.forEach((r) => {
        const rx = toCanvasX(r.x);
        const rz = toCanvasY(r.z);

        ctx.beginPath();
        ctx.arc(rx, rz, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. Draw Vikram Lander Position 🛸 V
    const [px, , pz] = telemetry.position || [0, 250, 0];
    const vx = toCanvasX(px);
    const vz = toCanvasY(pz);

    // Pulse ring
    ctx.beginPath();
    ctx.arc(vx, vz, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lander dot
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(vx, vz, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('V', vx, vz - 7);
  }, [telemetry]);

  return (
    <div className="hud-panel minimap-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Compass size={14} color="var(--accent-cyan)" />
          <span>MINIMAP RADAR</span>
        </div>
        <div className="minimap-legend" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>V</span> Lander |{' '}
          <span style={{ color: '#00e676' }}>🎯</span> Pad
        </div>
      </div>
      <div className="minimap-canvas-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <canvas ref={canvasRef} width={224} height={95} className="minimap-canvas" style={{ border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '6px' }} />
      </div>
    </div>
  );
}
