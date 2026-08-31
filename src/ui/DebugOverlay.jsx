import React from 'react';
import { Terminal, Cpu } from 'lucide-react';

export function DebugOverlay({ isDebugMode, debugData, telemetry }) {
  if (!isDebugMode) return null;

  return (
    <div
      className="interactive"
      style={{
        position: 'absolute',
        top: '90px',
        right: '20px',
        width: '270px',
        background: 'rgba(5, 10, 20, 0.88)',
        border: '1px solid var(--accent-orange)',
        borderRadius: '10px',
        padding: '14px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(255, 145, 0, 0.2)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--accent-orange)',
          fontWeight: 700,
          borderBottom: '1px dashed rgba(255, 145, 0, 0.4)',
          paddingBottom: '6px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} /> MASS & PHYSICS DEBUG [F3]
        </span>
        <Cpu size={14} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Dry Mass:</span>
        <span>{debugData.dryMass || 600} kg</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Fuel Mass:</span>
        <span style={{ color: 'var(--accent-cyan)' }}>{Math.round(telemetry.fuelMass)} kg</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Total Spacecraft Mass:</span>
        <span style={{ color: '#ffffff', fontWeight: 700 }}>{Math.round(telemetry.totalMass)} kg</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Actual Thrust Force:</span>
        <span style={{ color: 'var(--accent-gold)' }}>{Math.round(telemetry.actualThrust)} N</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Net Accel Y:</span>
        <span style={{ color: debugData.accelY >= 0 ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
          {debugData.accelY > 0 ? `+${debugData.accelY}` : debugData.accelY} m/s²
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Net Accel X:</span>
        <span>{debugData.accelX} m/s²</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Velocity (Vx, Vy):</span>
        <span>
          ({debugData.vx}, {debugData.vy})
        </span>
      </div>
    </div>
  );
}
