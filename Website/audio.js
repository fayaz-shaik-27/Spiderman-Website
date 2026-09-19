/**
 * Spider-Man Web Experience - Audio FX Synthesizer
 * Uses Web Audio API for zero-dependency, instant procedural sound effects
 */

class SoundFXManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            console.log('AudioContext initialized');
        } catch (e) {
            console.warn('Web Audio API not supported in this browser', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            this.resume();
        }
        return this.enabled;
    }

    /**
     * Spider-Sense Audio Trigger (Pitch warning pulse)
     */
    playSpiderSense() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // High tension dual tone oscillator
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sine';

        // Frequency sweep for alarming pulse
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

        osc2.frequency.setValueAtTime(900, now);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(900, now + 0.3);

        // Tremolo / LFO effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 25; // fast pulse
        lfoGain.gain.value = 0.3;
        lfo.connect(gain.gain);
        lfo.start(now);
        lfo.stop(now + 0.4);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
    }

    /**
     * Web Shooter Shot - "THWIP!" Sound
     */
    playThwip(fluidType = 'classic') {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // White noise burst + pitch whip snap
        const bufferSize = this.ctx.sampleRate * 0.12; // 120ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Highpass filter for whip air effect
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        
        let freqStart = 2000;
        let freqEnd = 8000;
        if (fluidType === 'taser') {
            freqStart = 4000;
            freqEnd = 12000;
        } else if (fluidType === 'impact') {
            freqStart = 800;
            freqEnd = 4000;
        }

        filter.frequency.setValueAtTime(freqStart, now);
        filter.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.06);
        filter.Q.value = 5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        // Add whip snap oscillator pitch down
        const snap = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snap.type = 'triangle';
        snap.frequency.setValueAtTime(1500, now);
        snap.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        snapGain.gain.setValueAtTime(0.3 * this.volume, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        snap.connect(snapGain);
        snapGain.connect(this.ctx.destination);

        noise.start(now);
        snap.start(now);
        snap.stop(now + 0.08);
    }

    /**
     * Mechanical Suit Vault Switch Sound
     */
    playSuitSwitch() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Low frequency mechanical thud
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(160, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.25);

        subGain.gain.setValueAtTime(0.5 * this.volume, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        // Metallic click/servo rise
        const servo = this.ctx.createOscillator();
        const servoGain = this.ctx.createGain();
        servo.type = 'sawtooth';
        servo.frequency.setValueAtTime(300, now + 0.05);
        servo.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;

        servoGain.gain.setValueAtTime(0.01, now + 0.05);
        servoGain.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.12);
        servoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        sub.connect(subGain);
        subGain.connect(this.ctx.destination);

        servo.connect(filter);
        filter.connect(servoGain);
        servoGain.connect(this.ctx.destination);

        sub.start(now);
        servo.start(now + 0.05);
        sub.stop(now + 0.25);
        servo.stop(now + 0.25);
    }

    /**
     * Villain Hologram Glitch Sound
     */
    playGlitch() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        // Random rapid pitch jumps
        osc.frequency.setValueAtTime(150 + Math.random() * 400, now);
        osc.frequency.setValueAtTime(800 + Math.random() * 600, now + 0.04);
        osc.frequency.setValueAtTime(100 + Math.random() * 200, now + 0.08);

        gain.gain.setValueAtTime(0.15 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

window.soundFX = new SoundFXManager();
