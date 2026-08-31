import React from 'react';
import { GameScene } from './scenes/GameScene';
import { HUD } from './ui/HUD';
import { ControlsOverlay } from './ui/ControlsOverlay';
import { DebugOverlay } from './ui/DebugOverlay';
import { HazardScanner } from './ui/HazardScanner';
import { Minimap } from './ui/Minimap';
import { MissionSelect } from './ui/MissionSelect';
import { MissionBriefing } from './ui/MissionBriefing';
import { MissionResult } from './ui/MissionResult';
import { useLanderState } from './game/useLanderState';
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

  // 3. ACTIVE GAMEPLAY & RESULT STATES
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
