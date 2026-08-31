import React from 'react';
import { MISSIONS } from '../missions/missionData';
import { Play, Lock, Star, Rocket, ShieldCheck, Trophy, RotateCcw } from 'lucide-react';

/**
 * Mission Selection Menu screen (Stage 8A & 8J)
 * Displays available missions grid with difficulty badges, unlock statuses, best scores, and star ratings.
 */
export function MissionSelect({ saveData = {}, onSelectMission, onResetProgress }) {
  const { unlockedMissions = [], stats = {} } = saveData || {};

  return (
    <div className="mission-select-screen">
      {/* HEADER BAR */}
      <header className="select-header">
        <div className="select-brand">
          <div className="select-flag">ISRO</div>
          <div className="select-title">
            <h1>CHANDRAYAAN-3</h1>
            <p>VIKRAM LANDER DESCENT SIMULATOR — CAMPAIGN</p>
          </div>
        </div>

        <div className="select-header-actions">
          <button className="reset-progress-btn" onClick={onResetProgress} title="Reset save progress">
            <RotateCcw size={13} /> RESET PROGRESS
          </button>
        </div>
      </header>

      {/* MAIN CONTENT TITLE */}
      <div className="select-hero">
        <h2>SELECT MISSION</h2>
        <p>Execute a controlled soft descent and touchdown on the lunar surface with Vikram Lander.</p>
      </div>

      {/* MISSIONS GRID */}
      <div className="missions-grid">
        {MISSIONS.map((mission) => {
          const isUnlocked = unlockedMissions.includes(mission.id) || true;
          const missionStat = stats[mission.id] || {};
          const { completed = false, bestScore = 0, bestStars = 0, attempts = 0 } = missionStat;
          const difficulty = mission.difficulty;

          return (
            <div
              key={mission.id}
              className={`mission-card ${isUnlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
              onClick={() => isUnlocked && onSelectMission(mission)}
            >
              {/* CARD HEADER */}
              <div className="card-top">
                <div className="mission-num-badge">MISSION 0{mission.number}</div>
                {mission.number === 1 && (
                  <span className="default-mission-tag" style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.5)', backgroundColor: 'rgba(30, 58, 138, 0.4)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid', fontWeight: 700, letterSpacing: '0.5px' }}>
                    DEFAULT
                  </span>
                )}
                <div className="difficulty-badge" style={{ color: difficulty.color, borderColor: `${difficulty.color}50` }}>
                  {difficulty.label}
                </div>
              </div>

              {/* MISSION TITLE & BRIEF */}
              <div className="card-body">
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
              </div>

              {/* STAR RATING DISPLAY */}
              <div className="card-stars">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    color={i < bestStars ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.15)'}
                    fill={i < bestStars ? 'var(--accent-gold)' : 'none'}
                  />
                ))}
              </div>

              {/* FOOTER & LAUNCH BUTTON */}
              <div className="card-footer">
                {isUnlocked ? (
                  <>
                    <div className="card-score-info">
                      {completed ? (
                        <span className="best-score">HIGH SCORE: <strong>{bestScore}/100</strong></span>
                      ) : (
                        <span className="uncompleted">NOT COMPLETED</span>
                      )}
                    </div>
                    <button className="launch-mission-btn">
                      <Play size={14} fill="#000" /> START
                    </button>
                  </>
                ) : (
                  <div className="locked-info">
                    <Lock size={14} color="var(--text-muted)" />
                    <span>LOCKED — Complete Mission 0{mission.number - 1}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
