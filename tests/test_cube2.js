import { Compiler } from '../js/compiler.js';
import { IO } from '../js/io.js';

IO.print = console.log;

const c1 = Compiler.compile({ line: 1850, src: "IF CUBE(0, 2, 1) <> 21 THEN ERRORS = ERRORS + 1" });
console.log(c1.generatedBody);

const c2 = Compiler.compile({ line: 1840, src: "LET CUBE(1, 1, 1) = 111 : LET CUBE(0, 2, 1) = 021" });
console.log(c2.generatedBody);

const c3 = Compiler.compile({ line: 432, src: "1999 GOTO -1 : REM This line should never be executed" });
console.log(c3.generatedBody);
