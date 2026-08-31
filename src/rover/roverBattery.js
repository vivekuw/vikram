import { ROVER_CONSTANTS } from './roverConstants';

/**
 * Pragyan Rover Battery System Manager
 * Computes battery consumption from movement, slope, and science operations.
 */
export function getBatteryStatus(percent) {
  if (percent <= 0) return { label: 'POWER DEPLETED', color: '#ff1744', state: 'EMPTY' };
  if (percent <= ROVER_CONSTANTS.BATTERY_LOW) return { label: 'CRITICAL', color: '#ff1744', state: 'CRITICAL' };
  if (percent <= ROVER_CONSTANTS.BATTERY_CAUTION) return { label: 'LOW', color: '#ff9100', state: 'LOW' };
  if (percent <= ROVER_CONSTANTS.BATTERY_NORMAL) return { label: 'CAUTION', color: '#ffd700', state: 'CAUTION' };
  return { label: 'NORMAL', color: '#00e676', state: 'NORMAL' };
}

export function consumeDrivingBattery(currentBattery, distance, isClimbingSlope) {
  if (currentBattery <= 0) return 0;
  const slopeMult = isClimbingSlope ? ROVER_CONSTANTS.SLOPE_MULTIPLIER : 1.0;
  const drain = distance * ROVER_CONSTANTS.DRIVE_CONSUMPTION * slopeMult;
  return Math.max(0, currentBattery - drain);
}

export function consumeTurningBattery(currentBattery, deltaTime) {
  if (currentBattery <= 0) return 0;
  const drain = deltaTime * ROVER_CONSTANTS.TURN_CONSUMPTION;
  return Math.max(0, currentBattery - drain);
}

export function consumeScienceBattery(currentBattery, instrumentType) {
  if (currentBattery <= 0) return 0;
  const cost = instrumentType === 'LIBS' ? ROVER_CONSTANTS.LIBS_ENERGY_COST : ROVER_CONSTANTS.APXS_ENERGY_COST;
  return Math.max(0, currentBattery - cost);
}
