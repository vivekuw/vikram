import { useState, useCallback, useRef } from 'react';
import { stepPhysics } from './physics';
import { useControls } from './controls';
import { evaluateLanding } from './landing';
import { calculateTelemetry } from './telemetry';
import { MISSION_STATES } from '../missions/missionTypes';
import { MISSIONS } from '../missions/missionData';
import {
  evaluateObjectives,
  loadSaveData,
  recordMissionResult,
  resetAllProgress,
} from '../missions/missionEngine';
import { calculateMissionScore, generateAnalyticsReport } from '../missions/scoring';
import {
  DRY_MASS,
  MAX_FUEL_MASS,
  INITIAL_POSITION,
  INITIAL_VELOCITY,
  INITIAL_ROTATION,
  INITIAL_THROTTLE,
} from './constants';

export function useLanderState() {
  // 1. Mission State Machine & Progression State
  const [missionState, setMissionState] = useState(MISSION_STATES.MENU);
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  const [saveData, setSaveData] = useState(() => loadSaveData());

  // Mission Results & Evaluation State
  const [evaluatedObjectives, setEvaluatedObjectives] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [analyticsReport, setAnalyticsReport] = useState(null);
  const [landingEvaluation, setLandingEvaluation] = useState(null);

  // Synchronous physical reference state
  const startFuel = MAX_FUEL_MASS * (MISSIONS[0].startingFuelPercent / 100.0);
  const landerRef = useRef({
    position: [INITIAL_POSITION[0], MISSIONS[0].startingAltitude, INITIAL_POSITION[2]],
    velocity: [...INITIAL_VELOCITY],
    rotation: [...INITIAL_ROTATION],
    requestedThrottle: INITIAL_THROTTLE,
    actualThrust: INITIAL_THROTTLE * 3200.0,
    fuelMass: startFuel,
    totalMass: DRY_MASS + startFuel,
    fuelPercentage: MISSIONS[0].startingFuelPercent,
    fuelState: 'NORMAL',
    angularVelocity: 0,
    acceleration: [0, 0, 0],
    engineAccel: (INITIAL_THROTTLE * 3200.0) / (DRY_MASS + startFuel),
    isLanded: false,
  });

  // Elapsed Mission Time counter in seconds
  const missionTimeRef = useRef(0);

  // Simulation Pause & Settings State
  const [isPaused, setIsPaused] = useState(false);

  const [settings, setSettings] = useState({
    showHUD: true,
    showMinimap: true,
    showScanner: false,
    showReticle: true,
    cameraMode: 'chase', // 'chase' | 'wide' | 'landing'
    units: 'Metric',
  });

  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);

  // Computed Telemetry State for HUD
  const [telemetry, setTelemetry] = useState(() =>
    calculateTelemetry(landerRef.current, 0)
  );

  const [debugData, setDebugData] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    engineAccel: 0,
    dryMass: DRY_MASS,
    vx: 0,
    vy: 0,
    vz: 0,
  });

  // Helper to re-spawn physics state from mission parameters
  const spawnMissionPhysics = useCallback((mission) => {
    const startAlt = mission.startingAltitude ?? 250;
    const startFuelP = mission.startingFuelPercent ?? 100;
    const initialFuelMass = MAX_FUEL_MASS * (startFuelP / 100.0);

    landerRef.current = {
      position: [INITIAL_POSITION[0], startAlt, INITIAL_POSITION[2]],
      velocity: [...INITIAL_VELOCITY],
      rotation: [...INITIAL_ROTATION],
      requestedThrottle: INITIAL_THROTTLE,
      actualThrust: INITIAL_THROTTLE * 3200.0,
      fuelMass: initialFuelMass,
      totalMass: DRY_MASS + initialFuelMass,
      fuelPercentage: startFuelP,
      fuelState: startFuelP <= 10 ? 'CRITICAL' : startFuelP <= 20 ? 'LOW' : 'NORMAL',
      angularVelocity: 0,
      acceleration: [0, 0, 0],
      engineAccel: (INITIAL_THROTTLE * 3200.0) / (DRY_MASS + initialFuelMass),
      isLanded: false,
    };

    missionTimeRef.current = 0;
    setIsPaused(false);
    setLandingEvaluation(null);
    setScoreResult(null);
    setAnalyticsReport(null);

    const initialTelemetry = calculateTelemetry(landerRef.current, 0);
    setTelemetry(initialTelemetry);
    setEvaluatedObjectives(evaluateObjectives(initialTelemetry, mission));
  }, []);

  // Action: Select mission from menu -> enter BRIEFING state
  const selectMission = useCallback((mission) => {
    setActiveMission(mission);
    spawnMissionPhysics(mission);
    setMissionState(MISSION_STATES.BRIEFING);
  }, [spawnMissionPhysics]);

  // Action: Start mission descent from briefing screen -> enter ACTIVE state
  const startActiveMission = useCallback(() => {
    spawnMissionPhysics(activeMission);
    setMissionState(MISSION_STATES.ACTIVE);
  }, [activeMission, spawnMissionPhysics]);

  // Action: Reset/Restart active mission
  const resetSimulation = useCallback(() => {
    spawnMissionPhysics(activeMission);
    setMissionState(MISSION_STATES.ACTIVE);
  }, [activeMission, spawnMissionPhysics]);

  // Action: Return to main menu
  const returnToMenu = useCallback(() => {
    setMissionState(MISSION_STATES.MENU);
  }, []);

  // Action: Reset campaign save progress
  const resetProgress = useCallback(() => {
    const freshSave = resetAllProgress();
    setSaveData(freshSave);
    setMissionState(MISSION_STATES.MENU);
  }, []);

  // Action: Proceed to next unlocked mission
  const nextMission = useCallback(() => {
    const currentIndex = MISSIONS.findIndex((m) => m.id === activeMission.id);
    if (currentIndex >= 0 && currentIndex < MISSIONS.length - 1) {
      const nextM = MISSIONS[currentIndex + 1];
      selectMission(nextM);
    } else {
      returnToMenu();
    }
  }, [activeMission, selectMission, returnToMenu]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const updateSettings = useCallback((newPartialSettings) => {
    setSettings((prev) => ({ ...prev, ...newPartialSettings }));
  }, []);

  const setCameraMode = useCallback((mode) => {
    setSettings((prev) => ({ ...prev, cameraMode: mode }));
  }, []);

  const toggleCameraMode = useCallback(() => {
    setSettings((prev) => {
      const cur = prev.cameraMode;
      const next = cur === 'chase' ? 'wide' : cur === 'wide' ? 'landing' : 'chase';
      return { ...prev, cameraMode: next };
    });
  }, []);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode((prev) => !prev);
  }, []);

  const toggleInspectMode = useCallback(() => {
    setIsInspectMode((prev) => !prev);
  }, []);

  const toggleScannerMode = useCallback(() => {
    setIsScannerActive((prev) => !prev);
    setSettings((prev) => ({ ...prev, showScanner: !prev.showScanner }));
  }, []);

  // Keyboard controls hook
  const { keysPressed, setControlState } = useControls({
    onReset: resetSimulation,
    onToggleCamera: toggleCameraMode,
    onToggleDebug: toggleDebugMode,
    onToggleScanner: toggleScannerMode,
    onToggleInspect: toggleInspectMode,
    onTogglePause: togglePause,
    enabled: activeMission?.number === 1,
  });

  // Per-frame physics tick handler
  const updateLanderFrame = (delta) => {
    // If not in active or paused state, or lander has landed, freeze physics
    if (
      missionState !== MISSION_STATES.ACTIVE &&
      missionState !== MISSION_STATES.PAUSED
    ) {
      return;
    }

    if (isPaused || landerRef.current.isLanded) {
      const currentTelemetry = calculateTelemetry(landerRef.current, missionTimeRef.current);
      setTelemetry(currentTelemetry);
      return;
    }

    const currentState = landerRef.current;
    const inputs = keysPressed.current;

    // Run physics step
    const nextState = stepPhysics(currentState, inputs, delta);
    landerRef.current = nextState;

    // Accumulate mission timer
    missionTimeRef.current += delta;

    // Compute live telemetry layer
    const currentTelemetry = calculateTelemetry(nextState, missionTimeRef.current);
    setTelemetry(currentTelemetry);

    // Evaluate live mission objectives
    const objEval = evaluateObjectives(currentTelemetry, activeMission);
    setEvaluatedObjectives(objEval);

    // Touchdown event trigger
    if (nextState.isTouchdownEvent && !landingEvaluation) {
      nextState.isLanded = true;
      const evaluation = evaluateLanding(currentTelemetry);
      setLandingEvaluation(evaluation);

      const isSafe = evaluation.outcome === 'SAFE';
      const isSuccess = isSafe && objEval.allMandatoryPassed;

      // Calculate score & analytics report
      const calculatedScore = calculateMissionScore(currentTelemetry, activeMission, isSafe);
      const report = generateAnalyticsReport(currentTelemetry, calculatedScore, activeMission);

      setScoreResult(calculatedScore);
      setAnalyticsReport(report);

      // Save progression locally
      const updatedSave = recordMissionResult(activeMission.id, isSuccess, calculatedScore);
      setSaveData(updatedSave);

      // Transition to final state
      setMissionState(isSuccess ? MISSION_STATES.SUCCESS : MISSION_STATES.FAILURE);
    }

    // Sync vector debug data if enabled
    if (isDebugMode) {
      setDebugData({
        accelX: parseFloat(nextState.acceleration[0].toFixed(2)),
        accelY: parseFloat(nextState.acceleration[1].toFixed(2)),
        accelZ: parseFloat(nextState.acceleration[2].toFixed(2)),
        engineAccel: parseFloat(nextState.engineAccel.toFixed(2)),
        dryMass: DRY_MASS,
        vx: parseFloat(nextState.velocity[0].toFixed(2)),
        vy: parseFloat(nextState.velocity[1].toFixed(2)),
        vz: parseFloat(nextState.velocity[2].toFixed(2)),
      });
    }
  };

  return {
    landerRef,
    telemetry,
    landingEvaluation,
    debugData,
    isDebugMode,
    setIsDebugMode,
    isInspectMode,
    toggleInspectMode,
    isScannerActive: settings.showScanner || isScannerActive,
    setIsScannerActive,
    toggleScannerMode,
    cameraMode: settings.cameraMode,
    setCameraMode,
    resetSimulation,
    setControlState,
    updateLanderFrame,
    isPaused,
    togglePause,
    settings,
    updateSettings,
    // Stage 8 Additions:
    missionState,
    activeMission,
    saveData,
    evaluatedObjectives,
    scoreResult,
    analyticsReport,
    selectMission,
    startActiveMission,
    returnToMenu,
    resetProgress,
    nextMission,
  };
}
