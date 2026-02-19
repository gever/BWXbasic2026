import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';
import { ENGINE } from '../js/engine.js';
import { SYS } from '../js/system.js';

let out = "";
IO.print = (txt, nl) => { out += txt + (nl ? '\n' : ''); };

SYS.program = [
    { line: 10, src: 'PRINT "Hello"' },
    { line: 20, src: 'END' }
];

await ENGINE.run();
console.log("Output Length:", out.length);
console.log("Output Content:", JSON.stringify(out));
