import React from 'react';
import { Camera, Radio, RotateCcw, Terminal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Radar, Eye } from 'lucide-react';

export function ControlsOverlay({
  cameraMode,
  setCameraMode,
  resetSimulation,
  isDebugMode,
  setIsDebugMode,
  isInspectMode,
  toggleInspectMode,
  isScannerActive,
  toggleScannerMode,
  setControlState,
}) {
  const toggleCamera = () => {
    setCameraMode((prev) => {
      if (prev === 'chase' || prev === 'follow') return 'wide';
      if (prev === 'wide') return 'landing';
      return 'chase';
    });
  };

  const toggleDebug = () => {
    setIsDebugMode((prev) => !prev);
  };

  const handleBtnPress = (key) => (e) => {
    e.preventDefault();
    if (setControlState) setControlState(key, true);
  };

  const handleBtnRelease = (key) => (e) => {
    e.preventDefault();
    if (setControlState) setControlState(key, false);
  };

  let cameraLabel = 'CHASE VIEW';
  if (cameraMode === 'wide') cameraLabel = 'WIDE VIEW';
  if (cameraMode === 'landing') cameraLabel = 'LANDING VIEW';

  return (
    <>
      {/* Top Header Bar */}
      <div className="mission-header interactive">
        <div className="mission-title">
          <span className="isro-badge">ISRO</span>
          <div className="title-text">
            <h1>Chandrayaan-3</h1>
            <p>Stage 6 — Realistic Vikram 3D Model</p>
          </div>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>PHYSICS DESCENT SIMULATION ACTIVE</span>
        </div>
      </div>

      {/* Bottom Right Controls & Camera Box */}
      <div className="controls-panel interactive">
        <div className="controls-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="var(--accent-cyan)" />
            <span>Flight Controls</span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            {cameraLabel}
          </span>
        </div>

        <div className="keys-grid">
          <span className="key-badge">W / S</span>
          <span className="key-desc">Thrust Up / Down (Altitude)</span>

          <span className="key-badge">A / D</span>
          <span className="key-desc">Steer Left / Right (← / →)</span>

          <span className="key-badge">Q / E</span>
          <span className="key-desc">Steer Forward / Back (↑ / ↓)</span>

          <span className="key-badge">C</span>
          <span className="key-desc">Cycle Camera (Chase/Wide/Land)</span>

          <span className="key-badge">H</span>
          <span className="key-desc">Hazard Scanner HUD</span>

          <span className="key-badge">V</span>
          <span className="key-desc">Debug Model Inspect</span>

          <span className="key-badge">R</span>
          <span className="key-desc">Reset Mission</span>
        </div>

        {/* Full 3D Flight Control D-Pad */}
        <div className="dpad-container">
          <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            3D Directional Control
          </div>
          <div className="dpad-row">
            <button
              className="dpad-btn"
              onMouseDown={handleBtnPress('q')}
              onMouseUp={handleBtnRelease('q')}
              onTouchStart={handleBtnPress('q')}
              onTouchEnd={handleBtnRelease('q')}
              title="Steer Forward (Q / Up Arrow)"
            >
              <ArrowUp size={14} /> Forward
            </button>
          </div>
          <div className="dpad-row">
            <button
              className="dpad-btn"
              onMouseDown={handleBtnPress('a')}
              onMouseUp={handleBtnRelease('a')}
              onTouchStart={handleBtnPress('a')}
              onTouchEnd={handleBtnRelease('a')}
              title="Steer Left (A / Left Arrow)"
            >
              <ArrowLeft size={14} /> Left
            </button>
            <button
              className="dpad-btn"
              onMouseDown={handleBtnPress('d')}
              onMouseUp={handleBtnRelease('d')}
              onTouchStart={handleBtnPress('d')}
              onTouchEnd={handleBtnRelease('d')}
              title="Steer Right (D / Right Arrow)"
            >
              Right <ArrowRight size={14} />
            </button>
          </div>
          <div className="dpad-row">
            <button
              className="dpad-btn"
              onMouseDown={handleBtnPress('e')}
              onMouseUp={handleBtnRelease('e')}
              onTouchStart={handleBtnPress('e')}
              onTouchEnd={handleBtnRelease('e')}
              title="Steer Backward (E / Down Arrow)"
            >
              <ArrowDown size={14} /> Backward
            </button>
          </div>
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <div className="dpad-row">
            <button
              className="dpad-btn"
              style={{ background: 'rgba(255, 215, 0, 0.15)', borderColor: 'var(--accent-gold)' }}
              onMouseDown={handleBtnPress('w')}
              onMouseUp={handleBtnRelease('w')}
              onTouchStart={handleBtnPress('w')}
              onTouchEnd={handleBtnRelease('w')}
              title="Increase Engine Thrust (W)"
            >
              <ArrowUp size={14} color="var(--accent-gold)" /> Thrust Up
            </button>
            <button
              className="dpad-btn"
              style={{ background: 'rgba(255, 145, 0, 0.15)', borderColor: 'var(--accent-orange)' }}
              onMouseDown={handleBtnPress('s')}
              onMouseUp={handleBtnRelease('s')}
              onTouchStart={handleBtnPress('s')}
              onTouchEnd={handleBtnRelease('s')}
              title="Decrease Engine Thrust (S)"
            >
              <ArrowDown size={14} color="var(--accent-orange)" /> Thrust Down
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <button className="camera-btn" style={{ flex: 1 }} onClick={toggleCamera} title="Cycle Camera Views (C)">
            <Camera size={14} />
            <span>Cam ({cameraMode.toUpperCase()})</span>
          </button>

          <button
            className="camera-btn"
            style={{
              background: isScannerActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              borderColor: isScannerActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)',
            }}
            onClick={toggleScannerMode}
            title="Toggle Landing Hazard Scanner (H)"
          >
            <Radar size={14} color={isScannerActive ? 'var(--accent-cyan)' : '#ffffff'} />
          </button>

          <button
            className="camera-btn"
            style={{
              background: isInspectMode ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              borderColor: isInspectMode ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.2)',
            }}
            onClick={toggleInspectMode}
            title="Toggle Model Inspect Debug Mode (V)"
          >
            <Eye size={14} color={isInspectMode ? 'var(--accent-gold)' : '#ffffff'} />
          </button>

          <button
            className="camera-btn"
            style={{
              background: 'rgba(255, 145, 0, 0.15)',
              borderColor: 'var(--accent-orange)',
            }}
            onClick={resetSimulation}
            title="Reset simulation (R)"
          >
            <RotateCcw size={14} color="var(--accent-orange)" />
          </button>

          <button
            className="camera-btn"
            style={{
              background: isDebugMode ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              borderColor: isDebugMode ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.2)',
            }}
            onClick={toggleDebug}
            title="Toggle Physics Debug Panel (F3)"
          >
            <Terminal size={14} color={isDebugMode ? 'var(--accent-emerald)' : '#ffffff'} />
          </button>
        </div>
      </div>
    </>
  );
}
