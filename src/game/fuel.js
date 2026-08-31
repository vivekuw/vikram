import {
  MAX_FUEL_MASS,
  ENGINE_MAX_THRUST,
  FUEL_CONSUMPTION_RATE,
  FUEL_STATUS_THRESHOLDS,
} from './constants';

/**
 * Pure fuel consumption step function.
 * Calculates fuel burn, remaining fuel mass, fuel percentage, actual thrust, and status badge.
 *
 * @param {number} currentFuelMass - Remaining fuel mass in kg
 * @param {number} requestedThrottle - Normalized requested throttle (0.0 to 1.0)
 * @param {number} deltaTime - Frame time delta in seconds
 * @returns {Object} Calculated fuel state & actual engine thrust
 */
export function calculateFuelStep(currentFuelMass, requestedThrottle, deltaTime) {
  // If fuel is already empty, no fuel can be burned and engine thrust is ZERO
  if (currentFuelMass <= 0) {
    return {
      remainingFuelMass: 0,
      fuelPercentage: 0,
      actualThrust: 0,
      fuelState: 'EMPTY',
      isFuelEmpty: true,
    };
  }

  // Calculate fuel burn rate based on requested throttle
  const burnRate = FUEL_CONSUMPTION_RATE * requestedThrottle;
  const fuelUsed = burnRate * deltaTime;

  // Update remaining fuel mass, clamped to 0
  const remainingFuelMass = Math.max(0, currentFuelMass - fuelUsed);
  const fuelPercentage = Math.max(0, (remainingFuelMass / MAX_FUEL_MASS) * 100);

  // Engine Cutoff Rule: If fuel reached zero during this frame, actual thrust drops to 0
  const isFuelEmpty = remainingFuelMass <= 0;
  const actualThrust = isFuelEmpty ? 0 : ENGINE_MAX_THRUST * requestedThrottle;

  // Determine Fuel Status Badge
  let fuelState = 'NORMAL';
  if (fuelPercentage <= FUEL_STATUS_THRESHOLDS.EMPTY) {
    fuelState = 'EMPTY';
  } else if (fuelPercentage <= FUEL_STATUS_THRESHOLDS.CRITICAL) {
    fuelState = 'CRITICAL';
  } else if (fuelPercentage <= FUEL_STATUS_THRESHOLDS.LOW) {
    fuelState = 'LOW';
  } else if (fuelPercentage <= FUEL_STATUS_THRESHOLDS.CAUTION) {
    fuelState = 'CAUTION';
  }

  return {
    remainingFuelMass,
    fuelPercentage,
    actualThrust,
    fuelState,
    isFuelEmpty,
  };
}
