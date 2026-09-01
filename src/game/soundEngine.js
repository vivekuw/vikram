/**
 * Web Audio API Sound Synthesizer Engine
 * Zero external audio file dependencies. Synthesizes realistic rover motor hum,
 * wheel regolith crunch, thruster engine roar, and LIBS laser pulses.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.motorOsc = null;
    this.motorGain = null;
    this.crunchGain = null;
    this.crunchNoiseNode = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // Rover Electric Motor Hum
  updateMotorSound(speedRatio, slipRatio = 0) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.motorOsc) {
      this.motorOsc = this.ctx.createOscillator();
      this.motorOsc.type = 'sawtooth';

      // Low pass filter for deep electric motor hum
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.motorGain = this.ctx.createGain();
      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start();
    }

    const baseFreq = 50 + Math.abs(speedRatio) * 140 + slipRatio * 60;
    const targetGain = Math.min(0.2, (Math.abs(speedRatio) * 0.15 + slipRatio * 0.1));

    this.motorOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    this.motorGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  // LIBS Laser Pulse SFX
  playLaserSound() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  stopAll() {
    if (this.motorGain && this.ctx) {
      this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }
}

export const soundEngine = new SoundEngine();
