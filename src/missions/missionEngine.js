import { OBJECTIVE_TYPES } from './missionTypes';
import { MISSIONS } from './missionData';

const SAVE_KEY = 'chandrayaan3_mission_save_v1';

/**
 * Real-time objective evaluator engine.
 * Computes objective pass/fail status directly from telemetry data.
 *
 * @param {Object} telemetry - Real-time lander telemetry
 * @param {Object} mission - Active mission definition
 * @returns {Object} Evaluated objectives array and overall status
 */
export function evaluateObjectives(telemetry, mission) {
  if (!telemetry || !mission || !mission.objectives) {
    return { objectivesList: [], allMandatoryPassed: false, allPassed: false };
  }

  const {
    altitude = 0,
    verticalVelocity = 0,
    horizontalVelocity = 0,
    tilt = 0,
    fuelPercent = 100,
    targetDistance = 0,
    terrainSlope = 0,
    isLanded = false,
    landingStatus = '',
  } = telemetry;

  const isSafeLanding = landingStatus === 'SAFE LANDING' || (isLanded && Math.abs(verticalVelocity) <= 4.0 && tilt <= 10);

  const evaluatedObjectives = mission.objectives.map((obj) => {
    let passed = false;
    let currentValueStr = '';
    let targetValueStr = '';

    switch (obj.type) {
      case OBJECTIVE_TYPES.SAFE_LANDING:
        passed = isSafeLanding;
        currentValueStr = isLanded ? (isSafeLanding ? 'TOUCHDOWN SAFE' : 'CRASHED / HARD') : 'DESCENT IN PROGRESS';
        targetValueStr = 'SAFE TOUCHDOWN';
        break;

      case OBJECTIVE_TYPES.LANDING_INSIDE_ZONE:
        passed = targetDistance <= (obj.targetValue || mission.landingZoneRadius);
        currentValueStr = `${targetDistance} m`;
        targetValueStr = `≤ ${obj.targetValue || mission.landingZoneRadius} m`;
        break;

      case OBJECTIVE_TYPES.MAX_TARGET_DISTANCE:
        passed = targetDistance <= obj.targetValue;
        currentValueStr = `${targetDistance} m`;
        targetValueStr = `≤ ${obj.targetValue} m`;
        break;

      case OBJECTIVE_TYPES.MAX_TILT:
        passed = tilt <= obj.targetValue;
        currentValueStr = `${tilt}°`;
        targetValueStr = `≤ ${obj.targetValue}°`;
        break;

      case OBJECTIVE_TYPES.MAX_TOUCHDOWN_SPEED:
        passed = Math.abs(verticalVelocity) <= obj.targetValue;
        currentValueStr = `${Math.abs(verticalVelocity).toFixed(1)} m/s`;
        targetValueStr = `≤ ${obj.targetValue} m/s`;
        break;

      case OBJECTIVE_TYPES.MAX_HORIZONTAL_SPEED:
        passed = horizontalVelocity <= obj.targetValue;
        currentValueStr = `${horizontalVelocity.toFixed(1)} m/s`;
        targetValueStr = `≤ ${obj.targetValue} m/s`;
        break;

      case OBJECTIVE_TYPES.MIN_REMAINING_FUEL:
        passed = fuelPercent >= obj.targetValue;
        currentValueStr = `${fuelPercent.toFixed(1)}%`;
        targetValueStr = `≥ ${obj.targetValue}%`;
        break;

      case OBJECTIVE_TYPES.MAX_SLOPE:
        passed = terrainSlope <= obj.targetValue;
        currentValueStr = `${terrainSlope.toFixed(1)}°`;
        targetValueStr = `≤ ${obj.targetValue}°`;
        break;

      case OBJECTIVE_TYPES.AVOID_MAJOR_COLLISION:
        passed = isLanded ? isSafeLanding : true;
        currentValueStr = isSafeLanding ? 'NO COLLISION' : 'COLLISION DETECTED';
        targetValueStr = '0 COLLISIONS';
        break;

      default:
        passed = true;
    }

    return {
      ...obj,
      passed,
      currentValueStr,
      targetValueStr,
    };
  });

  const mandatoryObjs = evaluatedObjectives.filter((o) => o.mandatory);
  const allMandatoryPassed = mandatoryObjs.every((o) => o.passed);
  const allPassed = evaluatedObjectives.every((o) => o.passed);

  return {
    objectivesList: evaluatedObjectives,
    allMandatoryPassed,
    allPassed,
  };
}

/**
 * Local Save Progression Management (`localStorage`)
 */
export function getDefaultSaveData() {
  return {
    version: 1,
    unlockedMissions: ['mission-1'],
    stats: {
      'mission-1': {
        unlocked: true,
        completed: false,
        bestScore: 0,
        bestStars: 0,
        attempts: 0,
        successfulLandings: 0,
      },
    },
  };
}

export function loadSaveData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return getDefaultSaveData();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
      return getDefaultSaveData();
    }
    return parsed;
  } catch (err) {
    console.warn('[MissionEngine] Error loading save data, resetting to default.', err);
    return getDefaultSaveData();
  }
}

export function saveProgress(saveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (err) {
    console.error('[MissionEngine] Error writing to localStorage', err);
  }
}

/**
 * Records mission attempt & result, updating unlocked missions and best scores.
 */
export function recordMissionResult(missionId, isSuccess, scoreResult) {
  const saveData = loadSaveData();
  const currentStats = saveData.stats[missionId] || {
    unlocked: true,
    completed: false,
    bestScore: 0,
    bestStars: 0,
    attempts: 0,
    successfulLandings: 0,
  };

  currentStats.attempts += 1;

  if (isSuccess && scoreResult) {
    currentStats.completed = true;
    currentStats.successfulLandings += 1;
    currentStats.bestScore = Math.max(currentStats.bestScore, scoreResult.totalScore);
    currentStats.bestStars = Math.max(currentStats.bestStars, scoreResult.stars);

    // Unlock Next Mission in sequence
    const currentIndex = MISSIONS.findIndex((m) => m.id === missionId);
    if (currentIndex >= 0 && currentIndex < MISSIONS.length - 1) {
      const nextMission = MISSIONS[currentIndex + 1];
      if (!saveData.unlockedMissions.includes(nextMission.id)) {
        saveData.unlockedMissions.push(nextMission.id);
      }
      if (!saveData.stats[nextMission.id]) {
        saveData.stats[nextMission.id] = {
          unlocked: true,
          completed: false,
          bestScore: 0,
          bestStars: 0,
          attempts: 0,
          successfulLandings: 0,
        };
      } else {
        saveData.stats[nextMission.id].unlocked = true;
      }
    }
  }

  saveData.stats[missionId] = currentStats;
  saveProgress(saveData);
  return saveData;
}

export function resetAllProgress() {
  const defaultData = getDefaultSaveData();
  saveProgress(defaultData);
  return defaultData;
}
