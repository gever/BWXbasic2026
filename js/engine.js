import { SYS } from './system.js';
import { IO } from './io.js';
import { GRAPHICS } from './graphics.js';
import { FS } from './fs.js';
import { Compiler } from './compiler.js';
import { SCREEN } from './screen.js';

export const ENGINE = {
    // NEW: Helper to generate source for JSPEEK without running
    generateOnly: () => {
        SYS.program.sort((a, b) => a.line - b.line);
        let fullSource = "// APPLESCRIPT -> JAVASCRIPT TRANSPILER OUTPUT\n\n";

        SYS.program.forEach(lineObj => {
            fullSource += `// --- LINE ${lineObj.line}: ${lineObj.src} ---\n`;
            // Compile to get the body attached
            const func = Compiler.compile(lineObj);
            if (func.generatedBody) {
                fullSource += func.generatedBody + "\n";
            }
        });

        SYS.transpiledSource = fullSource;
    },

    run: async () => {
        SYS.program.sort((a, b) => a.line - b.line);
        SYS.compiled = []; SYS.labels = {};

        SYS.program.forEach((x, i) => {
            SYS.labels[x.line] = i;
            console.log(`Compiling line ${x.line}: ${x.src}`);
            const f = Compiler.compile(x);
            SYS.compiled.push(f);
        });

        // reset state
        SYS.pc = 0;
        SYS.running = true;
        SYS.break = false;
        SYS.vars = {};
        SYS.arrays = {};
        SYS.stack = [];
        SYS.forStack = {};
        SYS.lastExecLine = 0;

        const breakBtn = document.getElementById('break-btn');
        breakBtn.style.display = 'block'; IO.cursorVisible = false; SCREEN.removeCursor();
        const t0 = performance.now(); let ly = t0; let ops = 0;
        try {
            while (SYS.running && SYS.pc < SYS.compiled.length) {
                if (SYS.break) {
                    IO.print(`\nBREAK IN ${SYS.program[SYS.pc]?.line}`);
                    SYS.running = false;
                    break;
                }

                // NEW: Track the line about to be executed
                if (SYS.program[SYS.pc]) SYS.lastExecLine = SYS.program[SYS.pc].line;

                const res = SYS.compiled[SYS.pc](SYS, IO, GRAPHICS, FS);
                if (res && res.then) {
                    await res;
                    ly = performance.now();
                }
                if (!SYS.running) break;
                if (SYS.break) { IO.print(`\nBREAK IN ${SYS.program[SYS.pc]?.line}`); SYS.running = false; break; }

                SYS.pc++; ops++;
                if ((ops & 127) === 0 && (performance.now() - ly) > 14) { await new Promise(r => setTimeout(r, 0)); ly = performance.now(); }
            }
        } catch (e) {
            IO.print("\n?" + e);
            SYS.running = false;
            IO.prompt();
            return;
        }
        breakBtn.style.display = 'none';
        SYS.running = false; IO.prompt();
    }
};
