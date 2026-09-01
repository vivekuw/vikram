import React from 'react';
import { getBatteryStatus } from '../rover/roverBattery';
import { ROVER_CONSTANTS } from '../rover/roverConstants';
import { Battery, Zap, Radio, Compass, Navigation, ArrowLeft, Pause, Play, RotateCcw, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';

export function RoverHUD({
  roverRef,
  roverState,
  objectivesStatus,
  missionTime,
  cameraMode,
  cycleCamera,
  toggleMap,
  triggerScienceInteract,
  isPaused,
  togglePause,
  restartMission2,
  onReturnToMenu,
}) {
  const current = roverRef.current || {};
  const {
    position = [0, 0.35, 2.5],
    velocity = 0,
    heading = 0,
    battery = 100,
    slopeAngle = 0,
  } = current;

  const [rx, , rz] = position;
  const batteryInfo = getBatteryStatus(battery);
  const speed = Math.abs(velocity).toFixed(1);

  // Distance to Vikram (0,0)
  const distVikram = Math.hypot(rx, rz).toFixed(1);

  // Communication Status based on distance from Vikram
  let commStatus = 'CONNECTED';
  let commColor = '#00e676';
  if (distVikram > ROVER_CONSTANTS.MAX_COMM_RANGE) {
    commStatus = 'OUT OF RANGE';
    commColor = '#ff1744';
  } else if (distVikram > ROVER_CONSTANTS.WEAK_COMM_RANGE) {
    commStatus = 'WEAK SIGNAL';
    commColor = '#ff9100';
  }

  // Active Target Information & World Position
  let activeTargetLabel = 'TARGET A (NAV)';
  let activeTargetPos = ROVER_CONSTANTS.TARGET_A_POSITION;
  let activeTargetDist = Math.hypot(rx - ROVER_CONSTANTS.TARGET_A_POSITION.x, rz - ROVER_CONSTANTS.TARGET_A_POSITION.z).toFixed(1);

  if (objectivesStatus.targetADone && !objectivesStatus.targetBDone) {
    activeTargetLabel = 'TARGET B (SCIENCE)';
    activeTargetPos = ROVER_CONSTANTS.TARGET_B_POSITION;
    activeTargetDist = Math.hypot(rx - ROVER_CONSTANTS.TARGET_B_POSITION.x, rz - ROVER_CONSTANTS.TARGET_B_POSITION.z).toFixed(1);
  } else if (objectivesStatus.targetBDone && !objectivesStatus.targetCDone) {
    activeTargetLabel = 'TARGET C (EXPLORE)';
    activeTargetPos = ROVER_CONSTANTS.TARGET_C_POSITION;
    activeTargetDist = Math.hypot(rx - ROVER_CONSTANTS.TARGET_C_POSITION.x, rz - ROVER_CONSTANTS.TARGET_C_POSITION.z).toFixed(1);
  } else if (objectivesStatus.targetCDone && !objectivesStatus.returnedToVikram) {
    activeTargetLabel = 'RETURN TO VIKRAM';
    activeTargetPos = { x: 0, z: 0 };
    activeTargetDist = distVikram;
  }

  // Calculate Relative Target Angle for Compass Guidance Pointer
  const dx = activeTargetPos.x - rx;
  const dz = activeTargetPos.z - rz;
  const targetAngleWorld = Math.atan2(dx, dz);
  let relAngle = targetAngleWorld - heading;
  while (relAngle > Math.PI) relAngle -= Math.PI * 2;
  while (relAngle < -Math.PI) relAngle += Math.PI * 2;
  const relativeTargetDeg = relAngle * (180 / Math.PI);

  let targetDirLabel = 'AHEAD ▲';
  if (relativeTargetDeg > 45 && relativeTargetDeg <= 135) targetDirLabel = 'RIGHT ►';
  else if (relativeTargetDeg < -45 && relativeTargetDeg >= -135) targetDirLabel = 'LEFT ◄';
  else if (Math.abs(relativeTargetDeg) > 135) targetDirLabel = 'BEHIND ▼';

  const isNearScienceTarget = objectivesStatus.targetADone && !objectivesStatus.targetBDone && Number(activeTargetDist) <= 8.0;

  // Direction (N, S, E, W)
  const deg = (heading * (180 / Math.PI)) % 360;
  let cardinalDir = 'N';
  if (deg > 45 && deg <= 135) cardinalDir = 'E';
  else if (deg > 135 && deg <= 225) cardinalDir = 'S';
  else if (deg > 225 && deg <= 315) cardinalDir = 'W';

  const cameraModeLabels = {
    chase: 'CHASE (BEHIND)',
    top: 'TOP (OVERHEAD)',
    front: 'FRONT (FORWARD VIEW)',
    science: 'SCIENCE (FOCUS)',
  };

  return (
    <div className="mission-hud-container interactive">
      {/* TOP TARGET GUIDANCE BANNER */}
      <div className="top-guidance-container">
        <div className="hud-panel guidance-panel" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '11px' }}>
            <Target size={15} color="var(--accent-cyan)" /> {activeTargetLabel}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 800 }}>
            {activeTargetDist} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>m</span>
          </div>
          {/* Target Relative Bearing Indicator Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#00e5ff',
          }}>
            <Navigation size={12} style={{ transform: `rotate(${relativeTargetDeg}deg)`, transition: 'transform 0.1s ease' }} />
            <span>{targetDirLabel}</span>
          </div>
          <div style={{ fontSize: '10px', color: commColor, fontWeight: 700, border: `1px solid ${commColor}40`, padding: '2px 6px', borderRadius: '4px', background: `${commColor}15` }}>
            <Radio size={11} style={{ marginRight: '4px' }} /> {commStatus}
          </div>

          {/* Interactive Science Trigger Prompt Button */}
          {isNearScienceTarget && triggerScienceInteract && (
            <button
              className="hud-action-btn"
              onClick={triggerScienceInteract}
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ff9100 100%)',
                color: '#000',
                fontWeight: 900,
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(255,215,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
              }}
            >
              <Zap size={14} /> RUN SCIENCE (LIBS/APXS) [E]
            </button>
          )}
        </div>
      </div>

      {/* MAIN PANELS GRID */}
      <div className="hud-panels-grid">
        {/* LEFT COLUMN: BATTERY & TELEMETRY */}
        <div className="hud-col hud-col-left">
          {/* BATTERY GAUGE */}
          <div className="hud-panel">
            <div className="hud-panel-header">
              <div className="hud-panel-title">
                <Battery size={14} color={batteryInfo.color} />
                <span>BATTERY LEVEL</span>
              </div>
              <span className="battery-badge" style={{ color: batteryInfo.color, borderColor: `${batteryInfo.color}50`, background: `${batteryInfo.color}15`, fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontWeight: 800 }}>
                {batteryInfo.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 800, color: batteryInfo.color }}>
              {battery.toFixed(1)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${battery}%`, height: '100%', background: batteryInfo.color, transition: 'width 0.2s linear' }} />
            </div>
          </div>

          {/* SPEED & HEADING */}
          <div className="hud-panel">
            <div className="hud-panel-header">
              <div className="hud-panel-title">
                <Compass size={14} color="var(--accent-cyan)" />
                <span>ROVER MOBILITY</span>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {cardinalDir} ({deg.toFixed(0)}°)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SPEED</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                  {speed} <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>m/s</span>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SLOPE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: slopeAngle > 15 ? '#ff1744' : '#00e676' }}>
                  {slopeAngle.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {/* TYRE SPIN & WHEEL SLIP TELEMETRY */}
          <div className="hud-panel">
            <div className="hud-panel-header">
              <div className="hud-panel-title">
                <RotateCcw size={14} color={(current.slipRatio || 0) > 0.35 ? '#ff1744' : '#00e5ff'} />
                <span>TYRE SPIN & TRACTION</span>
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  color: (current.slipRatio || 0) > 0.4 ? '#ff1744' : (current.slipRatio || 0) > 0.15 ? '#ffd700' : '#00e676',
                  fontWeight: 800,
                  border: `1px solid ${(current.slipRatio || 0) > 0.4 ? '#ff174440' : '#00e67640'}`,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: 'rgba(0,0,0,0.4)',
                }}
              >
                {(current.slipRatio || 0) > 0.4 ? 'HEAVY SPIN' : (current.slipRatio || 0) > 0.15 ? 'REGOLITH SLIP' : 'FULL GRIP'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>WHEEL SPIN RPM</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: '#00e5ff' }}>
                  {Math.abs((((current.tyreSpinSpeed || 0) * 60) / (Math.PI * 2))).toFixed(0)} <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>RPM</span>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>TYRE SLIP %</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: (current.slipRatio || 0) > 0.35 ? '#ff1744' : '#ffd700' }}>
                  {((current.slipRatio || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* ROVER DEBUG OVERLAY */}
          <div className="hud-panel" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            <div className="hud-panel-header" style={{ marginBottom: '4px' }}>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>ROVER DEBUG</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{cameraModeLabels[cameraMode] || cameraMode.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-muted)' }}>
              <div>POS: X={rx.toFixed(1)} Y={position[1].toFixed(1)} Z={rz.toFixed(1)}</div>
              <div>HEADING: {deg.toFixed(1)}° | SPEED: {speed}m/s</div>
              <div>FORWARD VEC: ({(current.forwardVector?.[0] ?? 0).toFixed(2)}, 0, ({(current.forwardVector?.[2] ?? 0).toFixed(2)})</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OBJECTIVES CHECKLIST & LIVE MINIMAP RADAR */}
        <div className="hud-col hud-col-right">
          <div className="hud-panel">
            <div className="hud-panel-header">
              <div className="hud-panel-title">
                <Navigation size={14} color="var(--accent-gold)" />
                <span>MISSION OBJECTIVES</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <ObjectiveRow label="Deploy Pragyan onto Moon" done={objectivesStatus.deploymentDone} />
              <ObjectiveRow label="Reach Target A (Nav)" done={objectivesStatus.targetADone} />
              <ObjectiveRow label="Analyze Target B (LIBS/APXS)" done={objectivesStatus.targetBDone} />
              <ObjectiveRow label="Explore Target C" done={objectivesStatus.targetCDone} />
              <ObjectiveRow label="Return to Vikram" done={objectivesStatus.returnedToVikram} />
            </div>
          </div>

          {/* LIVE PERMANENT MINIMAP RADAR */}
          <RoverMinimapWidget roverRef={roverRef} objectivesStatus={objectivesStatus} />
        </div>
      </div>

      {/* BOTTOM HEADER BAR */}
      <header className="hud-header" style={{ marginTop: 'auto' }}>
        <div className="hud-header-left">
          {onReturnToMenu && (
            <button className="hud-action-btn menu-back-btn" onClick={onReturnToMenu}>
              <ArrowLeft size={14} /> MENU
            </button>
          )}
          <div className="isro-flag-badge">ISRO</div>
          <div className="mission-title-box">
            <h1>MISSION 02 — PRAGYAN ROVER EXPLORATION</h1>
            <p>CHANDRAYAAN-3 LUNAR ROVER SURVIVAL & SCIENCE</p>
          </div>
        </div>

        <div className="hud-header-center">
          <div className="mission-timer-box">
            <span className="timer-label">MISSION TIMER</span>
            <span className="timer-value">{missionTime}</span>
          </div>
        </div>

        <div className="hud-header-right">
          {cycleCamera && (
            <button className="hud-action-btn" onClick={cycleCamera} title="Cycle Camera Mode (C)">
              <span>🎥 {cameraModeLabels[cameraMode] || cameraMode.toUpperCase()} [C]</span>
            </button>
          )}
          {toggleMap && (
            <button className="hud-action-btn" onClick={toggleMap} title="Toggle Surface Map (M)">
              <span>🗺️ MAP [M]</span>
            </button>
          )}
          <button className="hud-action-btn pause-btn" onClick={togglePause}>
            {isPaused ? <Play size={15} color="#00e676" /> : <Pause size={15} color="var(--accent-gold)" />}
            <span>{isPaused ? 'RESUME [P]' : 'PAUSE [P]'}</span>
          </button>
          <button className="hud-action-btn reset-btn" onClick={restartMission2}>
            <RotateCcw size={15} />
            <span>RESET [R]</span>
          </button>
        </div>
      </header>
    </div>
  );
}

// Live Embedded 2D Minimap Radar Canvas for Rover HUD
function RoverMinimapWidget({ roverRef, objectivesStatus }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const scale = width / 200;
    const centerX = width / 2;
    const centerY = height / 2;

    const toX = (worldX) => centerX + worldX * scale;
    const toY = (worldZ) => centerY + worldZ * scale;

    // Draw Targets A, B, C
    const targets = [
      { pos: ROVER_CONSTANTS.TARGET_A_POSITION, label: 'A', done: objectivesStatus.targetADone, color: '#00e5ff' },
      { pos: ROVER_CONSTANTS.TARGET_B_POSITION, label: 'B', done: objectivesStatus.targetBDone, color: '#ffd700' },
      { pos: ROVER_CONSTANTS.TARGET_C_POSITION, label: 'C', done: objectivesStatus.targetCDone, color: '#ff007f' },
    ];

    targets.forEach((t) => {
      const tx = toX(t.pos.x);
      const tz = toY(t.pos.z);
      ctx.beginPath(); ctx.arc(tx, tz, 5, 0, Math.PI * 2);
      ctx.fillStyle = t.done ? '#00e676' : t.color; ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t.done ? '✓' : t.label, tx, tz);
    });

    // Draw Vikram
    const vx = toX(0); const vz = toY(0);
    ctx.fillStyle = '#ff9933'; ctx.beginPath(); ctx.arc(vx, vz, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.fillText('V', vx, vz - 6);

    // Draw Rover
    const [rx, , rz] = roverRef.current.position || [0, 0.35, 2.5];
    const px = toX(rx); const pz = toY(rz);
    ctx.beginPath(); ctx.arc(px, pz, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#00e5ff'; ctx.beginPath(); ctx.arc(px, pz, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 9px monospace'; ctx.fillText('R', px, pz - 6);
  }, [roverRef, objectivesStatus]);

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Compass size={14} color="var(--accent-cyan)" />
          <span>ROVER RADAR MAP</span>
        </div>
        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          V: Vikram | R: Rover
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <canvas ref={canvasRef} width={224} height={95} style={{ border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function ObjectiveRow({ label, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: done ? '#00e676' : 'var(--text-muted)' }}>
      {done ? <CheckCircle2 size={13} color="#00e676" /> : <div style={{ width: '13px', height: '13px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px' }} />}
      <span style={{ fontWeight: done ? 700 : 400 }}>{label}</span>
    </div>
  );
}
