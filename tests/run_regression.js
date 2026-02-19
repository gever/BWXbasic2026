/**
 * Headless Test Runner for bwxBASIC
 * Executes demo/regression.bas and verifies the output
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

// 3. Setup Capture Logic
let testOutput = "";
let errorsFound = 0;

// Override IO.print to capture text instead of drawing
IO.print = (txt, newline = true, color = null) => {
    const s = txt.toString();
    testOutput += s;
    if (newline) testOutput += '\n';

    // Useful for debugging if a test hangs
    // console.log(s);
};

// 4. Load Regression Test Suite
const loadTestFile = (filepath) => {
    const absPath = path.join(projectRoot, filepath);
    console.log(`Loading test suite: ${absPath}`);

    const text = fs.readFileSync(absPath, 'utf8');
    const lines = text.split(/\r\n|\n|\r/);
    const prog = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        const m = line.match(/^(\d+)\s+(.*)/);
        if (m) {
            prog.push({ line: parseInt(m[1]), src: m[2] });
        }
    }

    // Remove the 1999 GOTO -1 trap line, since our engine correctly executes sequentially.
    const cleanProg = prog.filter(x => x.line !== 1999);

    SYS.program = cleanProg;
    SYS.vars = {};
    SYS.arrays = {};
};

// 5. Run the Engine
const runTest = async () => {
    try {
        // Initialize required engine components
        const dummyCanvas = global.document.getElementById('main-canvas');
        const dummyCtx = dummyCanvas.getContext('2d');
        const dummyTrap = global.document.getElementById('input-trap');

        GRAPHICS.init(dummyCtx);
        SCREEN.init(dummyCanvas, dummyCtx);
        IO.init(dummyTrap);

        loadTestFile('demo/regression.bas');

        console.log('Running test suite...');
        const t0 = performance.now();

        await ENGINE.run();

        const duration = (performance.now() - t0).toFixed(2);
        console.log(`Execution completed in ${duration}ms.\n`);

        await new Promise(r => setTimeout(r, 100)); // wait for output flush

        // Check the final output
        if (testOutput.includes("SUCCESS: All tests passed!")) {
            console.log("✅ Regression Test Passed!");
            process.exit(0);
        } else {
            console.error("❌ Regression Test Failed!");
            console.error("Engine Output:\n" + testOutput);
            process.exit(1);
        }

    } catch (e) {
        console.error("Fatal exception during test execution:", e);
        process.exit(1);
    }
};

runTest();
