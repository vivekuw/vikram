import { useState, useRef, useCallback, useEffect } from 'react';
import { ROVER_CONSTANTS } from './roverConstants';
import { stepRoverPhysics } from './roverPhysics';
import { consumeDrivingBattery, consumeTurningBattery, consumeScienceBattery, getBatteryStatus } from './roverBattery';
import { executeScienceInstrument } from '../science/scienceEngine';
import { soundEngine } from '../game/soundEngine';

export const ROVER_STATES = {
  VIKRAM_LANDED: 'VIKRAM_LANDED',
  ROVER_DEPLOYMENT: 'ROVER_DEPLOYMENT',
  DEPLOYMENT_COMPLETE: 'DEPLOYMENT_COMPLETE',
  ROVER_READY: 'ROVER_READY',
  EXPLORATION: 'EXPLORATION',
  SCIENCE_TARGET: 'SCIENCE_TARGET',
  RETURN_TO_VIKRAM: 'RETURN_TO_VIKRAM',
  MISSION_COMPLETE: 'MISSION_COMPLETE',
  MISSION_FAILED: 'MISSION_FAILED',
};

export function useRoverState() {
  const [roverState, setRoverState] = useState(ROVER_STATES.ROVER_DEPLOYMENT);
  const [deploymentStep, setDeploymentStep] = useState(1);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  // Synchronous Physical State Ref
  const roverRef = useRef({
    position: [0, 0.35, 2.5], // Spawns near Vikram (0,0)
    velocity: 0,
    heading: Math.PI, // Facing South (-Z ➔ +Z)
    wheelAngle: 0,
    battery: ROVER_CONSTANTS.STARTING_BATTERY,
    slopeAngle: 0,
    isDriving: false,
    isTurning: false,
    distTraveled: 0,
    collisionStatus: 'SAFE',
    isImmobilized: false,
  });

  // Target Objectives Completion State
  const [objectivesStatus, setObjectivesStatus] = useState({
    deploymentDone: false,
    targetADone: false,
    targetBDone: false,
    libsDone: false,
    apxsDone: false,
    targetCDone: false,
    returnedToVikram: false,
  });

  // Science Modal State
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [activeScienceResult, setActiveScienceResult] = useState(null);

  // UI & Camera Controls
  const [cameraMode, setCameraMode] = useState('chase'); // 'chase' | 'top' | 'front' | 'science'
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [missionTime, setMissionTime] = useState('T+ 00:00:00');
  const [failureReason, setFailureReason] = useState('');

  // Elapsed Time Counter
  const timeRef = useRef(0);

  // 1. Automatic Deployment Sequence Timer
  useEffect(() => {
    if (roverState !== ROVER_STATES.ROVER_DEPLOYMENT) return;

    const timer = setInterval(() => {
      setDeploymentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setRoverState(ROVER_STATES.EXPLORATION);
          setObjectivesStatus((o) => ({ ...o, deploymentDone: true }));
          return 100;
        }
        const next = prev + 10;
        if (next === 30) setDeploymentStep(3);
        if (next === 60) setDeploymentStep(5);
        if (next === 90) setDeploymentStep(7);
        return next;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [roverState]);

  // 2. Physics & Mission Loop Frame Updater
  const updateRoverFrame = useCallback((dt, inputs) => {
    if (isPaused || roverState === ROVER_STATES.MISSION_COMPLETE || roverState === ROVER_STATES.MISSION_FAILED) return;

    // Increment Timer during exploration
    if (roverState === ROVER_STATES.EXPLORATION || roverState === ROVER_STATES.RETURN_TO_VIKRAM) {
      timeRef.current += dt;
      const totalSec = Math.floor(timeRef.current);
      const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const secs = String(totalSec % 60).padStart(2, '0');
      setMissionTime(`T+ 00:${mins}:${secs}`);
    }

    if (roverState !== ROVER_STATES.EXPLORATION && roverState !== ROVER_STATES.RETURN_TO_VIKRAM) return;

    // Step Rover Physics
    const updated = stepRoverPhysics(roverRef.current, inputs, dt);

    // Consume Battery
    let newBattery = updated.battery;
    if (updated.isDriving && updated.distTraveled > 0) {
      newBattery = consumeDrivingBattery(newBattery, updated.distTraveled, updated.isClimbingSlope);
    }
    if (updated.isTurning) {
      newBattery = consumeTurningBattery(newBattery, dt);
    }

    updated.battery = newBattery;
    roverRef.current = updated;

    // Check 0% Battery Failure
    if (newBattery <= 0 && !objectivesStatus.returnedToVikram) {
      setRoverState(ROVER_STATES.MISSION_FAILED);
      setFailureReason('ROVER BATTERY DEPLETED (0%)');
      return;
    }

    // Check Immobilization Failure (extreme slopes > 42°)
    if (updated.isImmobilized && (roverState === ROVER_STATES.EXPLORATION || roverState === ROVER_STATES.RETURN_TO_VIKRAM)) {
      setRoverState(ROVER_STATES.MISSION_FAILED);
      setFailureReason('ROVER IMMOBILIZED — CATASTROPHIC TERRAIN SLOPE / COLLISION (>42°)');
      return;
    }

    // Target Range Checks
    const [rx, , rz] = updated.position;

    // Target A Check
    if (!objectivesStatus.targetADone) {
      const distA = Math.hypot(rx - ROVER_CONSTANTS.TARGET_A_POSITION.x, rz - ROVER_CONSTANTS.TARGET_A_POSITION.z);
      if (distA <= ROVER_CONSTANTS.TARGET_A_POSITION.radius) {
        setObjectivesStatus((prev) => ({ ...prev, targetADone: true }));
      }
    }

    // Target B Science Check
    if (objectivesStatus.targetADone && !objectivesStatus.targetBDone) {
      const distB = Math.hypot(rx - ROVER_CONSTANTS.TARGET_B_POSITION.x, rz - ROVER_CONSTANTS.TARGET_B_POSITION.z);
      if (distB <= ROVER_CONSTANTS.TARGET_B_POSITION.radius && !isScienceOpen) {
        // Near science target
      }
    }

    // Target C Check
    if (objectivesStatus.targetBDone && !objectivesStatus.targetCDone) {
      const distC = Math.hypot(rx - ROVER_CONSTANTS.TARGET_C_POSITION.x, rz - ROVER_CONSTANTS.TARGET_C_POSITION.z);
      if (distC <= ROVER_CONSTANTS.TARGET_C_POSITION.radius) {
        setObjectivesStatus((prev) => ({ ...prev, targetCDone: true }));
        setRoverState(ROVER_STATES.RETURN_TO_VIKRAM);
      }
    }

    // Return to Vikram Check
    if (objectivesStatus.targetCDone && !objectivesStatus.returnedToVikram) {
      const distVikram = Math.hypot(rx, rz);
      if (distVikram <= ROVER_CONSTANTS.VIKRAM_RETURN_RADIUS) {
        setObjectivesStatus((prev) => ({ ...prev, returnedToVikram: true }));
        setRoverState(ROVER_STATES.MISSION_COMPLETE);
      }
    }
  }, [isPaused, roverState, objectivesStatus, isScienceOpen]);

  // Handle Science Target B Interaction (Press E)
  const triggerScienceInteract = useCallback(() => {
    const [rx, , rz] = roverRef.current.position;
    const distB = Math.hypot(rx - ROVER_CONSTANTS.TARGET_B_POSITION.x, rz - ROVER_CONSTANTS.TARGET_B_POSITION.z);

    if (distB <= ROVER_CONSTANTS.TARGET_B_POSITION.radius + 3.0) {
      setIsScienceOpen(true);
      setCameraMode('science');
    }
  }, []);

  // Execute LIBS or APXS
  const runSciencePayload = useCallback((instrumentType) => {
    soundEngine.playLaserSound();
    const result = executeScienceInstrument(instrumentType);
    setActiveScienceResult(result);

    // Consume Science Battery
    const newBat = consumeScienceBattery(roverRef.current.battery, instrumentType);
    roverRef.current.battery = newBat;

    setObjectivesStatus((prev) => {
      const libsDone = instrumentType === 'LIBS' ? true : prev.libsDone;
      const apxsDone = instrumentType === 'APXS' ? true : prev.apxsDone;
      const targetBDone = libsDone || apxsDone;
      return { ...prev, libsDone, apxsDone, targetBDone };
    });
  }, []);

  const closeScienceModal = useCallback(() => {
    setIsScienceOpen(false);
    setActiveScienceResult(null);
    setCameraMode('chase');
  }, []);

  const cycleCamera = useCallback(() => {
    setCameraMode((prev) => {
      if (prev === 'chase') return 'top';
      if (prev === 'top') return 'front';
      if (prev === 'front') return 'science';
      return 'chase';
    });
  }, []);

  const toggleMap = useCallback(() => {
    setIsMapOpen((prev) => !prev);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const restartMission2 = useCallback(() => {
    roverRef.current = {
      position: [0, 0.35, 2.5],
      velocity: 0,
      heading: Math.PI,
      wheelAngle: 0,
      battery: ROVER_CONSTANTS.STARTING_BATTERY,
      slopeAngle: 0,
      isDriving: false,
      isTurning: false,
      distTraveled: 0,
      collisionStatus: 'SAFE',
      isImmobilized: false,
    };
    timeRef.current = 0;
    setMissionTime('T+ 00:00:00');
    setRoverState(ROVER_STATES.EXPLORATION);
    setObjectivesStatus({
      deploymentDone: true,
      targetADone: false,
      targetBDone: false,
      libsDone: false,
      apxsDone: false,
      targetCDone: false,
      returnedToVikram: false,
    });
    setCameraMode('chase');
    setIsScienceOpen(false);
    setActiveScienceResult(null);
    setIsPaused(false);
    setFailureReason('');
  }, []);

  return {
    roverRef,
    roverState,
    deploymentStep,
    deploymentProgress,
    objectivesStatus,
    isScienceOpen,
    activeScienceResult,
    cameraMode,
    isMapOpen,
    isPaused,
    missionTime,
    failureReason,
    updateRoverFrame,
    triggerScienceInteract,
    runSciencePayload,
    closeScienceModal,
    cycleCamera,
    toggleMap,
    togglePause,
    restartMission2,
  };
}
