import { describe, it, expect } from 'vitest';
import { stepRoverPhysics } from '../rover/roverPhysics';
import { ROVER_CONSTANTS } from '../rover/roverConstants';

describe('Pragyan Rover Physics Engine', () => {
  const initialState = {
    position: [0, 0.35, 2.5],
    velocity: 0,
    heading: Math.PI,
    wheelAngle: 0,
    battery: 100,
    isImmobilized: false,
  };

  it('accelerates forward when ArrowUp is pressed', () => {
    const inputs = { forward: true, backward: false, left: false, right: false, brake: false };
    const dt = 0.1;
    const nextState = stepRoverPhysics(initialState, inputs, dt);

    expect(nextState.velocity).toBeGreaterThan(0);
    expect(nextState.velocity).toBeLessThanOrEqual(ROVER_CONSTANTS.MAX_SPEED);
  });

  it('steers left when ArrowLeft is pressed', () => {
    const inputs = { forward: false, backward: false, left: true, right: false, brake: false };
    const dt = 0.1;
    const nextState = stepRoverPhysics(initialState, inputs, dt);

    expect(nextState.heading).toBeGreaterThan(initialState.heading);
  });

  it('steers right when ArrowRight is pressed', () => {
    const inputs = { forward: false, backward: false, left: false, right: true, brake: false };
    const dt = 0.1;
    const nextState = stepRoverPhysics(initialState, inputs, dt);

    expect(nextState.heading).toBeLessThan(initialState.heading);
  });

  it('updates wheel rotation angle while driving', () => {
    const movingState = { ...initialState, velocity: 1.0 };
    const inputs = { forward: true, backward: false, left: false, right: false, brake: false };
    const dt = 0.1;
    const nextState = stepRoverPhysics(movingState, inputs, dt);

    expect(nextState.wheelAngle).not.toBe(initialState.wheelAngle);
  });

  it('remains stationary when battery is 0%', () => {
    const deadBatteryState = { ...initialState, battery: 0, velocity: 1.0 };
    const inputs = { forward: true, backward: false, left: false, right: false, brake: false };
    const dt = 0.1;
    const nextState = stepRoverPhysics(deadBatteryState, inputs, dt);

    expect(nextState.velocity).toBe(0);
    expect(nextState.isDriving).toBe(false);
  });
});
