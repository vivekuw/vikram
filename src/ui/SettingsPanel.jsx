import React from 'react';
import { Settings, X, Eye, Map, Radar, Crosshair, Camera, Ruler, RotateCcw } from 'lucide-react';

/**
 * Settings Panel component (Stage 7P & Stage 8K)
 * Provides toggles for UI overlays, camera modes, and progress reset without altering physics logic.
 */
export function SettingsPanel({ settings, updateSettings, onClose, onResetProgress }) {
  const {
    showHUD = true,
    showMinimap = true,
    showScanner = false,
    showReticle = true,
    cameraMode = 'chase',
    units = 'Metric',
  } = settings;

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleCameraChange = (mode) => {
    updateSettings({ cameraMode: mode });
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="settings-modal-title">
            <Settings size={18} color="var(--accent-cyan)" />
            <span>SIMULATOR PRESENTATION SETTINGS</span>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* DISPLAY OVERLAYS */}
          <div className="settings-section">
            <div className="settings-section-title">DISPLAY OVERLAYS</div>

            <div className="settings-row">
              <div className="settings-label">
                <Eye size={15} color="var(--accent-cyan)" />
                <span>Mission Control HUD</span>
              </div>
              <button
                className={`toggle-switch ${showHUD ? 'on' : 'off'}`}
                onClick={() => handleToggle('showHUD')}
              >
                {showHUD ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <Map size={15} color="var(--accent-cyan)" />
                <span>Minimap Display</span>
              </div>
              <button
                className={`toggle-switch ${showMinimap ? 'on' : 'off'}`}
                onClick={() => handleToggle('showMinimap')}
              >
                {showMinimap ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <Radar size={15} color="var(--accent-cyan)" />
                <span>Hazard Scanner</span>
              </div>
              <button
                className={`toggle-switch ${showScanner ? 'on' : 'off'}`}
                onClick={() => handleToggle('showScanner')}
              >
                {showScanner ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <Crosshair size={15} color="var(--accent-cyan)" />
                <span>Targeting Center Reticle</span>
              </div>
              <button
                className={`toggle-switch ${showReticle ? 'on' : 'off'}`}
                onClick={() => handleToggle('showReticle')}
              >
                {showReticle ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* CAMERA & UNITS */}
          <div className="settings-section">
            <div className="settings-section-title">CAMERA & UNITS</div>

            <div className="settings-row">
              <div className="settings-label">
                <Camera size={15} color="var(--accent-gold)" />
                <span>Camera Mode</span>
              </div>
              <div className="camera-mode-selector">
                {['chase', 'wide', 'landing'].map((mode) => (
                  <button
                    key={mode}
                    className={`mode-btn ${cameraMode === mode ? 'active' : ''}`}
                    onClick={() => handleCameraChange(mode)}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <Ruler size={15} color="var(--accent-gold)" />
                <span>Units</span>
              </div>
              <div className="units-badge">{units}</div>
            </div>
          </div>

          {/* STAGE 8K: CAMPAIGN PROGRESS RESET */}
          {onResetProgress && (
            <div className="settings-section">
              <div className="settings-section-title">CAMPAIGN PROGRESS</div>
              <div className="settings-row">
                <span className="settings-label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Clear saved high scores & mission unlocks
                </span>
                <button
                  className="reset-save-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all campaign progress?')) {
                      onResetProgress();
                      onClose();
                    }
                  }}
                >
                  <RotateCcw size={12} /> RESET PROGRESS
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <span>Settings affect presentation display only. Core physics remains unchanged.</span>
        </div>
      </div>
    </div>
  );
}
