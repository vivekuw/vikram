import React from 'react';
import { Award, RotateCcw, Target, Gauge, ShieldAlert, Flame, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';

export function LandingResult({ landingEvaluation, finalTelemetry, onRestart }) {
  if (!landingEvaluation || !finalTelemetry) return null;

  const { outcome, title, subtitle, crashReason, quality, scores } = landingEvaluation;
  const isCrash = outcome === 'CRASH';

  let themeColor = 'var(--accent-emerald)';
  let bgGradient = 'linear-gradient(180deg, rgba(5, 30, 20, 0.95) 0%, rgba(5, 15, 25, 0.95) 100%)';
  let borderStyle = '1px solid var(--accent-emerald)';

  if (outcome === 'HARD') {
    themeColor = 'var(--accent-gold)';
    bgGradient = 'linear-gradient(180deg, rgba(30, 25, 5, 0.95) 0%, rgba(15, 15, 25, 0.95) 100%)';
    borderStyle = '1px solid var(--accent-gold)';
  } else if (isCrash) {
    themeColor = '#ff1744';
    bgGradient = 'linear-gradient(180deg, rgba(35, 5, 10, 0.95) 0%, rgba(15, 5, 15, 0.95) 100%)';
    borderStyle = '1px solid #ff1744';
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(2, 4, 10, 0.82)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: bgGradient,
          border: borderStyle,
          borderRadius: '16px',
          padding: '28px',
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 30px ${themeColor}33`,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          fontFamily: 'var(--font-body)',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* HEADER OUTCOME BANNER */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {isCrash ? (
            <AlertOctagon size={48} color="#ff1744" />
          ) : (
            <CheckCircle2 size={48} color={themeColor} />
          )}
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: themeColor,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {subtitle}
          </p>
        </div>

        {/* CRASH REASON BOX (IF CRASHED) */}
        {isCrash && crashReason && (
          <div
            style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid #ff1744',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#ff5252',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
              FAILURE CAUSE:
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{crashReason}</div>
          </div>
        )}

        {/* FINAL TOUCHDOWN TELEMETRY METRICS */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} color="var(--accent-cyan)" /> Target Distance:
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              {finalTelemetry.targetDistance.toFixed(1)} m
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={14} color="var(--accent-cyan)" /> Touchdown Vert Velocity:
            </span>
            <span
              style={{
                fontWeight: 700,
                color: Math.abs(finalTelemetry.verticalVelocity) <= 4.0 ? 'var(--accent-emerald)' : '#ff5252',
              }}
            >
              {Math.abs(finalTelemetry.verticalVelocity).toFixed(1)} m/s
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={14} color="var(--accent-cyan)" /> Horizontal Velocity:
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              {finalTelemetry.horizontalVelocity.toFixed(1)} m/s
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} color="var(--accent-cyan)" /> Touchdown Tilt:
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{finalTelemetry.tilt}°</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} color="var(--accent-gold)" /> Remaining Fuel:
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
              {finalTelemetry.fuelPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* SCORE BREAKDOWN (IF SAFE / HARD) */}
        {!isCrash && scores && (
          <div
            style={{
              background: 'rgba(0, 229, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justify自由Content: 'space-between',
                alignItems: 'center',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderBottom: '1px dashed rgba(0, 229, 255, 0.2)',
                paddingBottom: '6px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} /> LANDING PERFORMANCE RATING: {quality}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>
                {scores.total}/100
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Landing Accuracy:</span>
              <span>{scores.accuracy}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Touchdown Control:</span>
              <span>{scores.touchdown}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Attitude Control:</span>
              <span>{scores.attitude}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fuel Efficiency Bonus:</span>
              <span style={{ color: 'var(--accent-gold)' }}>+{scores.fuelBonus} pts</span>
            </div>
          </div>
        )}

        {/* RESTART / RETRY BUTTON */}
        <button
          onClick={onRestart}
          style={{
            background: isCrash ? 'linear-gradient(90deg, #d50000 0%, #ff1744 100%)' : 'linear-gradient(90deg, #00b0ff 0%, #00e5ff 100%)',
            border: 'none',
            color: '#000000',
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            fontWeight: 800,
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0, 229, 255, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={16} />
          <span>{isCrash ? 'RETRY MISSION (R)' : 'CONTINUE / RESTART SIMULATION (R)'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
