import { CHANDRAYAAN3_FACTS } from '../data/chandrayaan3Facts';

/**
 * Calculates Mission 2 Scoring breakdown and star ratings.
 */
export function calculateMission2Score({ objectivesStatus, batteryRemaining, slopeMax, isSuccess }) {
  if (!isSuccess) {
    return {
      navigationScore: 40,
      batteryScore: Math.floor(batteryRemaining * 0.5),
      scienceScore: (objectivesStatus.libsDone ? 50 : 0) + (objectivesStatus.apxsDone ? 50 : 0),
      terrainScore: Math.max(0, 100 - Math.floor(slopeMax * 2)),
      totalScore: 45,
      stars: 0,
    };
  }

  const navigationScore = objectivesStatus.targetADone ? 100 : 50;
  const batteryScore = Math.min(100, Math.max(50, Math.floor(batteryRemaining * 1.2)));
  const scienceScore = (objectivesStatus.libsDone ? 50 : 0) + (objectivesStatus.apxsDone ? 50 : 0);
  const terrainScore = Math.max(50, 100 - Math.floor(slopeMax * 1.5));
  const completionScore = 100;

  const totalScore = Math.round(
    navigationScore * 0.2 + batteryScore * 0.25 + scienceScore * 0.25 + terrainScore * 0.1 + completionScore * 0.2
  );

  let stars = 1;
  if (totalScore >= 90) stars = 3;
  else if (totalScore >= 75) stars = 2;

  return {
    navigationScore,
    batteryScore,
    scienceScore,
    terrainScore,
    completionScore,
    totalScore,
    stars,
    facts: CHANDRAYAAN3_FACTS,
  };
}
