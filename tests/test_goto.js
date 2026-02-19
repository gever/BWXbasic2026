import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';

IO.print = console.log;

const c1 = Compiler.compile({ line: 1999, src: "GOTO -1" });
console.log(c1.generatedBody);
