import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';

IO.print = console.log;

const c1 = Compiler.compile({ line: 10, src: "ON X GOTO 100, 200, 300" });
console.log("ON GOTO:\n" + c1.generatedBody);

const c2 = Compiler.compile({ line: 20, src: "ON Y+1 GOSUB 1000, 2000" });
console.log("ON GOSUB:\n" + c2.generatedBody);

const c3 = Compiler.compile({ line: 30, src: "ON Z GOTO Label1, Label2" });
console.log("ON GOTO with Labels:\n" + c3.generatedBody);
