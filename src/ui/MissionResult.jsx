import React, { useEffect } from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Menu, CheckCircle2, AlertOctagon, BarChart2 } from 'lucide-react';
import { navigate, ROUTES } from '../game/router';
import { saveScoreRecord } from '../game/leaderboard';

/**
 * Post-Flight Mission Result Overlay component (Stage 8I & 8M)
 * Displays flight performance score breakdown, star rating, analytics report, and campaign navigation buttons.
 */
export function MissionResult({
  isSuccess,
  mission,
  scoreResult,
  analyticsReport,
  onNextMission,
  onRetry,
  onReturnToMenu,
  hasNextMission,
}) {
  useEffect(() => {
    if (isSuccess && mission && scoreResult) {
      saveScoreRecord('mission-1', {
        score: scoreResult.totalScore,
        stars: scoreResult.stars,
        touchdownSpeed: analyticsReport?.touchdownVerticalSpeed || '1.5 m/s',
        fuelRemaining: analyticsReport?.fuelRemainingPercent || '40.0%',
        accuracy: analyticsReport?.landingAccuracyDistance || '5.0 m',
      });
    }
  }, [isSuccess, mission, scoreResult, analyticsReport]);

  if (!mission || !scoreResult) return null;

  const { totalScore = 0, stars = 0, categories = {} } = scoreResult;
  const difficulty = mission.difficulty;

  return (
    <div className="result-modal-backdrop">
      <div className={`result-modal-card ${isSuccess ? 'success' : 'failure'}`}>
        {/* HEADER BADGE */}
        <div className="result-header">
          {isSuccess ? (
            <div className="result-status-badge success">
              <CheckCircle2 size={20} />
              <span>🟢 MISSION COMPLETE</span>
            </div>
          ) : (
            <div className="result-status-badge failure">
              <AlertOctagon size={20} />
              <span>🔴 MISSION FAILED</span>
            </div>
          )}
        </div>

        {/* MISSION TITLE */}
        <div className="result-hero-title">
          <h2>MISSION 0{mission.number} — {mission.title}</h2>
          <p>{mission.briefingTitle}</p>
        </div>

        {/* STAR RATING DISPLAY */}
        {isSuccess ? (
          <div className="result-stars-box">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={36}
                className={`star-icon ${i < stars ? 'earned' : 'empty'}`}
                color={i < stars ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.15)'}
                fill={i < stars ? 'var(--accent-gold)' : 'none'}
              />
            ))}
          </div>
        ) : (
          <div className="result-failed-banner">
            <p>Mandatory objectives were not fulfilled or Vikram sustained touchdown damage.</p>
          </div>
        )}

        {/* SCORE BREAKDOWN CATEGORIES (STAGE 8G) */}
        <div className="score-breakdown-panel">
          <div className="breakdown-title">PERFORMANCE SCORE BREAKDOWN</div>

          <div className="category-row">
            <span className="cat-label">Landing Accuracy</span>
            <span className="cat-val">{categories.accuracy ?? 0} / 20</span>
          </div>

          <div className="category-row">
            <span className="cat-label">Touchdown Control</span>
            <span className="cat-val">{categories.touchdown ?? 0} / 25</span>
          </div>

          <div className="category-row">
            <span className="cat-label">Fuel Efficiency</span>
            <span className="cat-val">{categories.fuel ?? 0} / 25</span>
          </div>

          <div className="category-row">
            <span className="cat-label">Attitude Control</span>
            <span className="cat-val">{categories.attitude ?? 0} / 15</span>
          </div>

          <div className="category-row">
            <span className="cat-label">Hazard Avoidance</span>
            <span className="cat-val">{categories.hazard ?? 0} / 15</span>
          </div>

          <div className="category-divider" />

          <div className="total-score-row">
            <span className="total-label">TOTAL PERFORMANCE SCORE</span>
            <span className="total-val">{totalScore} <span className="max-val">/ 100</span></span>
          </div>
        </div>

        {/* ANALYTICS REPORT SUMMARY (STAGE 8M) */}
        {analyticsReport && (
          <div className="analytics-summary-box">
            <div className="analytics-title">
              <BarChart2 size={14} color="var(--accent-cyan)" />
              <span>FLIGHT TELEMETRY ANALYTICS</span>
            </div>
            <div className="analytics-grid">
              <div className="analytics-item">
                <span className="item-label">Descent Time:</span>
                <span className="item-val">{analyticsReport.descentDuration}</span>
              </div>
              <div className="analytics-item">
                <span className="item-label">Touchdown Speed:</span>
                <span className="item-val">{analyticsReport.touchdownVerticalSpeed}</span>
              </div>
              <div className="analytics-item">
                <span className="item-label">Propellant Used:</span>
                <span className="item-val">{analyticsReport.fuelUsedPercent}</span>
              </div>
              <div className="analytics-item">
                <span className="item-label">Landing Offset:</span>
                <span className="item-val">{analyticsReport.landingAccuracyDistance}</span>
              </div>
              <div className="analytics-item">
                <span className="item-label">Attitude Tilt:</span>
                <span className="item-val">{analyticsReport.finalTiltAngle}</span>
              </div>
              <div className="analytics-item">
                <span className="item-label">Terrain Slope:</span>
                <span className="item-val">{analyticsReport.terrainSlopeAngle}</span>
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="result-actions-row">
          <button className="result-btn menu-btn" onClick={onReturnToMenu}>
            <Menu size={15} /> MISSION MENU
          </button>
          <button
            className="result-btn leaderboard-btn"
            onClick={() => navigate(ROUTES.LEADERBOARD)}
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.5)' }}
          >
            <Trophy size={15} /> LEADERBOARD
          </button>
          <button className="result-btn retry-btn" onClick={onRetry}>
            <RotateCcw size={15} /> RETRY
          </button>
          {isSuccess && hasNextMission && (
            <button className="result-btn next-btn" onClick={onNextMission}>
              NEXT MISSION <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
