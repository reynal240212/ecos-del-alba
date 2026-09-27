// music.js - Procedural Cyberpunk Battle Music Engine using Web Audio API
// 100% self-contained, zero external files, rock-solid lookahead scheduling.

class MusicEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isEnabled = false;
    this.isPlaying = false;
    this.intensity = "ambient"; // "ambient", "combat", "boss"

    this.bpm = 126;
    this.step = 0;
    this.nextNoteTime = 0;
    this.timerId = null;
    this.noiseBuffer = null;

    // Scale notes (MIDI numbers converted to Hz)
    // D Minor: D, E, F, G, A, Bb, C
    this.mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

    // Bass patterns (16 steps)
    this.bassNotesAmbient = [
      38, 38, 0, 38,  41, 0, 38, 0,  43, 0, 41, 0,  45, 0, 43, 41
    ];
    this.bassNotesCombat = [
      38, 38, 50, 38,  41, 38, 50, 41,  43, 38, 41, 38,  45, 43, 41, 40
    ];
    this.bassNotesBoss = [
      38, 50, 38, 50,  46, 46, 50, 46,  45, 45, 48, 45,  43, 45, 46, 48
    ];

    // Arp patterns (16 steps)
    this.arpAmbient = [
      62, 0, 65, 0,  69, 0, 65, 0,  72, 0, 69, 0,  65, 0, 67, 0
    ];
    this.arpCombat = [
      62, 65, 69, 72,  74, 72, 69, 65,  62, 65, 70, 72,  77, 74, 72, 69
    ];
    this.arpBoss = [
      62, 65, 69, 74,  77, 74, 69, 65,  61, 65, 69, 73,  76, 73, 69, 65
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    // Master Compressor to glue the synth and drums together
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    // Master Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.38, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Generate White Noise Buffer for Snare & Hats
    const bufferSize = this.ctx.sampleRate * 1.5;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isEnabled = true;
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.step = 0;
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.scheduler();
    }
  }

  stop() {
    this.isPlaying = false;
    this.isEnabled = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isEnabled) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setVolume(ratio) {
    const vol = Math.max(0, Math.min(1, ratio));
    this.volumeRatio = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.38 * vol, this.ctx.currentTime);
    }
  }

  setIntensity(level) {
    if (this.intensity !== level) {
      this.intensity = level;
      if (level === "boss") this.bpm = 132;
      else if (level === "combat") this.bpm = 128;
      else this.bpm = 120;
    }
  }

  scheduler() {
    if (!this.isPlaying) return;
    const secondsPer16th = 60.0 / (this.bpm * 4);
    // Schedule ahead 100ms
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.step = (this.step + 1) % 16;
    }
    this.timerId = setTimeout(() => this.scheduler(), 30);
  }

  scheduleStep(step, time) {
    const isBoss = this.intensity === "boss";
    const isCombat = this.intensity === "combat" || isBoss;

    // 1. KICK DRUM
    // Ambient: on 0, 8. Combat/Boss: 0, 4, 8, 12 (four-on-the-floor) + syncopations
    const playKick = isCombat
      ? (step % 4 === 0 || (isBoss && (step === 2 || step === 10 || step === 14)))
      : (step === 0 || step === 8);

    if (playKick) {
      this.triggerKick(time, isBoss ? 1.0 : 0.85);
    }

    // 2. SNARE / CLAP
    // On beats 4 and 12 (standard backbeat), plus rolls in boss mode
    const playSnare = isCombat
      ? (step === 4 || step === 12 || (isBoss && (step === 14 || step === 15)))
      : (step === 4 || step === 12);

    if (playSnare) {
      this.triggerSnare(time, step >= 14 ? 0.45 : 0.7);
    }

    // 3. HI-HATS
    // 16th notes with accent on off-beats
    const playHat = isCombat ? true : (step % 2 === 0);
    if (playHat) {
      const open = isCombat && (step === 2 || step === 6 || step === 10 || step === 14);
      this.triggerHat(time, open, step % 4 === 2 ? 0.35 : 0.2);
    }

    // 4. SYNTH BASSLINE
    const bassSeq = isBoss ? this.bassNotesBoss : isCombat ? this.bassNotesCombat : this.bassNotesAmbient;
    const bassMidi = bassSeq[step];
    if (bassMidi > 0) {
      this.triggerBass(bassMidi, time, isBoss ? 0.18 : 0.14, isCombat ? 1200 : 550);
    }

    // 5. SYNTH ARPEGGIATOR / LEAD
    const arpSeq = isBoss ? this.arpBoss : isCombat ? this.arpCombat : this.arpAmbient;
    const arpMidi = arpSeq[step];
    if (arpMidi > 0) {
      this.triggerArp(arpMidi, time, isCombat ? 0.12 : 0.08);
    }
  }

  triggerKick(time, vol = 0.8) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Pitch drops rapidly from 150Hz to 38Hz
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    gain.gain.setValueAtTime(vol * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  triggerSnare(time, vol = 0.6) {
    if (!this.ctx || !this.noiseBuffer) return;
    // Noise component
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1600, time);
    noiseFilter.Q.setValueAtTime(1.5, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + 0.18);

    // Tonal body component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.09);

    oscGain.gain.setValueAtTime(vol * 0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  triggerHat(time, open = false, vol = 0.25) {
    if (!this.ctx || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    const duration = open ? 0.12 : 0.04;
    gain.gain.setValueAtTime(vol * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    source.start(time);
    source.stop(time + duration);
  }

  triggerBass(midi, time, duration = 0.15, filterCutoff = 800) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(this.mtof(midi), time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterCutoff * 1.8, time);
    filter.frequency.exponentialRampToValueAtTime(filterCutoff * 0.5, time + duration);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + duration);
  }

  triggerArp(midi, time, duration = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(this.mtof(midi), time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, time);
    filter.Q.setValueAtTime(2.0, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const musicEngine = new MusicEngine();
