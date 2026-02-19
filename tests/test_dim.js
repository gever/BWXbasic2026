import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';

IO.print = console.log;

const c1 = Compiler.compile({ line: 1610, src: "DIM ARR1(5)" });
console.log(c1.generatedBody);

const c2 = Compiler.compile({ line: 1645, src: "DIM MAT(3, 2)" });
console.log(c2.generatedBody);

