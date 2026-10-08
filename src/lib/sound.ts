let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

export function playKey() {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = 800;
    o.type = 'square';
    g.gain.setValueAtTime(0.03, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
    o.start();
    o.stop(c.currentTime + 0.05);
  } catch {}
}

export function playSuccess() {
  try {
    const c = getCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.frequency.value = f;
      o.type = 'sine';
      const t = c.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t);
      o.stop(t + 0.2);
    });
  } catch {}
}

export function playError() {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = 200;
    o.type = 'sawtooth';
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    o.start();
    o.stop(c.currentTime + 0.15);
  } catch {}
}
