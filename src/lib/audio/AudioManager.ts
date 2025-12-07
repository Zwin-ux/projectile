export type SoundId = 'shoot' | 'hit' | 'blip' | 'success' | 'miss';

class AudioManager {
    private sounds: Map<SoundId, HTMLAudioElement> = new Map();
    private enabled: boolean = true;
    private volume: number = 0.5;

    constructor() {
        if (typeof window !== 'undefined') {
            this.preloadSounds();
        }
    }

    private preloadSounds() {
        const soundFiles: Record<SoundId, string> = {
            shoot: '/sounds/shoot.mp3',
            hit: '/sounds/hit.mp3',
            blip: '/sounds/blip.mp3',
            success: '/sounds/success.mp3',
            miss: '/sounds/miss.mp3',
        };

        Object.entries(soundFiles).forEach(([id, path]) => {
            const audio = new Audio(path);
            audio.volume = this.volume;
            this.sounds.set(id as SoundId, audio);
        });
    }

    public play(id: SoundId) {
        if (!this.enabled) return;

        const sound = this.sounds.get(id);
        if (sound) {
            // Clone node to allow overlapping sounds of same type
            const clone = sound.cloneNode() as HTMLAudioElement;
            clone.volume = this.volume;
            clone.play().catch(() => {
                // Ignore errors (e.g. missing file or user interaction required)
            });
        }
    }

    public setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.sounds.forEach(s => s.volume = this.volume);
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

// Singleton instance
export const audioManager = new AudioManager();
