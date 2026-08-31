import React from 'react';
import { Shield, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

/**
 * Mission Status & Warning Priority component (Stage 7K & Stage 7N)
 * Displays current mission phase progression and the highest-priority active alert banner.
 */
export function MissionStatus({ telemetry }) {
  const {
    landingStatus = 'DESCENT',
    highestPriorityWarning = null,
    warnings = [],
  } = telemetry;

  // Phase order pipeline for status display
  const phases = ['PREPARING', 'DESCENT', 'APPROACH', 'FINAL DESCENT', 'TOUCHDOWN'];

  const getPhaseIndex = (status) => {
    if (status === 'PREPARING') return 0;
    if (status === 'DESCENT') return 1;
    if (status === 'APPROACH') return 2;
    if (status === 'FINAL DESCENT') return 3;
    if (status.includes('TOUCHDOWN') || status.includes('LANDING') || status.includes('CRASH')) return 4;
    return 1;
  };

  const currentPhaseIdx = getPhaseIndex(landingStatus);

  // Warning level styling
  const warningStyles = {
    CRITICAL: { color: '#ff1744', bg: 'rgba(255, 23, 68, 0.2)', border: '#ff1744', icon: AlertOctagon },
    DANGER: { color: '#ff9100', bg: 'rgba(255, 145, 0, 0.2)', border: '#ff9100', icon: AlertTriangle },
    WARNING: { color: '#ffd700', bg: 'rgba(255, 215, 0, 0.15)', border: '#ffd700', icon: AlertTriangle },
    CAUTION: { color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', border: '#00e5ff', icon: Info },
    INFORMATION: { color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)', border: '#00e676', icon: Info },
  };

  const activeStyle = highestPriorityWarning ? warningStyles[highestPriorityWarning.level] : null;
  const WarningIcon = activeStyle ? activeStyle.icon : Shield;

  return (
    <div className="hud-panel status-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Shield size={14} color="var(--accent-cyan)" />
          <span>MISSION STATUS</span>
        </div>
        <span className="status-phase-readout">{landingStatus}</span>
      </div>

      {/* Phase Progression Stepper */}
      <div className="phase-stepper">
        {phases.map((phase, idx) => {
          const isDone = idx < currentPhaseIdx;
          const isCurrent = idx === currentPhaseIdx;
          return (
            <div key={phase} className={`phase-step ${isCurrent ? 'active' : isDone ? 'done' : 'upcoming'}`}>
              <div className="phase-dot" />
              <span className="phase-label">{phase}</span>
            </div>
          );
        })}
      </div>

      {/* STAGE 7N: HIGHEST PRIORITY WARNING BANNER */}
      {highestPriorityWarning ? (
        <div
          className="priority-warning-banner"
          style={{
            backgroundColor: activeStyle.bg,
            borderColor: activeStyle.border,
            color: activeStyle.color,
          }}
        >
          <div className="warning-banner-title">
            <WarningIcon size={16} color={activeStyle.color} />
            <span className="priority-level-tag">[{highestPriorityWarning.level}]</span>
            <span className="warning-msg">{highestPriorityWarning.message}</span>
          </div>
          {warnings.length > 1 && (
            <div className="secondary-warnings-count">
              +{warnings.length - 1} secondary alert(s)
            </div>
          )}
        </div>
      ) : (
        <div className="nominal-status-banner">
          <Shield size={14} color="#00e676" />
          <span>ALL SYSTEMS NOMINAL</span>
        </div>
      )}
    </div>
  );
}
