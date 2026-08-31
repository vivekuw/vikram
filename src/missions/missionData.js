import { OBJECTIVE_TYPES, DIFFICULTY_LEVELS } from './missionTypes';

/**
 * Single Mission Configuration for Chandrayaan-3 Vikram Lander Simulator
 */
export const MISSIONS = [
  {
    id: 'mission-1',
    number: 1,
    title: 'VIKRAM LANDER TOUCHDOWN',
    briefingTitle: 'CHANDRAYAAN-3 LUNAR LANDING MISSION',
    description: 'Perform a controlled descent from 200m altitude and execute a soft touchdown inside the designated lunar landing zone.',
    difficulty: DIFFICULTY_LEVELS.NORMAL,
    startingAltitude: 200,
    startingFuelPercent: 100,
    landingZoneRadius: 15,
    restrictions: {
      disableScanner: false,
      disableGuidance: false,
    },
    objectives: [
      {
        id: 'obj-1-1',
        type: OBJECTIVE_TYPES.SAFE_LANDING,
        label: 'Execute a safe touchdown',
        mandatory: true,
      },
      {
        id: 'obj-1-2',
        type: OBJECTIVE_TYPES.LANDING_INSIDE_ZONE,
        label: 'Touch down inside target zone (≤ 15m)',
        targetValue: 15,
        mandatory: true,
      },
      {
        id: 'obj-1-3',
        type: OBJECTIVE_TYPES.MAX_TILT,
        label: 'Keep lander tilt ≤ 10°',
        targetValue: 10,
        mandatory: false,
      },
      {
        id: 'obj-1-4',
        type: OBJECTIVE_TYPES.MAX_TOUCHDOWN_SPEED,
        label: 'Descent speed ≤ 4.0 m/s',
        targetValue: 4.0,
        mandatory: false,
      },
    ],
  },
];
