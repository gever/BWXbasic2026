import { Compiler } from './js/compiler.js';
const tokens = { src: "GR_PEN_UP : GR_FWD 10 : GR_RT 90 : GR_PEN_DN" };
const fn = Compiler.compile(tokens);
console.log(fn.generatedBody);
