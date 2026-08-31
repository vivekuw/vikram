import { describe, it, expect } from 'vitest';
import { calculateMission2Score } from '../missions/mission2Scoring';

describe('Mission 2 Exploration Scoring Engine', () => {
  it('awards 3 stars and 90+ score for 100% successful mission completion', () => {
    const score = calculateMission2Score({
      objectivesStatus: {
        deploymentDone: true,
        targetADone: true,
        targetBDone: true,
        libsDone: true,
        apxsDone: true,
        targetCDone: true,
        returnedToVikram: true,
      },
      batteryRemaining: 65,
      slopeMax: 4.2,
      isSuccess: true,
    });

    expect(score.totalScore).toBeGreaterThanOrEqual(90);
    expect(score.stars).toBe(3);
    expect(score.facts).toBeDefined();
  });

  it('returns 0 stars on mission failure', () => {
    const score = calculateMission2Score({
      objectivesStatus: {
        deploymentDone: true,
        targetADone: true,
        targetBDone: false,
        libsDone: false,
        apxsDone: false,
        targetCDone: false,
        returnedToVikram: false,
      },
      batteryRemaining: 0,
      slopeMax: 12.0,
      isSuccess: false,
    });

    expect(score.stars).toBe(0);
  });
});
