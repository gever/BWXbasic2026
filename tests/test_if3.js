import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock Browser
global.document = {
    getElementById: (id) => {
        if (id === 'main-canvas') {
            return {
                getContext: () => ({
                    measureText: () => ({ width: 10 }),
                    fillRect: () => { }, fillText: () => { },
                    save: () => { }, restore: () => { },
                    beginPath: () => { }, moveTo: () => { },
                    lineTo: () => { }, stroke: () => { },
                    strokeRect: () => { }, ellipse: () => { },
                    fill: () => { }, closePath: () => { },
                })
            };
        }
        if (id === 'input-trap') return { value: "", focus: () => { } };
        return { style: {} };
    },
    addEventListener: () => { },
    fonts: { load: async () => { } }
};

const { Compiler } = await import('../js/compiler.js');
const { IO } = await import('../js/io.js');
const { SCREEN } = await import('../js/screen.js');
const { GRAPHICS } = await import('../js/graphics.js');
const { ENGINE } = await import('../js/engine.js');
const { SYS } = await import('../js/system.js');

let err = 0;
SYS.program = [
    { line: 10, src: 'LET ERRORS = 0' },
    { line: 20, src: 'IF ERRORS = 0 THEN PRINT "SUCCESS"' },
    { line: 30, src: 'IF ERRORS > 0 THEN PRINT "FAILED"' },
    { line: 40, src: 'END' }
];

let out = "";
IO.print = (txt, nl) => { out += txt + (nl ? '\n' : ''); };

const dummyCanvas = global.document.getElementById('main-canvas');
const dummyCtx = dummyCanvas.getContext('2d');
GRAPHICS.init(dummyCtx);
SCREEN.init(dummyCanvas, dummyCtx);
IO.init(global.document.getElementById('input-trap'));

await ENGINE.run();
console.log("Output:");
console.log(out);
