class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('dice_architect_muted');
      if (saved === 'true') this.muted = true;
    } catch {
      // ignore storage errors
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('dice_architect_muted', String(this.muted));
    } catch {
      // ignore
    }
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainVal: number = 0.12,
    delay: number = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playDiceRoll() {
    const freqs = [240, 320, 410, 290, 480, 560];
    freqs.forEach((f, idx) => {
      this.playTone(f, 0.06, 'triangle', 0.1, idx * 0.045, f * 1.35);
    });
  }

  public playDiceLock() {
    this.playTone(580, 0.08, 'sine', 0.1, 0, 780);
  }

  public playDiceManipulate() {
    this.playTone(440, 0.08, 'sine', 0.11, 0, 660);
    this.playTone(880, 0.12, 'triangle', 0.09, 0.06, 990);
  }

  public playTilePlace(hasSynergy: boolean = false) {
    this.playTone(190, 0.11, 'triangle', 0.15, 0, 130);
    this.playTone(380, 0.12, 'sine', 0.1, 0.03, 520);
    if (hasSynergy) {
      this.playTone(523.25, 0.18, 'triangle', 0.12, 0.08);
      this.playTone(659.25, 0.22, 'triangle', 0.12, 0.14);
      this.playTone(783.99, 0.28, 'sine', 0.14, 0.2);
    }
  }

  public playTrapFire(kind: 'spike' | 'fire' | 'frost') {
    if (kind === 'spike') {
      this.playTone(420, 0.12, 'sawtooth', 0.11, 0, 140);
    } else if (kind === 'fire') {
      this.playTone(280, 0.2, 'sawtooth', 0.12, 0, 95);
      this.playTone(520, 0.14, 'triangle', 0.08, 0.04, 180);
    } else {
      this.playTone(920, 0.16, 'sine', 0.11, 0, 620);
      this.playTone(1240, 0.16, 'triangle', 0.08, 0.05, 880);
    }
  }

  public playSwordHit(isCrit: boolean = false) {
    this.playTone(170, 0.12, 'sawtooth', 0.14, 0, 75);
    if (isCrit) {
      this.playTone(680, 0.18, 'triangle', 0.14, 0.02, 1020);
    }
  }

  public playHeal() {
    this.playTone(440, 0.16, 'sine', 0.1, 0);
    this.playTone(554.37, 0.18, 'sine', 0.1, 0.07);
    this.playTone(659.25, 0.24, 'sine', 0.11, 0.14);
  }

  public playGold() {
    this.playTone(987.77, 0.09, 'sine', 0.11, 0);
    this.playTone(1318.51, 0.22, 'sine', 0.12, 0.07);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.28, 'triangle', 0.14, i * 0.11);
    });
  }

  public playDefeat() {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((n, i) => {
      this.playTone(n, 0.3, 'sawtooth', 0.1, i * 0.14);
    });
  }
}

export const soundEngine = new SoundEngine();
