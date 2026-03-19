import { SYS } from './system.js';

export const SOUND = {
    sounds: [],
    
    load: async (url) => {
        return new Promise((resolve) => {
            const index = SOUND.sounds.length;
            const howl = new Howl({
                src: [url],
                preload: true,
                onload: () => resolve(index),
                onloaderror: (id, err) => {
                    console.error("Failed to load sound:", url, err);
                    resolve(index);
                }
            });
            SOUND.sounds.push(howl);

            // Periodically check if we need to abort loading
            const checkTimer = setInterval(() => {
                if (SYS && SYS.break) {
                    clearInterval(checkTimer);
                    howl.unload(); // Stops downloading
                    resolve(index);
                }
            }, 100);
            
            // Clean timer normally when done
            howl.once('load', () => clearInterval(checkTimer));
            howl.once('loaderror', () => clearInterval(checkTimer));
        });
    },

    play: (id) => {
        const howl = SOUND.sounds[id];
        if (howl) howl.play();
        else console.warn("Invalid sound ID:", id);
    },

    playWait: async (id) => {
        return new Promise((resolve) => {
            const howl = SOUND.sounds[id];
            if (howl) {
                let soundId = howl.play();
                let checkTimer;
                const finish = () => {
                    clearInterval(checkTimer);
                    resolve();
                };
                
                howl.once('end', finish, soundId);
                howl.once('loaderror', finish, soundId);
                howl.once('playerror', finish, soundId);
                
                checkTimer = setInterval(() => {
                    if (SYS && SYS.break) {
                        howl.stop(soundId);
                        finish();
                    }
                }, 100);
            } else {
                console.warn("Invalid sound ID:", id);
                resolve();
            }
        });
    }
};
