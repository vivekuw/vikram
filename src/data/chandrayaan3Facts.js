/**
 * Verified Real-World Chandrayaan-3 Mission Facts (ISRO Educational Archive)
 * Note: Gameplay parameters (battery percentages, simulated element readings) are labeled as SIMULATION VALUES.
 */
export const CHANDRAYAAN3_FACTS = {
  missionTitle: 'ISRO Chandrayaan-3 Lunar Exploration',
  landingDate: 'August 23, 2023',
  landingSiteName: 'Shiv Shakti Point',
  landingRegion: 'Lunar South Pole (~69.37°S, 32.35°E)',
  spacecraft: {
    lander: {
      name: 'Vikram',
      mass: '1,726 kg (including rover)',
      engine: '4 Thruster 800N Throttleable Engines',
      payloads: ['ChaSTE', 'ILSA', 'RAMBHA-LP', 'LRA'],
    },
    rover: {
      name: 'Pragyan',
      wheels: '6-wheel Rocker-Bogie Mechanism',
      mass: '26 kg',
      power: '50W Solar Panel Array',
      payloads: ['LIBS (Laser-Induced Breakdown Spectroscope)', 'APXS (Alpha Particle X-ray Spectrometer)'],
      stampedSymbols: 'ISRO Emblem & National Emblem of India stamped on lunar regolith by wheels',
    },
  },
  achievements: [
    'India became the 1st nation to successfully soft-land near the Lunar South Pole.',
    'Pragyan traversed over 100 meters across the lunar surface during its 14-day mission.',
    'LIBS confirmed the unambiguous presence of Sulphur (S) in the lunar south pole regolith.',
    'APXS detected major elements including Aluminium, Silicon, Calcium, Iron, and Titanium.',
  ],
  disclaimer: 'SIMULATION NOTICE: All in-game battery drain rates, sample element concentrations, and navigation limits are simulated gameplay mechanics designed for educational interactive learning.',
};
