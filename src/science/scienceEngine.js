import { runLIBSAnalysis } from './libs';
import { runAPXSAnalysis } from './apxs';

/**
 * Main Science Payload Engine for Pragyan Rover
 */
export function executeScienceInstrument(instrumentType) {
  if (instrumentType === 'LIBS') {
    return runLIBSAnalysis();
  }
  if (instrumentType === 'APXS') {
    return runAPXSAnalysis();
  }
  return null;
}
