import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

global.document = {
    getElementById: () => ({
        getContext: () => ({ measureText: () => ({ width: 10 }), fillRect: () => {}, fillText: () => {}, save: () => {}, restore: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, strokeRect: () => {}, ellipse: () => {}, fill: () => {}, closePath: () => {} }),
        style: {}
    }),
    addEventListener: () => { },
    fonts: { load: async () => { } }
};
global.window = { onkeydown: null };
global.performance = { now: () => Date.now() };
global.localStorage = { getItem: () => null, setItem: () => {}, length: 0, key: () => null };
global.fetch = async () => ({ ok: false, text: async () => "" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const { CONFIG } = await import('../js/config.js');
const { SYS } = await import('../js/system.js');
const { IO } = await import('../js/io.js');
const { SCREEN } = await import('../js/screen.js');
const { GRAPHICS } = await import('../js/graphics.js');
const { ENGINE } = await import('../js/engine.js');

IO.print = (txt, nl) => { process.stdout.write(txt + (nl ? '\n' : '')); };

const loadTestFile = (filepath) => {
    const absPath = path.join(projectRoot, filepath);
    const text = fs.readFileSync(absPath, 'utf8');
    const lines = text.split(/\r\n|\n|\r/);
    const prog = [];
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        const m = line.match(/^(\d+)\s+(.*)/);
        if (m) prog.push({ line: parseInt(m[1]), src: m[2] });
        else prog.push({ line: null, src: line });
    }
    SYS.program = prog;
    SYS.vars = {}; SYS.arrays = {};
};

const runTest = async () => {
    try {
        const dummyCanvas = global.document.getElementById('main-canvas');
        const dummyCtx = dummyCanvas.getContext('2d');
        const dummyTrap = global.document.getElementById('input-trap');
        GRAPHICS.init(dummyCtx);
        SCREEN.init(dummyCanvas, dummyCtx);
        IO.init(dummyTrap);

        loadTestFile('demo/supertrek_bwx.bas');
        
        // Just pre-compile to check for syntax errors
        try {
            await ENGINE.generateOnly();
            if (SYS.running === false) {
                 console.error("Syntax Error during compilation: ", SYS.pc);
            } else {
                 console.log("Compile Success!");
            }
        } catch (e) {
            console.error("Syntax Error during compilation: ", e, SYS.pc, SYS.program[SYS.pc]);
        }
        
    } catch (e) {
        console.error("Exception:", e);
    }
};

runTest();
