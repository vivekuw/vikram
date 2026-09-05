/**
 * Leaderboard & Commander Callsign Management System
 * Supports 2 separate mission tables: Mission 1 (Lander) and Mission 2 (Rover).
 */

const COMMANDER_KEY = 'chandrayaan3_commander_callsign';
const LEADERBOARD_KEY = 'chandrayaan3_leaderboard_v1';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  if (!globalThis.__memStorage) {
    const store = {};
    globalThis.__memStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    };
  }
  return globalThis.__memStorage;
}

// Pre-populated ISRO Commander benchmark entries
const DEFAULT_BENCHMARKS = {
  'mission-1': [
    {
      id: 'bm-1',
      commander: 'S. Somanath (ISRO Chief)',
      score: 98,
      stars: 3,
      touchdownSpeed: '1.2 m/s',
      fuelRemaining: '44.5%',
      accuracy: '2.1 m',
      date: '2023-08-23',
      isBenchmark: true,
    },
    {
      id: 'bm-2',
      commander: 'P. Veeramuthuvel (Project Dir.)',
      score: 94,
      stars: 3,
      touchdownSpeed: '1.8 m/s',
      fuelRemaining: '38.0%',
      accuracy: '4.5 m',
      date: '2023-08-23',
      isBenchmark: true,
    },
    {
      id: 'bm-3',
      commander: 'Kalpana K. (Deputy Dir.)',
      score: 89,
      stars: 2,
      touchdownSpeed: '2.3 m/s',
      fuelRemaining: '32.1%',
      accuracy: '7.8 m',
      date: '2023-08-23',
      isBenchmark: true,
    },
  ],
  'mission-2': [
    {
      id: 'bm-201',
      commander: 'Pragyan Pilot Alpha',
      score: 96,
      stars: 3,
      batteryRemaining: '88.0%',
      sciencePayloads: '3 / 3',
      timeElapsed: '04:15',
      date: '2023-08-24',
      isBenchmark: true,
    },
    {
      id: 'bm-202',
      commander: 'Rover Ops Commander',
      score: 90,
      stars: 3,
      batteryRemaining: '76.5%',
      sciencePayloads: '3 / 3',
      timeElapsed: '05:40',
      date: '2023-08-24',
      isBenchmark: true,
    },
    {
      id: 'bm-203',
      commander: 'Lunar Surveyor ISRO',
      score: 82,
      stars: 2,
      batteryRemaining: '62.0%',
      sciencePayloads: '2 / 3',
      timeElapsed: '07:10',
      date: '2023-08-25',
      isBenchmark: true,
    },
  ],
};

/**
 * Gets registered commander callsign or empty string if not set.
 */
export function getCommanderName() {
  try {
    const storage = getStorage();
    return storage.getItem(COMMANDER_KEY) || '';
  } catch (err) {
    return '';
  }
}

/**
 * Sets registered commander callsign in localStorage.
 */
export function setCommanderName(name) {
  try {
    const storage = getStorage();
    const trimmed = (name || '').trim();
    if (trimmed) {
      storage.setItem(COMMANDER_KEY, trimmed);
    }
  } catch (err) {
    console.warn('[Leaderboard] Error saving commander name', err);
  }
}

/**
 * Loads leaderboard records from localStorage, merged with benchmarks.
 */
export function loadLeaderboardData() {
  try {
    const storage = getStorage();
    const raw = storage.getItem(LEADERBOARD_KEY);
    if (!raw) return DEFAULT_BENCHMARKS;
    const parsed = JSON.parse(raw);
    return {
      'mission-1': parsed['mission-1'] || DEFAULT_BENCHMARKS['mission-1'],
      'mission-2': parsed['mission-2'] || DEFAULT_BENCHMARKS['mission-2'],
    };
  } catch (err) {
    console.warn('[Leaderboard] Error reading leaderboard data, returning defaults', err);
    return DEFAULT_BENCHMARKS;
  }
}

/**
 * Saves a new score entry to the specific mission leaderboard.
 * Keeps Top 10 entries per mission.
 */
export function saveScoreRecord(missionId, entryData) {
  const currentData = loadLeaderboardData();
  const targetMission = missionId === 'mission-2' ? 'mission-2' : 'mission-1';
  const list = [...(currentData[targetMission] || [])];

  const newEntry = {
    id: `rec-${Date.now()}`,
    commander: entryData.commander || getCommanderName() || 'Cmdr. Vikram',
    score: entryData.score || 0,
    stars: entryData.stars || 0,
    date: entryData.date || new Date().toISOString().split('T')[0],
    isBenchmark: false,

    // Mission 1 specific
    touchdownSpeed: entryData.touchdownSpeed || 'N/A',
    fuelRemaining: entryData.fuelRemaining || 'N/A',
    accuracy: entryData.accuracy || 'N/A',

    // Mission 2 specific
    batteryRemaining: entryData.batteryRemaining || 'N/A',
    sciencePayloads: entryData.sciencePayloads || 'N/A',
    timeElapsed: entryData.timeElapsed || 'N/A',
  };

  list.push(newEntry);

  // Sort descending by total score, breaking ties by stars/speed
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.stars - a.stars;
  });

  // Keep top 10
  const updatedList = list.slice(0, 10);
  currentData[targetMission] = updatedList;

  try {
    const storage = getStorage();
    storage.setItem(LEADERBOARD_KEY, JSON.stringify(currentData));
  } catch (err) {
    console.error('[Leaderboard] Failed saving score record', err);
  }

  return updatedList;
}

/**
 * Clears custom player records and restores benchmark entries.
 */
export function resetLeaderboardData() {
  try {
    const storage = getStorage();
    storage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_BENCHMARKS));
  } catch (err) {
    console.error('[Leaderboard] Error resetting leaderboard data', err);
  }
  return DEFAULT_BENCHMARKS;
}
export { getStorage };
