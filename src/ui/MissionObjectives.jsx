import React, { useState } from 'react';
import { Target, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Real-time HUD Mission Objectives component (Stage 8D)
 * Displays active mission objectives and live pass/fail status without cluttering the screen.
 */
export function MissionObjectives({ mission, evaluatedObjectives }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!mission || !evaluatedObjectives || !evaluatedObjectives.objectivesList) {
    return null;
  }

  const { objectivesList } = evaluatedObjectives;

  return (
    <div className="hud-panel objectives-hud-panel interactive">
      <div className="hud-panel-header" onClick={() => setIsCollapsed((prev) => !prev)} style={{ cursor: 'pointer' }}>
        <div className="hud-panel-title">
          <Target size={14} color="var(--accent-gold)" />
          <span>OBJECTIVES (0{mission.number})</span>
        </div>
        <button className="collapse-toggle-btn">
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="objectives-list-body">
          {objectivesList.map((obj) => (
            <div key={obj.id} className={`objective-item-row ${obj.passed ? 'passed' : 'pending'}`}>
              <div className="obj-icon-box">
                {obj.passed ? (
                  <CheckSquare size={14} color="#00e676" />
                ) : (
                  <Square size={14} color="var(--text-muted)" />
                )}
              </div>
              <div className="obj-text-box">
                <span className="obj-label-text">{obj.label}</span>
                <span className="obj-val-text">
                  [{obj.currentValueStr} / {obj.targetValueStr}]
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
