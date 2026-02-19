import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';

IO.print = console.log;

const c1 = Compiler.compile({ line: 3100, src: "END" });
console.log(c1.generatedBody);
