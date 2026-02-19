export const SYS = {
    vars: {}, arrays: {}, program: [], compiled: [],
    transpiledSource: "", // NEW: Storage for JSPEEK
    pc: 0, labels: {}, stack: [], forStack: {},
    lastExecLine: 0, // NEW: Track last executed line for WHERE
    running: false, break: false, inputCallback: null,
    getArray: (n, i) => { if (!SYS.arrays[n]) throw `UNDEFINED ARRAY ${n}`; return SYS.arrays[n][i]; },
    setArray: (n, i, v) => { if (!SYS.arrays[n]) throw `UNDEFINED ARRAY ${n}`; SYS.arrays[n][i] = v; },

    // --- PRNG ---
    seed: 12345,
    rnd: (max) => {
        SYS.seed = (SYS.seed * 9301 + 49297) % 233280;
        return (SYS.seed / 233280.0) * max;
    },
    setSeed: (val) => {
        SYS.seed = Math.floor(Math.abs(val)) % 233280;
    }
};
