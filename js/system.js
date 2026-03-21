import { CONFIG } from './config.js';

export const SYS = {
    vars: {}, arrays: {}, program: [], compiled: [], defFn: {},
    transpiledSource: "", // NEW: Storage for JSPEEK
    normalizeProgram: (numberedLines, unnumberedLines) => {
        const marker = "REM freestyle boundary ================";
        if (numberedLines.length > 0 && unnumberedLines.length > 0) {
            const hasRealUnnumbered = unnumberedLines.some(l => l.src.trim() !== "" && l.src.trim() !== marker);
            if (hasRealUnnumbered) {
                const hasMarker = unnumberedLines.some(l => l.src.trim() === marker);
                if (!hasMarker) {
                    unnumberedLines.unshift({ line: null, src: marker });
                }
            }
        }
        numberedLines.sort((a, b) => a.line - b.line);
        SYS.program = numberedLines.concat(unnumberedLines);
    },
    NIL: { _isNil: true, toString: () => "NIL" }, // NEW: Hash Table missing item constant
    pc: 0, labels: {}, stack: [], forStack: {},
    lastExecLine: 0, // NEW: Track last executed line for WHERE
    dataStore: [], dataPtr: 0, // NEW: Store for DATA statements and pointer
    running: false, break: false, inputCallback: null,
    allocArray: (...dims) => {
        const build = (dIdx) => {
            if (dIdx >= dims.length) return undefined;
            return Array.from({ length: dims[dIdx] + 1 }, () => build(dIdx + 1));
        };
        return dims.length ? build(0) : [];
    },
    writeAndAdvanceIndices: (arr, indices, val) => {
        if (!Array.isArray(arr)) throw "NOT AN ARRAY";
        let curr = arr;
        let depth = 0;

        while (Array.isArray(curr)) {
            curr = curr[0];
            depth++;
        }
        while (indices.length < depth) indices.push(0);

        curr = arr;
        for (let i = 0; i < indices.length - 1; i++) {
            if (curr[indices[i]] === undefined) curr[indices[i]] = [];
            curr = curr[indices[i]];
        }
        curr[indices[indices.length - 1]] = val;
        if (indices.length > 1) {
            arr[indices.join(',')] = val;
        }

        for (let i = indices.length - 1; i >= 0; i--) {
            indices[i]++;
            let level = arr;
            for (let j = 0; j < i; j++) level = level[indices[j]];
            if (!Array.isArray(level) || indices[i] < level.length) return;
            indices[i] = 0; // Wrap around and let the next inner dimension increment
        }
    },
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
    },

    // --- Core Environment Reset ---
    resetEnvironment: () => {
        SYS.vars = {};
        SYS.arrays = {};
        // Natively expose system config tracking
        SYS.arrays['SYS'] = { 
            _isHash: true, 
            "VERSION": CONFIG.version,
            "COLS": CONFIG.cols,
            "ROWS": CONFIG.rows,
            "MAX_X": CONFIG.cols,
            "MAX_Y": CONFIG.rows
        };
    }
};
