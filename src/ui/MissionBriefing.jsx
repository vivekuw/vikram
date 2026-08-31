import React from 'react';
import { Play, ArrowLeft, Star, Target, Fuel, Gauge, ShieldAlert } from 'lucide-react';

/**
 * Mission Briefing Screen component (Stage 8E)
 * Displays flight briefing details, objectives, starting conditions, and start/back actions.
 */
export function MissionBriefing({ mission, saveData, onStartMission, onBack }) {
  if (!mission) return null;

  const missionStat = saveData?.stats?.[mission.id] || {};
  const { bestScore = 0, bestStars = 0, attempts = 0 } = missionStat;
  const difficulty = mission.difficulty;

  return (
    <div className="briefing-modal-backdrop">
      <div className="briefing-modal-card">
        {/* TOP HEADER BAR */}
        <div className="briefing-header">
          <div className="briefing-mission-tag">MISSION 0{mission.number} BRIEFING</div>
          <div className="briefing-difficulty" style={{ color: difficulty.color, borderColor: `${difficulty.color}50` }}>
            DIFFICULTY: {difficulty.label}
          </div>
        </div>

        {/* MAIN TITLE & DESCRIPTION */}
        <div className="briefing-hero">
          <h1>{mission.title}</h1>
          <p className="briefing-subtitle">{mission.briefingTitle}</p>
          <p className="briefing-desc">{mission.description}</p>
        </div>

        {/* STARTING PARAMETERS GRID */}
        <div className="briefing-params-grid">
          <div className="param-box">
            <Gauge size={15} color="var(--accent-cyan)" />
            <div className="param-text">
              <span className="param-label">START ALTITUDE</span>
              <span className="param-value">{mission.startingAltitude} m</span>
            </div>
          </div>

          <div className="param-box">
            <Fuel size={15} color={mission.startingFuelPercent < 50 ? '#ff1744' : 'var(--accent-gold)'} />
            <div className="param-text">
              <span className="param-label">START PROPELLANT</span>
              <span className="param-value" style={{ color: mission.startingFuelPercent < 50 ? '#ff1744' : 'var(--accent-gold)' }}>
                {mission.startingFuelPercent}%
              </span>
            </div>
          </div>

          <div className="param-box">
            <Target size={15} color="var(--accent-emerald)" />
            <div className="param-text">
              <span className="param-label">TARGET RADIUS</span>
              <span className="param-value">≤ {mission.landingZoneRadius} m</span>
            </div>
          </div>

          <div className="param-box">
            <ShieldAlert size={15} color="var(--text-muted)" />
            <div className="param-text">
              <span className="param-label">ASSISTANCE HUD</span>
              <span className="param-value">
                {mission.restrictions?.disableScanner ? 'LIMITED (MANUAL)' : 'FULL GUIDANCE'}
              </span>
            </div>
          </div>
        </div>

        {/* OBJECTIVES LIST */}
        <div className="briefing-objectives-section">
          <h3>PRIMARY OBJECTIVES</h3>
          <div className="briefing-obj-list">
            {mission.objectives.map((obj, i) => (
              <div key={obj.id} className="briefing-obj-row">
                <span className={`obj-tag ${obj.mandatory ? 'mandatory' : 'optional'}`}>
                  {obj.mandatory ? 'REQUIRED' : 'BONUS'}
                </span>
                <span className="obj-text">{obj.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PREVIOUS BEST SCORE */}
        {bestScore > 0 && (
          <div className="briefing-previous-best">
            <span>PREVIOUS BEST SCORE: <strong>{bestScore}/100</strong></span>
            <div className="best-stars-row">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < bestStars ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.2)'}
                  fill={i < bestStars ? 'var(--accent-gold)' : 'none'}
                />
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="briefing-actions">
          <button className="briefing-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> BACK TO MENU
          </button>
          <button className="briefing-start-btn" onClick={onStartMission}>
            <Play size={16} fill="#000" /> START MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
