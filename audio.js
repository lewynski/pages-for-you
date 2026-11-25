// ============================================================
// 8-Bit Pixel Music Box & SFX Engine (Web Audio API)
// Zero external dependencies — pure synthesized cozy chimes!
// ============================================================

class PixelAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, duration = 0.12, type = "square", volume = 0.06, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.playTone(660, 0.05, "square", 0.04);
  }

  openWindow() {
    this.playTone(523.25, 0.07, "triangle", 0.06, 0);
    this.playTone(659.25, 0.09, "triangle", 0.06, 0.05);
  }

  closeWindow() {
    this.playTone(523.25, 0.06, "triangle", 0.05, 0);
    this.playTone(392.0, 0.08, "triangle", 0.05, 0.05);
  }

  petChirp() {
    this.playTone(784, 0.07, "sine", 0.07, 0);
    this.playTone(1046.5, 0.11, "sine", 0.07, 0.06);
  }

  feedTreat() {
    this.playTone(587.33, 0.06, "triangle", 0.06, 0);
    this.playTone(783.99, 0.06, "triangle", 0.06, 0.07);
    this.playTone(1174.66, 0.14, "triangle", 0.07, 0.14);
  }

  gachaPop() {
    this.playTone(440, 0.05, "square", 0.04, 0);
    this.playTone(554.37, 0.05, "square", 0.04, 0.05);
    this.playTone(659.25, 0.07, "square", 0.04, 0.1);
    this.playTone(880, 0.16, "triangle", 0.07, 0.16);
  }

  clueFound() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.18, "triangle", 0.08, i * 0.09);
    });
  }

  errorBuzz() {
    this.playTone(220, 0.12, "sawtooth", 0.04, 0);
    this.playTone(185, 0.16, "sawtooth", 0.04, 0.1);
  }

  note(freq) {
    this.playTone(freq, 0.32, "triangle", 0.09, 0);
    this.playTone(freq * 2, 0.18, "sine", 0.025, 0);
  }

  unlockFanfare() {
    const melody = [
      [523.25, 0.0],
      [659.25, 0.11],
      [783.99, 0.22],
      [1046.5, 0.34],
      [987.77, 0.5],
      [1046.5, 0.62],
      [1318.51, 0.76]
    ];
    melody.forEach(([f, t]) => {
      this.playTone(f, 0.34, "triangle", 0.09, t);
      this.playTone(f / 2, 0.34, "sine", 0.04, t);
    });
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBgm();
    }
    return this.enabled;
  }

  toggleBgm() {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    }
    if (!this.enabled) this.enabled = true;
    this.startBgm();
    return true;
  }

  startBgm() {
    if (this.bgmPlaying) return;
    this.ensureContext();
    this.bgmPlaying = true;
    // Sweet lullaby music-box loop in C major / A minor
    const pattern = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.0, 698.46,
      493.88, 587.33, 783.99, 587.33,
      523.25, 659.25, 1046.5, 783.99
    ];
    this.bgmTimer = setInterval(() => {
      if (!this.enabled || !this.bgmPlaying) return;
      const freq = pattern[this.bgmStep % pattern.length];
      this.playTone(freq, 0.28, "sine", 0.032, 0);
      this.bgmStep++;
    }, 420);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.pixelAudio = new PixelAudio();
