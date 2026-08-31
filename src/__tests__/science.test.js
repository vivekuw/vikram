import { describe, it, expect } from 'vitest';
import { executeScienceInstrument } from '../science/scienceEngine';
import { runLIBSAnalysis } from '../science/libs';
import { runAPXSAnalysis } from '../science/apxs';

describe('Science Payload Instruments (LIBS & APXS)', () => {
  it('runs LIBS laser spectroscope analysis and returns elements', () => {
    const libsResult = runLIBSAnalysis();

    expect(libsResult.instrument).toContain('LIBS');
    expect(libsResult.simulatedElements.length).toBeGreaterThan(0);
    expect(libsResult.simulatedElements[0]).toHaveProperty('element');
    expect(libsResult.simulatedElements[0]).toHaveProperty('percentage');
    expect(libsResult.disclaimer).toContain('SIMULATION RESULT');
  });

  it('runs APXS spectrometer analysis and returns oxide compositions', () => {
    const apxsResult = runAPXSAnalysis();

    expect(apxsResult.instrument).toContain('APXS');
    expect(apxsResult.simulatedComposition.length).toBeGreaterThan(0);
    expect(apxsResult.simulatedComposition[0]).toHaveProperty('oxide');
    expect(apxsResult.simulatedComposition[0]).toHaveProperty('percentage');
    expect(apxsResult.disclaimer).toContain('SIMULATION RESULT');
  });

  it('routes payload execution via scienceEngine', () => {
    const libs = executeScienceInstrument('LIBS');
    const apxs = executeScienceInstrument('APXS');

    expect(libs).not.toBeNull();
    expect(apxs).not.toBeNull();
  });
});
