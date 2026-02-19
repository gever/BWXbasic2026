const { Compiler } = await import('../js/compiler.js');
const { IO } = await import('../js/io.js');
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
global.document={getElementById:()=>({style:{}})};
IO.print = (txt, nl) => { out += txt + (nl ? '\n' : ''); };

await ENGINE.run();
console.log("Output:");
console.log(out);
