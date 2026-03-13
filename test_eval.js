import path from 'path';
import { fileURLToPath } from 'url';

global.document = { getElementById: (id) => ({ getContext: () => ({ measureText: () => ({ width: 10 }), fillRect: () => {}, fillText: () => {}, save: () => {}, restore: () => {} }), style: {} }), addEventListener: () => { }, fonts: { load: async () => { } } };
global.window = { onkeydown: null };
global.performance = { now: () => Date.now() };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { SYS } = await import(path.join(__dirname, 'js/system.js'));
const { IO } = await import(path.join(__dirname, 'js/io.js'));
const { SCREEN } = await import(path.join(__dirname, 'js/screen.js'));
const { GRAPHICS } = await import(path.join(__dirname, 'js/graphics.js'));
const { ENGINE } = await import(path.join(__dirname, 'js/engine.js'));

let outputs = [];
IO.print = (txt, newline = true, color = null) => { 
    outputs.push(txt.toString());
};
IO.prompt = () => {};

IO.handleCommand('10 PRINT "start"');
IO.handleCommand('PRINT "Waiting"');
IO.handleCommand('DELAY 5');
IO.handleCommand('GOTO 10');

const runTest = async () => {
    try {
        const dummyCanvas = global.document.getElementById('main-canvas');
        GRAPHICS.init(dummyCanvas.getContext('2d'));
        SCREEN.init(dummyCanvas, dummyCanvas.getContext('2d'));
        IO.init(global.document.getElementById('input-trap'));

        setTimeout(() => { SYS.break = true; }, 100);
        await ENGINE.run();

        console.log("Transpiled Source:\n" + SYS.transpiledSource);
        console.log("Labels:\n" + JSON.stringify(SYS.labels));
        console.log("Outputs:\n" + outputs.join(", "));
        
    } catch (e) { console.error(e); }
    process.exit(0);
};

runTest();
