import { describe, it, expect } from 'vitest';
import {
  getBatteryStatus,
  consumeDrivingBattery,
  consumeTurningBattery,
  consumeScienceBattery,
} from '../rover/roverBattery';

describe('Pragyan Rover Battery System', () => {
  it('correctly maps battery percentage to status labels', () => {
    expect(getBatteryStatus(100).label).toBe('NORMAL');
    expect(getBatteryStatus(40).label).toBe('CAUTION');
    expect(getBatteryStatus(15).label).toBe('LOW');
    expect(getBatteryStatus(5).label).toBe('CRITICAL');
    expect(getBatteryStatus(0).label).toBe('POWER DEPLETED');
  });

  it('consumes battery proportional to driving distance', () => {
    const startBat = 100;
    const distance = 10; // meters
    const remaining = consumeDrivingBattery(startBat, distance, false);

    expect(remaining).toBeLessThan(startBat);
  });

  it('applies slope multiplier when climbing hills', () => {
    const startBat = 100;
    const distance = 10;
    const flatRemaining = consumeDrivingBattery(startBat, distance, false);
    const slopeRemaining = consumeDrivingBattery(startBat, distance, true);

    expect(slopeRemaining).toBeLessThan(flatRemaining);
  });

  it('consumes battery for LIBS and APXS science operations', () => {
    const startBat = 50;
    const libsRemaining = consumeScienceBattery(startBat, 'LIBS');
    const apxsRemaining = consumeScienceBattery(startBat, 'APXS');

    expect(libsRemaining).toBe(46); // -4%
    expect(apxsRemaining).toBe(45); // -5%
  });

  it('prevents battery from dropping below 0%', () => {
    const lowBat = 2;
    const remaining = consumeScienceBattery(lowBat, 'APXS');

    expect(remaining).toBe(0);
  });
});
