import React, { useState } from 'react';
import { AltitudeIndicator } from './AltitudeIndicator';
import { VelocityIndicator } from './VelocityIndicator';
import { FuelGauge } from './FuelGauge';
import { ThrustMeter } from './ThrustMeter';
import { AttitudeIndicator } from './AttitudeIndicator';
import { LandingGuidance } from './LandingGuidance';
import { MissionStatus } from './MissionStatus';
import { MissionObjectives } from './MissionObjectives';
import { CenterReticle } from './CenterReticle';
import { SettingsPanel } from './SettingsPanel';
import { Pause, Play, Settings, RotateCcw, ArrowLeft } from 'lucide-react';

import { Minimap } from './Minimap';

/**
 * Main Spacecraft Mission Control HUD component (Stage 7C & Stage 8D)
 * Wraps telemetry modules, real-time objectives, and header actions around the 3D scene.
 */
export function HUD({
  telemetry,
  isPaused,
  togglePause,
  resetSimulation,
  settings,
  updateSettings,
  activeMission,
  evaluatedObjectives,
  onReturnToMenu,
  onResetProgress,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    missionTime = 'T+ 00:00:00',
  } = telemetry;

  const disableGuidance = activeMission?.restrictions?.disableGuidance ?? false;

  if (!settings.showHUD) {
    return (
      <div className="hud-disabled-toggle interactive">
        <button
          className="hud-reopen-btn"
          onClick={() => updateSettings({ showHUD: true })}
        >
          <Settings size={14} /> SHOW HUD
        </button>
      </div>
    );
  }

  return (
    <div className="mission-hud-container">
      {/* CENTER RETICLE */}
      {settings.showReticle && <CenterReticle telemetry={telemetry} />}



      {/* PAUSE OVERLAY BANNER (Stage 7O) */}
      {isPaused && (
        <div className="pause-overlay-banner interactive">
          <div className="pause-modal-card">
            <div className="pause-icon-box">⏸</div>
            <h2>SIMULATION PAUSED</h2>
            <p>Physics integration and propellant consumption are suspended.</p>
            <button className="resume-action-btn" onClick={togglePause}>
              PRESS P OR CLICK HERE TO RESUME
            </button>
          </div>
        </div>
      )}

      {/* MAIN HUD PANELS GRID */}
      <div className="hud-panels-grid">
        {/* LEFT COLUMN: GUIDANCE, ALTITUDE & VELOCITY & REAL-TIME OBJECTIVES */}
        <div className="hud-col hud-col-left interactive">
          {!disableGuidance ? (
            <LandingGuidance telemetry={telemetry} />
          ) : (
            <div className="hud-panel guidance-panel disabled-guidance">
              <div className="manual-mode-warning">
                ⚠ GUIDANCE COMPUTER DISABLED (MANUAL MODE)
              </div>
            </div>
          )}
          <AltitudeIndicator telemetry={telemetry} />
          <VelocityIndicator telemetry={telemetry} />
          {activeMission && (
            <MissionObjectives
              mission={activeMission}
              evaluatedObjectives={evaluatedObjectives}
            />
          )}
        </div>

        {/* RIGHT COLUMN: FUEL, THRUST & MINIMAP RADAR */}
        <div className="hud-col hud-col-right interactive">
          <FuelGauge telemetry={telemetry} />
          <ThrustMeter telemetry={telemetry} />
          {settings.showMinimap && (
            <Minimap telemetry={telemetry} />
          )}
        </div>
      </div>

      {/* BOTTOM HEADER BAR */}
      <header className="hud-header interactive" style={{ marginTop: 'auto' }}>
        <div className="hud-header-left">
          {onReturnToMenu && (
            <button className="hud-action-btn menu-back-btn" onClick={onReturnToMenu} title="Return to Mission Select">
              <ArrowLeft size={14} /> MENU
            </button>
          )}
          <div className="isro-flag-badge">ISRO</div>
          <div className="mission-title-box">
            <h1>{activeMission ? `MISSION 0${activeMission.number} — ${activeMission.title}` : 'CHANDRAYAAN-3'}</h1>
            <p>{activeMission ? activeMission.briefingTitle : 'VIKRAM LANDER DESCENT SIMULATOR'}</p>
          </div>
        </div>

        <div className="hud-header-center">
          <div className="mission-timer-box">
            <span className="timer-label">MISSION TIMER</span>
            <span className="timer-value">{missionTime}</span>
          </div>
        </div>

        <div className="hud-header-right">
          <button
            className="hud-action-btn pause-btn"
            onClick={togglePause}
            title="Pause / Resume (P)"
          >
            {isPaused ? <Play size={15} color="#00e676" /> : <Pause size={15} color="var(--accent-gold)" />}
            <span>{isPaused ? 'RESUME [P]' : 'PAUSE [P]'}</span>
          </button>

          <button
            className="hud-action-btn reset-btn"
            onClick={resetSimulation}
            title="Restart Mission (R)"
          >
            <RotateCcw size={15} />
            <span>RESET [R]</span>
          </button>

          <button
            className="hud-action-btn settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Simulator Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* SETTINGS PANEL MODAL */}
      {isSettingsOpen && (
        <SettingsPanel
          settings={settings}
          updateSettings={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onResetProgress={onResetProgress}
        />
      )}
    </div>
  );
}
