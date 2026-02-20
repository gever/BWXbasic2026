import { SYS } from './system.js';
import { IO } from './io.js';
import { GRAPHICS } from './graphics.js';
import { FS } from './fs.js';
import { Compiler } from './compiler.js';
import { SCREEN } from './screen.js';

export const ENGINE = {
    // NEW: Helper to generate source for JSPEEK without running
    generateOnly: () => {
        let fullSource = "// APPLESCRIPT -> JAVASCRIPT TRANSPILER OUTPUT\n\n";

        SYS.program.forEach(lineObj => {
            fullSource += `// --- LINE ${lineObj.line}: ${lineObj.src} ---\n`;

            // Temporary object for compilation preview to strip labels
            const x = { line: lineObj.line, src: lineObj.src };
            const labelMatch = x.src.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:(.*)$/);
            if (labelMatch) {
                x.src = labelMatch[2].trim() || "REM";
            }

            // Compile to get the body attached
            const func = Compiler.compile(x);
            if (func.generatedBody) {
                fullSource += func.generatedBody + "\n";
            }
        });

        SYS.transpiledSource = fullSource;
    },

    run: async () => {
        SYS.compiled = []; SYS.labels = {}; SYS.funSkipMap = {};
        const funIndices = [];

        SYS.program.forEach((x, i) => {
            if (x.line !== null) SYS.labels[x.line] = i;

            // Clone x locally to prevent destructive global mapping out of SYS.program
            const compileChunk = { line: x.line, src: x.src };

            // Catch optional alphanumeric labels (e.g., LoopStart: LET X = 1)
            const labelMatch = compileChunk.src.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:(.*)$/);
            if (labelMatch) {
                SYS.labels[labelMatch[1].toUpperCase()] = i;
                compileChunk.src = labelMatch[2].trim() || "REM";
            }

            // Catch FUN definitions for forward jumping (e.g., FUN MYMATH(X,Y))
            const funMatch = compileChunk.src.match(/^\s*FUN\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/i);
            if (funMatch) {
                SYS.labels[funMatch[1].toUpperCase()] = i;
                funIndices.push(i);
            }

            console.log(`Compiling line ${compileChunk.line}: ${compileChunk.src}`);
            const f = Compiler.compile(compileChunk);
            SYS.compiled.push(f);
        });

        // Initialize block skips to jump sequential execution over subroutine blocks
        for (let j = 0; j < funIndices.length; j++) {
            SYS.funSkipMap[funIndices[j]] = (j + 1 < funIndices.length) ? funIndices[j + 1] : SYS.program.length;
        }

        // reset state
        SYS.pc = 0;
        SYS.running = true;
        SYS.break = false;
        SYS.vars = {};
        SYS.arrays = {};
        SYS.stack = [];
        SYS.forStack = {};
        SYS.lastExecLine = 0;
        SYS.lastDimArray = null;
        SYS.callArgs = null;
        SYS.hasReturned = false;
        SYS.returnValue = 0;

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

                const res = SYS.compiled[SYS.pc](SYS, IO, GRAPHICS, FS, ENGINE);
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
    },

    // NEW: Recursive inner-execution loop for CALL statements
    callFunction: async (funcName, args) => {
        const u = funcName.toUpperCase();
        if (SYS.labels[u] === undefined) {
            IO.print(`?UNDEF FUNCTION ${u}`);
            SYS.running = false;
            return 0;
        }

        // 1. Save execution state of outer environment
        const outerPc = SYS.pc;
        const outerHasReturned = SYS.hasReturned;
        const outerCallArgs = SYS.callArgs;

        // 2. Setup inner state
        SYS.pc = SYS.labels[u];
        SYS.callArgs = args;
        SYS.hasReturned = false;
        SYS.returnValue = 0;

        let ly = performance.now();
        let ops = 0;

        // 3. Begin Local Execution Loop
        try {
            while (SYS.running && !SYS.hasReturned && SYS.pc < SYS.compiled.length) {
                if (SYS.break) {
                    SYS.running = false;
                    break;
                }

                if (SYS.program[SYS.pc]) SYS.lastExecLine = SYS.program[SYS.pc].line;

                const res = SYS.compiled[SYS.pc](SYS, IO, GRAPHICS, FS, ENGINE);
                if (res && res.then) {
                    await res;
                    ly = performance.now();
                }

                if (!SYS.running) break;
                if (SYS.break) { SYS.running = false; break; }
                if (SYS.hasReturned) break; // Trapped by a RETURN block

                SYS.pc++; ops++;
                if ((ops & 127) === 0 && (performance.now() - ly) > 14) {
                    await new Promise(r => setTimeout(r, 0));
                    ly = performance.now();
                }
            }
        } catch (e) {
            IO.print("\n?" + e);
            SYS.running = false;
        }

        const returnedVal = SYS.returnValue;

        // 4. Restore execution state organically
        SYS.pc = outerPc;
        SYS.hasReturned = outerHasReturned;
        SYS.callArgs = outerCallArgs;

        return returnedVal;
    }
};
