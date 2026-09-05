import React, { useEffect } from 'react';
import { Trophy, Star, RotateCcw, ArrowLeft, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { calculateMission2Score } from '../missions/mission2Scoring';
import { CHANDRAYAAN3_FACTS } from '../data/chandrayaan3Facts';
import { navigate, ROUTES } from '../game/router';
import { saveScoreRecord } from '../game/leaderboard';

export function Mission2Result({
  isSuccess,
  failureReason,
  objectivesStatus,
  roverRef,
  missionTime,
  onRetry,
  onReturnToMenu,
}) {
  const battery = roverRef.current?.battery || 0;
  const slope = roverRef.current?.slopeAngle || 0;

  const scoreResult = calculateMission2Score({
    objectivesStatus,
    batteryRemaining: battery,
    slopeMax: slope,
    isSuccess,
  });

  useEffect(() => {
    if (isSuccess && scoreResult) {
      const payloadCount = objectivesStatus ? Object.values(objectivesStatus).filter((o) => o?.completed).length : 2;
      saveScoreRecord('mission-2', {
        score: scoreResult.totalScore,
        stars: scoreResult.stars,
        batteryRemaining: `${battery.toFixed(1)}%`,
        sciencePayloads: `${payloadCount} / 3`,
        timeElapsed: missionTime || '05:00',
      });
    }
  }, [isSuccess, scoreResult, battery, objectivesStatus, missionTime]);

  return (
    <div className="pause-overlay-banner interactive">
      <div className="pause-modal-card" style={{ maxWidth: '600px', width: '92vw', border: `2px solid ${isSuccess ? '#00e676' : '#ff1744'}` }}>
        <div style={{ fontSize: '32px' }}>{isSuccess ? '🇮🇳 🏆' : '⚠️'}</div>
        <h2 style={{ color: isSuccess ? '#00e676' : '#ff1744' }}>
          {isSuccess ? 'MISSION 2 COMPLETE — PRAGYAN EXPLORATION SUCCESSFUL' : 'MISSION 2 FAILED'}
        </h2>

        {!isSuccess && (
          <div style={{ color: '#ff1744', fontSize: '11px', background: 'rgba(255,23,68,0.15)', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ff1744' }}>
            REASON: {failureReason || 'ROVER SYSTEM FAILURE'}
          </div>
        )}

        {/* STAR RATING */}
        {isSuccess && (
          <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={24}
                color={i < scoreResult.stars ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}
                fill={i < scoreResult.stars ? 'var(--accent-gold)' : 'none'}
              />
            ))}
          </div>
        )}

        {/* SCORE BREAKDOWN GRID */}
        <div style={{ width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>NAVIGATION:</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{scoreResult.navigationScore}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>BATTERY EFFICIENCY:</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{scoreResult.batteryScore}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>SCIENCE (LIBS/APXS):</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{scoreResult.scienceScore}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>TERRAIN HANDLING:</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{scoreResult.terrainScore}/100</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '13px' }}>
              FINAL OVERALL SCORE:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontWeight: 900, fontSize: '24px' }}>
              {scoreResult.totalScore}/100
            </span>
          </div>
        </div>

        {/* EDUCATIONAL CHANDRAYAAN-3 ARCHIVE */}
        <div style={{ width: '100%', background: 'rgba(0, 229, 255, 0.08)', borderRadius: '8px', padding: '10px', border: '1px solid rgba(0, 229, 255, 0.2)', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <BookOpen size={13} /> REAL CHANDRAYAAN-3 ARCHIVE & ACHIEVEMENTS:
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {CHANDRAYAAN3_FACTS.achievements.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
          <button className="resume-action-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }} onClick={onReturnToMenu}>
            <ArrowLeft size={14} /> MENU
          </button>
          <button
            className="resume-action-btn"
            style={{ flex: 1, background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.5)', color: '#eab308' }}
            onClick={() => navigate(ROUTES.LEADERBOARD)}
          >
            <Trophy size={14} /> LEADERBOARD
          </button>
          <button className="resume-action-btn" style={{ flex: 1 }} onClick={onRetry}>
            <RotateCcw size={14} /> REPLAY MISSION 2
          </button>
        </div>
      </div>
    </div>
  );
}
