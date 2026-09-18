// Web Audio API based ambient sound generator and timer chimes
// 100% client-side, zero external assets required.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: string = "none";

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play pleasant completion bell chime
  public playCompletionChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High harmonic Tibetan bowl / meditation bell simulation
      const freqs = [528, 792, 1056, 1584];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.25 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5 + idx * 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4.5);
      });
    } catch (e) {
      console.warn("Could not play completion chime:", e);
    }
  }

  // Play soft transition click
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Play gentle clock tick
  public playTick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  // Set ambient background loop
  public setAmbient(type: "none" | "rain" | "clock" | "whitenoise", volume: number = 0.15): void {
    if (this.currentAmbientType === type && this.ambientSource) {
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(volume, this.getContext()?.currentTime || 0);
      }
      return;
    }

    this.stopAmbient();
    this.currentAmbientType = type;

    if (type === "none") return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === "whitenoise" || type === "rain") {
        // Generate continuous white/pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === "rain") {
            // Brown / pink noise curve for softer rainfall
            lastOut = (lastOut + 0.02 * white) / 1.02;
            output[i] = lastOut * 3.5;
          } else {
            // Gentle bandpass white noise
            output[i] = white * 0.2;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter to shape into soothing ambient
        const filter = ctx.createBiquadFilter();
        if (type === "rain") {
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        } else {
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
          filter.Q.setValueAtTime(0.5, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        this.ambientSource = whiteNoise;
      }
    } catch (e) {
      console.warn("Could not start ambient sound:", e);
    }
  }

  public stopAmbient(): void {
    if (this.ambientSource) {
      try {
        (this.ambientSource as any).stop?.();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.currentAmbientType = "none";
  }
}

export const soundEngine = new SoundEngine();
