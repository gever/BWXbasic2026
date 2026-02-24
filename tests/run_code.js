/**
 * Headless Runner for bwxBASIC
 * Executes an arbitrary BASIC program
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Setup Global Mocks for Browser APIs
global.document = {
    getElementById: (id) => {
        if (id === 'main-canvas') {
            return {
                getContext: () => ({
                    measureText: () => ({ width: 10 }),
                    fillRect: () => { },
                    fillText: () => { },
                    save: () => { },
                    restore: () => { },
                    beginPath: () => { },
                    moveTo: () => { },
                    lineTo: () => { },
                    stroke: () => { },
                    strokeRect: () => { },
                    ellipse: () => { },
                    fill: () => { },
                    closePath: () => { },
                })
            };
        }
        if (id === 'input-trap') {
            return { value: "", focus: () => { } };
        }
        if (id === 'break-btn') {
            return { style: {} };
        }
        return { style: {} };
    },
    addEventListener: () => { },
    fonts: {
        load: async () => { }
    }
};

global.window = {
    onkeydown: null
};

global.performance = {
    now: () => Date.now()
};

global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    length: 0,
    key: () => null
};

global.fetch = async () => ({
    ok: false,
    text: async () => ""
});

// 2. Import bwxBASIC Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// We must dynamically import because we just mocked the globals above
const { CONFIG } = await import('../js/config.js');
const { SYS } = await import('../js/system.js');
const { IO } = await import('../js/io.js');
const { SCREEN } = await import('../js/screen.js');
const { GRAPHICS } = await import('../js/graphics.js');
const { ENGINE } = await import('../js/engine.js');

// 3. Setup Output Logic
// Override IO.print to output directly to stdout instead of capturing for a test
IO.print = (txt, newline = true, color = null) => {
    const s = txt !== undefined && txt !== null ? txt.toString() : "";
    if (newline) {
        process.stdout.write(s + '\n');
    } else {
        process.stdout.write(s);
    }
};

// 4. Load Target File
const loadFile = (filepath) => {
    const absPath = path.resolve(process.cwd(), filepath);

    if (!fs.existsSync(absPath)) {
        console.error(`Error: File not found at ${absPath}`);
        process.exit(1);
    }

    const text = fs.readFileSync(absPath, 'utf8');
    const lines = text.split(/\r\n|\n|\r/);
    const prog = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        const m = line.match(/^(\d+)\s+(.*)/);
        if (m) {
            const ln = parseInt(m[1]);
            prog.push({ line: ln, src: m[2] });
        } else {
            prog.push({ line: null, src: line });
        }
    }

    SYS.program = prog;
    SYS.vars = {};
    SYS.arrays = {};
};

// 5. Run the Engine
const run = async () => {
    const targetFile = process.argv[2];
    if (!targetFile) {
        console.error("Usage: node tests/run_code.js <path_to_basic_file>");
        process.exit(1);
    }

    try {
        // Initialize required engine components
        const dummyCanvas = global.document.getElementById('main-canvas');
        const dummyCtx = dummyCanvas.getContext('2d');
        const dummyTrap = global.document.getElementById('input-trap');

        GRAPHICS.init(dummyCtx);
        SCREEN.init(dummyCanvas, dummyCtx);
        IO.init(dummyTrap);

        loadFile(targetFile);

        await ENGINE.run();

        // Allow any pending output to flush
        await new Promise(r => setTimeout(r, 10));
        process.exit(0);
    } catch (e) {
        console.error("Fatal exception during execution:", e);
        process.exit(1);
    }
};

run();
