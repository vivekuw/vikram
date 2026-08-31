import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

export function FuelWarning({ fuelState }) {
  if (fuelState === 'NORMAL' || fuelState === 'CAUTION') return null;

  let bg = 'rgba(255, 145, 0, 0.2)';
  let border = 'var(--accent-orange)';
  let color = 'var(--accent-orange)';
  let icon = <AlertTriangle size={16} />;
  let message = '⚠ LOW FUEL';

  if (fuelState === 'CRITICAL') {
    bg = 'rgba(255, 61, 0, 0.25)';
    border = '#ff3d00';
    color = '#ff5252';
    icon = <AlertCircle size={16} />;
    message = '⚠ CRITICAL FUEL';
  } else if (fuelState === 'EMPTY') {
    bg = 'rgba(213, 0, 0, 0.35)';
    border = '#ff1744';
    color = '#ff1744';
    icon = <XCircle size={16} />;
    message = '✖ ENGINE THRUST UNAVAILABLE - FUEL EMPTY';
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        animation: 'pulse 0.9s infinite',
        margin: '4px 0',
      }}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
