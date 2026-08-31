import React from 'react';
import { GameScene } from './scenes/GameScene';
import { RoverMissionScene } from './scenes/RoverMissionScene';
import { HUD } from './ui/HUD';
import { RoverHUD } from './ui/RoverHUD';
import { SciencePanel } from './ui/SciencePanel';
import { RoverMap } from './ui/RoverMap';
import { ControlsOverlay } from './ui/ControlsOverlay';
import { DebugOverlay } from './ui/DebugOverlay';
import { HazardScanner } from './ui/HazardScanner';
import { MissionSelect } from './ui/MissionSelect';
import { MissionBriefing } from './ui/MissionBriefing';
import { MissionResult } from './ui/MissionResult';
import { Mission2Result } from './ui/Mission2Result';

import { useLanderState } from './game/useLanderState';
import { useRoverState, ROVER_STATES } from './rover/useRoverState';
import { MISSION_STATES } from './missions/missionTypes';
import { MISSIONS } from './missions/missionData';

export default function App() {
  const {
    landerRef,
    telemetry,
    debugData,
    isDebugMode,
    setIsDebugMode,
    isInspectMode,
    toggleInspectMode,
    isScannerActive,
    toggleScannerMode,
    cameraMode,
    setCameraMode,
    resetSimulation,
    setControlState,
    updateLanderFrame,
    isPaused,
    togglePause,
    settings,
    updateSettings,

    // Stage 8 Campaign State & Actions
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
  } = useLanderState();

  const rover = useRoverState();

  const isScannerDisabled = activeMission?.restrictions?.disableScanner ?? false;
  const currentIndex = MISSIONS.findIndex((m) => m.id === activeMission?.id);
  const hasNextMission = currentIndex >= 0 && currentIndex < MISSIONS.length - 1;

  // 1. MAIN MENU STATE
  if (missionState === MISSION_STATES.MENU) {
    return (
      <MissionSelect
        saveData={saveData}
        onSelectMission={selectMission}
        onResetProgress={resetProgress}
      />
    );
  }

  // 2. MISSION BRIEFING STATE
  if (missionState === MISSION_STATES.BRIEFING) {
    return (
      <MissionBriefing
        mission={activeMission}
        saveData={saveData}
        onStartMission={startActiveMission}
        onBack={returnToMenu}
      />
    );
  }

  // 3. MISSION 2: PRAGYAN ROVER EXPLORATION GAMEPLAY
  if (activeMission?.number === 2) {
    const isRoverComplete = rover.roverState === ROVER_STATES.MISSION_COMPLETE;
    const isRoverFailed = rover.roverState === ROVER_STATES.MISSION_FAILED;

    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* 3D R3F Rover Exploration Scene */}
        <RoverMissionScene
          roverRef={rover.roverRef}
          roverState={rover.roverState}
          deploymentProgress={rover.deploymentProgress}
          cameraMode={rover.cameraMode}
          updateRoverFrame={rover.updateRoverFrame}
          triggerScienceInteract={rover.triggerScienceInteract}
          cycleCamera={rover.cycleCamera}
          toggleMap={rover.toggleMap}
          togglePause={rover.togglePause}
          restartMission2={rover.restartMission2}
        />

        {/* 2D Pragyan Rover Control HUD Overlay */}
        <RoverHUD
          roverRef={rover.roverRef}
          roverState={rover.roverState}
          objectivesStatus={rover.objectivesStatus}
          missionTime={rover.missionTime}
          cameraMode={rover.cameraMode}
          cycleCamera={rover.cycleCamera}
          toggleMap={rover.toggleMap}
          triggerScienceInteract={rover.triggerScienceInteract}
          isPaused={rover.isPaused}
          togglePause={rover.togglePause}
          restartMission2={rover.restartMission2}
          onReturnToMenu={returnToMenu}
        />

        {/* Interactive Science Payload Instrument Modal (Target B) */}
        {rover.isScienceOpen && (
          <SciencePanel
            activeResult={rover.activeScienceResult}
            onRunInstrument={rover.runSciencePayload}
            onClose={rover.closeScienceModal}
          />
        )}

        {/* Fullsurface Navigation Minimap Modal */}
        {rover.isMapOpen && (
          <RoverMap
            roverRef={rover.roverRef}
            objectivesStatus={rover.objectivesStatus}
            onClose={rover.toggleMap}
          />
        )}

        {/* Mission 2 Result Modal (SUCCESS / FAILURE) */}
        {(isRoverComplete || isRoverFailed) && (
          <Mission2Result
            isSuccess={isRoverComplete}
            failureReason={rover.failureReason}
            objectivesStatus={rover.objectivesStatus}
            roverRef={rover.roverRef}
            missionTime={rover.missionTime}
            onRetry={rover.restartMission2}
            onReturnToMenu={returnToMenu}
          />
        )}
      </div>
    );
  }

  // 4. MISSION 1: VIKRAM LANDING GAMEPLAY & RESULT STATES
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D WebGL Canvas Layer */}
      <GameScene
        landerRef={landerRef}
        telemetry={telemetry}
        cameraMode={cameraMode}
        isInspectMode={isInspectMode}
        updateLanderFrame={updateLanderFrame}
      />

      {/* 2D Mission Control Master HUD Overlay */}
      <HUD
        telemetry={telemetry}
        isPaused={isPaused}
        togglePause={togglePause}
        resetSimulation={resetSimulation}
        settings={settings}
        updateSettings={updateSettings}
        activeMission={activeMission}
        evaluatedObjectives={evaluatedObjectives}
        onReturnToMenu={returnToMenu}
        onResetProgress={resetProgress}
      />

      {/* Auxiliary Overlays (Scanner, Controls, Debug) */}
      <div className="ui-layer">
        {settings.showScanner && !isScannerDisabled && (
          <HazardScanner
            telemetry={telemetry}
            isScannerActive={isScannerActive}
            toggleScannerMode={toggleScannerMode}
          />
        )}
        <ControlsOverlay
          cameraMode={cameraMode}
          setCameraMode={setCameraMode}
          resetSimulation={resetSimulation}
          isDebugMode={isDebugMode}
          setIsDebugMode={setIsDebugMode}
          isInspectMode={isInspectMode}
          toggleInspectMode={toggleInspectMode}
          isScannerActive={isScannerActive}
          toggleScannerMode={toggleScannerMode}
          setControlState={setControlState}
        />
        <DebugOverlay
          isDebugMode={isDebugMode}
          debugData={debugData}
          telemetry={telemetry}
        />
      </div>

      {/* Campaign Result Screen Modal (SUCCESS or FAILURE) */}
      {(missionState === MISSION_STATES.SUCCESS || missionState === MISSION_STATES.FAILURE) && (
        <MissionResult
          isSuccess={missionState === MISSION_STATES.SUCCESS}
          mission={activeMission}
          scoreResult={scoreResult}
          analyticsReport={analyticsReport}
          onNextMission={nextMission}
          onRetry={resetSimulation}
          onReturnToMenu={returnToMenu}
          hasNextMission={hasNextMission}
        />
      )}
    </div>
  );
}
