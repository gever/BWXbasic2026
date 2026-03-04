export const SYS = {
    vars: {}, arrays: {}, program: [], compiled: [], defFn: {},
    transpiledSource: "", // NEW: Storage for JSPEEK
    NIL: { _isNil: true, toString: () => "NIL" }, // NEW: Hash Table missing item constant
    pc: 0, labels: {}, stack: [], forStack: {},
    lastExecLine: 0, // NEW: Track last executed line for WHERE
    lastDimArray: null, // NEW: Track last DIM initialized array for DATA
    running: false, break: false, inputCallback: null,
    getArray: (n, i) => {
        let arr = SYS.arrays[n] || SYS.vars[n];
        if (!arr || typeof arr !== 'object') throw `UNDEFINED VARIABLE ${n}`;
        const isHash = arr._isHash;
        if (isHash) return arr[i] === undefined ? SYS.NIL : arr[i];
        return arr[i] === undefined ? (n.endsWith('$') ? "" : 0) : arr[i];
    },
    setArray: (n, i, v) => {
        let arr = SYS.arrays[n] || SYS.vars[n];
        if (!arr || typeof arr !== 'object') throw `UNDEFINED VARIABLE ${n}`;
        if (v === SYS.NIL) { delete arr[i]; }
        else { arr[i] = v; }
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
