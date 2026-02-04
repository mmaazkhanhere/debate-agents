import { useCallback, useRef, useEffect } from 'react';

type SoundType =
    | 'intro'
    | 'argument'
    | 'timer-tick'
    | 'timer-warning'
    | 'judge-reveal'
    | 'victory'
    | 'defeat'
    | 'transition';

// Audio context for generating sounds
class SoundGenerator {
    private audioContext: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        return this.audioContext;
    }

    async play(type: SoundType, volume: number = 0.5): Promise<void> {
        const ctx = this.getContext();

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        switch (type) {
            case 'intro':
                await this.playIntro(ctx, volume);
                break;
            case 'argument':
                await this.playArgument(ctx, volume);
                break;
            case 'timer-tick':
                await this.playTimerTick(ctx, volume);
                break;
            case 'timer-warning':
                await this.playTimerWarning(ctx, volume);
                break;
            case 'judge-reveal':
                await this.playJudgeReveal(ctx, volume);
                break;
            case 'victory':
                await this.playVictory(ctx, volume);
                break;
            case 'defeat':
                await this.playDefeat(ctx, volume);
                break;
            case 'transition':
                await this.playTransition(ctx, volume);
                break;
        }
    }

    private async playIntro(ctx: AudioContext, volume: number) {
        // Dramatic intro fanfare
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        for (let i = 0; i < notes.length; i++) {
            setTimeout(() => this.playNote(ctx, notes[i], 0.3, volume), i * 150);
        }
    }

    private async playArgument(ctx: AudioContext, volume: number) {
        // Subtle speech start sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }

    private async playTimerTick(ctx: AudioContext, volume: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 800;
        gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    private async playTimerWarning(ctx: AudioContext, volume: number) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playNote(ctx, 880, 0.1, volume * 0.6);
            }, i * 150);
        }
    }

    private async playJudgeReveal(ctx: AudioContext, volume: number) {
        // Dramatic reveal
        const notes = [392.00, 493.88, 587.33]; // G4, B4, D5
        for (let i = 0; i < notes.length; i++) {
            setTimeout(() => this.playNote(ctx, notes[i], 0.2, volume * 0.5), i * 100);
        }
    }

    private async playVictory(ctx: AudioContext, volume: number) {
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        for (let i = 0; i < notes.length; i++) {
            setTimeout(() => this.playNote(ctx, notes[i], 0.3, volume * 0.6), i * 120);
        }
    }

    private async playDefeat(ctx: AudioContext, volume: number) {
        // Sad trombone
        const notes = [392.00, 349.23, 311.13, 293.66]; // G4, F4, Eb4, D4
        for (let i = 0; i < notes.length; i++) {
            setTimeout(() => this.playNote(ctx, notes[i], 0.3, volume * 0.4), i * 200);
        }
    }

    private async playTransition(ctx: AudioContext, volume: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    private playNote(ctx: AudioContext, frequency: number, duration: number, volume: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }
}

export function useSoundEffects() {
    const generatorRef = useRef<SoundGenerator | null>(null);
    const enabledRef = useRef(true);

    useEffect(() => {
        generatorRef.current = new SoundGenerator();
    }, []);

    const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
        if (enabledRef.current && generatorRef.current) {
            generatorRef.current.play(type, volume).catch(console.error);
        }
    }, []);

    const setEnabled = useCallback((enabled: boolean) => {
        enabledRef.current = enabled;
    }, []);

    return { playSound, setEnabled };
}
