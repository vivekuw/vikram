import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCommanderName,
  setCommanderName,
  loadLeaderboardData,
  saveScoreRecord,
  resetLeaderboardData,
  getStorage,
} from '../game/leaderboard';

describe('Leaderboard & Commander Management System', () => {
  beforeEach(() => {
    getStorage().clear();
  });

  it('should get and set commander name correctly', () => {
    expect(getCommanderName()).toBe('');
    setCommanderName('Cmdr. Vikram-01');
    expect(getCommanderName()).toBe('Cmdr. Vikram-01');
  });

  it('should load default ISRO benchmark entries for both mission tables', () => {
    const data = loadLeaderboardData();
    expect(data['mission-1']).toBeDefined();
    expect(data['mission-2']).toBeDefined();
    expect(data['mission-1'].length).toBeGreaterThan(0);
    expect(data['mission-2'].length).toBeGreaterThan(0);
    expect(data['mission-1'][0].isBenchmark).toBe(true);
  });

  it('should save a new score entry to mission-1 and sort by highest score', () => {
    setCommanderName('Test Commander');
    const newEntry = {
      score: 100,
      stars: 3,
      touchdownSpeed: '0.8 m/s',
      fuelRemaining: '50.0%',
      accuracy: '1.0 m',
    };

    const updatedList = saveScoreRecord('mission-1', newEntry);
    expect(updatedList[0].score).toBe(100);
    expect(updatedList[0].commander).toBe('Test Commander');
  });

  it('should save a new score entry to mission-2 separate table', () => {
    setCommanderName('Rover Pilot');
    const newEntry = {
      score: 99,
      stars: 3,
      batteryRemaining: '95.0%',
      sciencePayloads: '3 / 3',
      timeElapsed: '03:30',
    };

    const updatedList = saveScoreRecord('mission-2', newEntry);
    expect(updatedList[0].score).toBe(99);
    expect(updatedList[0].commander).toBe('Rover Pilot');

    const fullData = loadLeaderboardData();
    expect(fullData['mission-2'][0].score).toBe(99);
  });

  it('should reset data back to default benchmarks', () => {
    saveScoreRecord('mission-1', { score: 100, stars: 3 });
    const reset = resetLeaderboardData();
    expect(reset['mission-1'].some((e) => e.isBenchmark)).toBe(true);
  });
});
