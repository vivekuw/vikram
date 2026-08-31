import React, { useRef, useEffect } from 'react';
import { TERRAIN_CONFIG } from '../game/terrain/terrainConfig';
import { terrainEngine } from '../game/terrain/terrainGenerator';
import { ROVER_CONSTANTS } from '../rover/roverConstants';
import { Map, X } from 'lucide-react';

export function RoverMap({ roverRef, objectivesStatus, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#040812';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const mapRange = TERRAIN_CONFIG.TERRAIN_SIZE * 0.45;
    const scale = width / (mapRange * 2);
    const centerX = width / 2;
    const centerY = height / 2;

    const toCanvasX = (worldX) => centerX + worldX * scale;
    const toCanvasY = (worldZ) => centerY + worldZ * scale;

    // 1. Draw Craters
    if (terrainEngine.craters) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      terrainEngine.craters.forEach((c) => {
        const cx = toCanvasX(c.x);
        const cz = toCanvasY(c.z);
        const r = Math.max(3, c.radius * scale);
        ctx.beginPath(); ctx.arc(cx, cz, r, 0, Math.PI * 2); ctx.stroke();
      });
    }

    // 2. Draw Major Rocks
    if (terrainEngine.largeRocks) {
      ctx.fillStyle = '#ff9100';
      terrainEngine.largeRocks.forEach((r) => {
        const rx = toCanvasX(r.x);
        const rz = toCanvasY(r.z);
        ctx.beginPath(); ctx.arc(rx, rz, 2.5, 0, Math.PI * 2); ctx.fill();
      });
    }

    // 3. Draw Targets (A, B, C)
    const targets = [
      { pos: ROVER_CONSTANTS.TARGET_A_POSITION, label: 'A', done: objectivesStatus.targetADone, color: '#00e5ff' },
      { pos: ROVER_CONSTANTS.TARGET_B_POSITION, label: 'B', done: objectivesStatus.targetBDone, color: '#ffd700' },
      { pos: ROVER_CONSTANTS.TARGET_C_POSITION, label: 'C', done: objectivesStatus.targetCDone, color: '#ff007f' },
    ];

    targets.forEach((t) => {
      const tx = toCanvasX(t.pos.x);
      const tz = toCanvasY(t.pos.z);
      const r = t.pos.radius * scale;

      ctx.beginPath();
      ctx.arc(tx, tz, r, 0, Math.PI * 2);
      ctx.fillStyle = t.done ? 'rgba(0, 230, 118, 0.15)' : `${t.color}25`;
      ctx.fill();
      ctx.strokeStyle = t.done ? '#00e676' : t.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = t.done ? '#00e676' : t.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.done ? '✓' : t.label, tx, tz);
    });

    // 4. Draw Vikram Lander (0,0)
    const vx = toCanvasX(0);
    const vz = toCanvasY(0);
    ctx.fillStyle = '#ff9933';
    ctx.beginPath(); ctx.arc(vx, vz, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px monospace'; ctx.fillText('V (Vikram)', vx, vz - 9);

    // 5. Draw Pragyan Rover Position
    const [rx, , rz] = roverRef.current.position || [0, 0.35, 2.5];
    const px = toCanvasX(rx);
    const pz = toCanvasY(rz);

    ctx.beginPath(); ctx.arc(px, pz, 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#00e5ff'; ctx.beginPath(); ctx.arc(px, pz, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 10px monospace'; ctx.fillText('R (Pragyan)', px, pz + 14);
  }, [roverRef, objectivesStatus]);

  return (
    <div className="pause-overlay-banner interactive">
      <div className="pause-modal-card" style={{ maxWidth: '560px', width: '90vw', border: '2px solid var(--accent-cyan)' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800 }}>
            <Map size={16} /> LUNAR SURFACE ROVER NAVIGATION MAP
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width={480} height={320} style={{ borderRadius: '8px', border: '1px solid rgba(0,229,255,0.3)' }} />
        </div>

        <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '14px', marginTop: '10px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#ff9933' }}>V = Vikram</span> |{' '}
          <span style={{ color: '#00e5ff' }}>R = Pragyan</span> |{' '}
          <span style={{ color: '#00e5ff' }}>A = Nav Point</span> |{' '}
          <span style={{ color: '#ffd700' }}>B = Science</span> |{' '}
          <span style={{ color: '#ff007f' }}>C = Target C</span>
        </div>

        <button className="resume-action-btn" onClick={onClose} style={{ marginTop: '10px' }}>
          CLOSE MAP [M]
        </button>
      </div>
    </div>
  );
}
