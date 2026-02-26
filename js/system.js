export const SYS = {
    vars: {}, arrays: {}, program: [], compiled: [], defFn: {},
    transpiledSource: "", // NEW: Storage for JSPEEK
    NIL: { _isNil: true, toString: () => "NIL" }, // NEW: Hash Table missing item constant
    pc: 0, labels: {}, stack: [], forStack: {},
    lastExecLine: 0, // NEW: Track last executed line for WHERE
    lastDimArray: null, // NEW: Track last DIM initialized array for DATA
    running: false, break: false, inputCallback: null,
    getArray: (n, i) => {
        if (!SYS.arrays[n]) throw `UNDEFINED VARIABLE ${n}`;
        const isHash = SYS.arrays[n]._isHash;
        if (isHash) return SYS.arrays[n][i] === undefined ? SYS.NIL : SYS.arrays[n][i];
        return SYS.arrays[n][i] === undefined ? (n.endsWith('$') ? "" : 0) : SYS.arrays[n][i];
    },
    setArray: (n, i, v) => {
        if (!SYS.arrays[n]) throw `UNDEFINED VARIABLE ${n}`;
        if (v === SYS.NIL) { delete SYS.arrays[n][i]; }
        else { SYS.arrays[n][i] = v; }
    },

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
