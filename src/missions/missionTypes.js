/**
 * Mission Lifecycle States & Objective Constants for Chandrayaan-3 Vikram Lander Simulator
 */

export const MISSION_STATES = {
  MENU: 'MENU',             // Main Mission Selection Menu
  BRIEFING: 'BRIEFING',     // Mission Briefing Screen
  READY: 'READY',           // Initialized state before descent start
  ACTIVE: 'ACTIVE',         // Active gameplay descent loop
  PAUSED: 'PAUSED',         // Simulation paused
  TOUCHDOWN: 'TOUCHDOWN',   // Touched down on surface
  EVALUATING: 'EVALUATING', // Evaluating objectives & score
  SUCCESS: 'SUCCESS',       // Mission Completed Successfully
  FAILURE: 'FAILURE',       // Mission Failed
};

export const OBJECTIVE_TYPES = {
  SAFE_LANDING: 'SAFE_LANDING',
  LANDING_INSIDE_ZONE: 'LANDING_INSIDE_ZONE',
  MAX_TILT: 'MAX_TILT',
  MAX_TOUCHDOWN_SPEED: 'MAX_TOUCHDOWN_SPEED',
  MAX_HORIZONTAL_SPEED: 'MAX_HORIZONTAL_SPEED',
  MIN_REMAINING_FUEL: 'MIN_REMAINING_FUEL',
  MAX_TARGET_DISTANCE: 'MAX_TARGET_DISTANCE',
  AVOID_MAJOR_COLLISION: 'AVOID_MAJOR_COLLISION',
  MAX_SLOPE: 'MAX_SLOPE',
};

export const DIFFICULTY_LEVELS = {
  EASY: { label: 'EASY', color: '#00e676', stars: 1 },
  NORMAL: { label: 'NORMAL', color: '#ffd700', stars: 2 },
  HARD: { label: 'HARD', color: '#ff9100', stars: 3 },
  EXPERT: { label: 'EXPERT', color: '#ff1744', stars: 4 },
};
