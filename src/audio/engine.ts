import { smoothstep } from "@/engine/math";

/* Moteur audio 100 % synthétique (WebAudio) pour le prototype : musique générative + sound design.
   Chaque couche est pilotée par `progress` ; remplaçable plus tard par des fichiers (voir public/audio/README.md). */

export interface AudioInputs {
  p: number; night: number; speed: number; life: number; train: number; building: number; phase: string;
}
type Theme = "origins" | "build" | "final";

export class CityAudio {
  ctx: AudioContext | null = null;
  master!: GainNode;
  private music!: GainNode;
  private amb!: GainNode;
  private noise!: AudioBuffer;
  private layers: Record<string, { g: GainNode }> = {};
  private timers: number[] = [];
  private beat = 0;
  private nextBeat = 0;
  private prevTrain = 0;
  private enabled = true;
  private delay!: DelayNode;
  inputs: AudioInputs = { p: 1, night: 0, speed: 0, life: 1, train: 0, building: 0, phase: "intro" };
  theme: Theme = "final";

  get running() { return !!this.ctx; }

  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain(); this.master.gain.value = this.enabled ? 0.9 : 0; this.master.connect(ctx.destination);
    this.music = ctx.createGain(); this.music.gain.value = 0.55; this.music.connect(this.master);
    this.amb = ctx.createGain(); this.amb.gain.value = 0.8; this.amb.connect(this.master);
    // réverbération simple par délai à rétroaction
    this.delay = ctx.createDelay(1); this.delay.delayTime.value = 0.38;
    const fb = ctx.createGain(); fb.gain.value = 0.42;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
    this.delay.connect(lp); lp.connect(fb); fb.connect(this.delay); lp.connect(this.music);
    // bruit
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let b0 = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.97 * b0 + 0.03 * w; d[i] = (w * 0.5 + b0 * 6) * 0.5; }
    this.loop("wind", "lowpass", 520, 0.9);
    this.loop("hum", "lowpass", 170, 1.2);
    this.loop("crowd", "bandpass", 700, 1.4);
    this.loop("train", "lowpass", 260, 1);
    this.pad();
    this.timers.push(window.setInterval(() => this.tick(), 90));
    this.nextBeat = ctx.currentTime + 0.3;
  }

  private loop(name: string, type: BiquadFilterType, freq: number, q: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(this.amb); src.start();
    this.layers[name] = { g };
  }
  private pad() {
    const ctx = this.ctx!;
    const g = ctx.createGain(); g.gain.value = 0;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 760;
    f.connect(g); g.connect(this.music);
    this.layers.pad = { g };
    this.padOscs = [0, 1, 2].flatMap((i) => [-6, 6].map((det) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.detune.value = det; o.frequency.value = 220;
      const og = ctx.createGain(); og.gain.value = 0.05; o.connect(og); og.connect(f); o.start(); return o;
    }));
    this.padChord = 0;
  }
  private padOscs: OscillatorNode[] = [];
  private padChord = 0;
  private chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.ctx) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.25);
  }

  private env(g: AudioParam, t: number, a: number, peak: number, r: number) {
    g.cancelScheduledValues(t); g.setValueAtTime(0.0001, t);
    g.linearRampToValueAtTime(peak, t + a); g.exponentialRampToValueAtTime(0.0001, t + a + r);
  }
  private pluck(freq: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2;
    const g = ctx.createGain(); this.env(g.gain, t, 0.01, vol, 2.2);
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2400;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.music); g.connect(this.delay);
    o.start(t); o2.start(t); o.stop(t + 2.6); o2.stop(t + 2.6);
  }
  private burst(t: number, freq: number, dur: number, vol: number, type: BiquadFilterType = "bandpass", dest: AudioNode = this.amb) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource(); s.buffer = this.noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = 1.2;
    const g = ctx.createGain(); this.env(g.gain, t, 0.004, vol, dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  private tone(freq: number, t: number, dur: number, vol: number, type: OscillatorType = "sine", glide = 0) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + glide), t + dur);
    const g = ctx.createGain(); this.env(g.gain, t, 0.01, vol, dur);
    o.connect(g); g.connect(this.amb); o.start(t); o.stop(t + dur + 0.1);
  }

  private tick() {
    const ctx = this.ctx!;
    const I = this.inputs, now = ctx.currentTime, set = (n: string, v: number) => this.layers[n].g.gain.setTargetAtTime(v, now, 0.3);
    const inCity = smoothstep(0.0, 0.1, I.p);
    const moving = Math.min(1, I.speed * 60);
    // thème selon progress / phase
    this.theme = I.phase === "intro" || I.phase === "rewind" ? "final" : I.p > 0.1 ? "build" : "origins";
    set("wind", 0.07 * (1 - inCity * 0.6) + 0.015);
    set("hum", 0.05 * inCity * I.life);
    set("crowd", 0.035 * smoothstep(0.05, 0.2, I.p) * I.life);
    set("train", 0.22 * I.train);
    set("pad", this.theme === "final" ? 0.55 : this.theme === "build" ? 0.38 : 0.2);
    // accord de nappe : change lentement
    const chord = Math.floor(now / 9) % this.chords.length;
    if (chord !== this.padChord || this.padOscs[0].frequency.value === 220 && chord === 0) {
      this.padChord = chord;
      this.padOscs.forEach((o, i) => o.frequency.setTargetAtTime(this.chords[chord][Math.floor(i / 2)] / 2, now, 1.5));
    }
    // klaxon quand un train démarre
    if (I.train > 0.08 && this.prevTrain <= 0.08) { this.tone(392, now, 0.5, 0.05, "triangle"); this.tone(311, now + 0.02, 0.5, 0.05, "triangle"); }
    this.prevTrain = I.train;

    // musique : notes de piano pentatonique A mineur
    const scale = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
    while (this.nextBeat < now + 0.4) {
      const t = this.nextBeat, b = this.beat++;
      const sparse = this.theme === "origins" ? 0.45 : 0.7;
      if (Math.random() < sparse) this.pluck(scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.25 ? 2 : 1), t, this.theme === "origins" ? 0.16 : 0.12);
      if (b % 8 === 0) this.pluck(this.chords[Math.floor(t / 9) % 4][0] / 2, t, 0.2);
      if (this.theme === "build" && I.p > 0.1) {
        const amt = smoothstep(0.1, 0.18, I.p);
        this.tone(95, t, 0.25, 0.14 * amt, "sine", -45);
        if (b % 2) this.burst(t, 7000, 0.05, 0.03 * amt, "highpass", this.music);
      }
      this.nextBeat += 0.95;
    }

    // chantiers : marteaux et bruits de construction, seulement quand le temps avance
    if (I.building > 0 && moving > 0.05 && Math.random() < 0.28) {
      const t = now + Math.random() * 0.08;
      this.burst(t, 1900, 0.06, 0.07 * moving, "bandpass"); this.tone(180 + Math.random() * 60, t, 0.08, 0.04 * moving, "square");
    }
    // oiseaux (jour), grillons (nuit), tatamis
    if (I.night < 0.4 && Math.random() < 0.05 * (1 - I.night)) {
      const f = 2600 + Math.random() * 1600, t = now + Math.random() * 0.1;
      this.tone(f, t, 0.09, 0.025, "sine", 700); this.tone(f * 1.1, t + 0.12, 0.08, 0.02, "sine", 500);
    }
    if (I.night > 0.6 && Math.random() < 0.3) for (let i = 0; i < 3; i++) this.tone(4300, now + i * 0.06, 0.03, 0.006);
    if (I.p > 0.012 && I.p < 0.2 && I.phase === "scroll" && Math.random() < 0.012) this.burst(now, 160, 0.18, 0.12, "lowpass");
  }

  dispose() {
    this.timers.forEach(clearInterval);
    this.ctx?.close();
    this.ctx = null;
  }
}

export const cityAudio = new CityAudio();
export type { Theme };
