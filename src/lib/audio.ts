const getAudioEnv = () => {
  if (typeof window === 'undefined') return null;
  // Create context only on first user interaction to comply with browser autoplay policies
  if (!(window as any)._ludoAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      (window as any)._ludoAudioCtx = ctx;

      // Create a master compressor to prevent clipping when boosting volume
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Create a master gain to boost overall volume (3x boost)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(3.0, ctx.currentTime);

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      (window as any)._ludoMasterBus = masterGain;
    }
  }
  
  if (!(window as any)._ludoAudioCtx) return null;

  return {
    ctx: (window as any)._ludoAudioCtx as AudioContext,
    master: (window as any)._ludoMasterBus as GainNode
  };
};

function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
  const env = getAudioEnv();
  if (!env) return;
  const { ctx, master } = env;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(master);
  
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playRollSound() {
  const env = getAudioEnv();
  if (!env) return;
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      // Increased volume significantly
      playTone(300 + Math.random() * 400, 'triangle', 0.06, 1.0);
    }, i * 35);
  }
}

export function playMoveSound() {
  // Increased volume, shorter duration, and sharper wave for a clear "tap" sound
  playTone(600, 'triangle', 0.08, 1.2);
}

export function playCaptureSound() {
  const env = getAudioEnv();
  if (!env) return;
  const { ctx, master } = env;
  if (ctx.state === 'suspended') ctx.resume();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playFinishSound() {
  playTone(523.25, 'sine', 0.3, 0.6); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.3, 0.6), 100); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.4, 0.6), 200); // G5
}

export function playWinSound() {
  playFinishSound();
  setTimeout(playFinishSound, 400);
}

export function playSafeSound() {
  // A pleasant "ding" sound for reaching a safe star
  playTone(880, 'sine', 0.1, 0.8); // A5
  setTimeout(() => playTone(1108.73, 'sine', 0.2, 0.8), 100); // C#6
}
