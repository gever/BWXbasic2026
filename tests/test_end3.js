global.document = { getElementById: (id) => ({ style: {} }) };
const { Compiler } = await import('../js/compiler.js');
const { IO } = await import('../js/io.js');
const { ENGINE } = await import('../js/engine.js');
const { SYS } = await import('../js/system.js');

let out = "";
IO.print = (txt, nl) => { out += txt + (nl ? '\n' : ''); };

SYS.program = [
    { line: 10, src: 'PRINT "Hello"' },
    { line: 20, src: 'END' }
];

await ENGINE.run();
console.log("Output Length:", out.length);
console.log("Output Content:", JSON.stringify(out));
