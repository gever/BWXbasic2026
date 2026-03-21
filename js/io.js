import { CONFIG } from './config.js';
import { SYS } from './system.js';
import { SCREEN } from './screen.js';
import { Tokenizer, SYNTAX } from './parser.js';
import { Compiler } from './compiler.js';
import { ENGINE } from './engine.js';
import { FS } from './fs.js';
import { GRAPHICS } from './graphics.js';
import { HELP_DATA } from './help.js';
import { SOUND } from './sound.js';

let inputTrap = null; // will be passed from main

export const IO = {

    // REPL Editing State
    buffer: [],         // Keyboard buffer for INKEY$
    history: [],
    historyIdx: -1,
    lineBuffer: "",     // Current command string being typed
    lineCursor: 0,      // Cursor position within lineBuffer
    viewScroll: 0,      // NEW: Horizontal scroll offset
    promptStartX: 0,    // Where the prompt ] started
    promptStartY: 0,

    init: (trapElement) => {
        inputTrap = trapElement;
    },

    // --- Scrolling Hook ---
    scrollHook: () => {
        if (IO.promptStartY > 0) {
            IO.promptStartY--;
        }
    },

    // --- Runtime Input Handling ---
    bufferKey: (key) => {
        if (key.length === 1 || key === 'Enter') {
            const k = key === 'Enter' ? '\r' : key;
            if (IO.waiter) { const w = IO.waiter; IO.waiter = null; w(k); }
            else { IO.buffer.push(k); if (IO.buffer.length > 16) IO.buffer.shift(); }
        }
    },
    inkey: async (mode) => {
        if (Math.floor(mode) === 0) return IO.buffer.shift() || "";
        if (IO.buffer.length > 0) return IO.buffer.shift();
        return new Promise(r => IO.waiter = r);
    },

    format: (val, nested = false) => {
        if (typeof val === 'number') {
            // Round to 3 decimals, strip trailing zeros
            return parseFloat(val.toFixed(3));
        }
        if (typeof val === 'string' && nested) {
            return `"${val}"`;
        }
        if (typeof val === 'object' && val !== null) {
            if (val._isNil) return "NIL";
            if (Array.isArray(val)) {
                return "ARRAY(" + val.map(v => IO.format(v, true)).join(", ") + ")";
            }
            if (val._isHash) {
                const parts = [];
                for (const k in val) {
                    if (k !== '_isHash') {
                        parts.push(`"${k}", ${IO.format(val[k], true)}`);
                    }
                }
                return "DICT(" + parts.join(", ") + ")";
            }
        }
        return val;
    },

    // --- Helper Functions ---
    help: (topic = "") => {
        if (topic) {
            topic = topic.toUpperCase();
            let results = [];
            let matchedCat = Object.keys(HELP_DATA).find(c => c.toUpperCase() === topic || c.toUpperCase().includes(topic));
            
            if (matchedCat) {
                HELP_DATA[matchedCat].forEach(item => results.push(item));
                IO.print(`${matchedCat}:`);
                let namesFull = results.map(r => r.c.split(' ')[0]);
                IO.print(namesFull.join(', '));
            } else {
                Object.keys(HELP_DATA).forEach(cat => {
                    HELP_DATA[cat].forEach(item => {
                        let cmdName = item.c.split(' ')[0].split('(')[0].toUpperCase();
                        if (cmdName === topic || item.c.toUpperCase().includes(topic)) {
                            results.push(item);
                        }
                    });
                });
                if (results.length === 0) {
                    IO.print(`?NO HELP FOUND FOR '${topic}'`);
                } else {
                    results.forEach(item => {
                        IO.print(`${item.c}`);
                        IO.print(`  ${item.d}`);
                        IO.print(`  Ex: ${item.e}`);
                    });
                }
            }
            return;
        }

        const ov = document.getElementById('help-overlay'), ct = document.getElementById('help-content'), search = document.getElementById('help-search');
        ov.style.display = 'flex'; search.focus();

        const render = (filter = "") => {
            let html = "<div class='help-title' style='text-align:center'>QUICK INDEX</div>";
            html += "<div style='text-align:center; margin-bottom: 15px;'><a href='https://github.com/gever/BWXbasic2026' target='_blank' style='color:#0056b3; font-weight:bold;'>GitHub Repo</a> &nbsp;|&nbsp; <a href='https://gever.github.io/BWXbasic2026/bwxBASIC_manual.html' target='_blank' style='color:#0056b3; font-weight:bold;'>Full Manual</a> &nbsp;|&nbsp; <a href='https://bwxbasic.org' target='_blank' style='color:#0056b3; font-weight:bold;'>bwxbasic.org</a></div>";
            html += "<div class='index-grid'>";
            const keys = Object.keys(HELP_DATA);
            keys.forEach(cat => { html += `<button class='index-btn' onclick="document.getElementById('sec-${cat}').scrollIntoView({behavior:'smooth'})">${cat}</button>`; });
            html += "</div><hr/><br/>";
            keys.forEach(cat => {
                html += `<div id='sec-${cat}' class='help-section'><div class='help-title'>${cat}</div>`;
                HELP_DATA[cat].forEach(item => {
                    if (!filter || item.c.includes(filter.toUpperCase()) || item.d.toUpperCase().includes(filter.toUpperCase())) {
                        html += `<div class='help-entry'><div class='help-cmd'>${item.c}</div><div class='help-desc'>${item.d}</div><div class='help-ex'>${item.e}</div></div>`;
                    }
                });
                html += "</div>";
            });
            ct.innerHTML = html;
        };
        render();
        search.onkeyup = (e) => render(e.target.value);
        search.onkeydown = (e) => {
            if (e.key === 'Escape') {
                ov.style.display = 'none';
                document.getElementById('input-trap').focus();
            }
        };
    },

    jsEcho: false,
    jsBuffer: "",

    print: (txt, newline = true, color = null) => {
        const s = txt.toString();
        if (IO.jsEcho) {
            IO.jsBuffer += s;
            if (newline) {
                console.log(IO.jsBuffer);
                IO.jsBuffer = "";
            }
        }
        SCREEN.put(s, color);
        if (newline) SCREEN.newline();
    },

    input: () => {
        IO.cursorVisible = true; SCREEN.drawCursor();
        return new Promise(r => { SYS.inputCallback = r; inputTrap.value = ""; inputTrap.focus(); });
    },

    home: () => SCREEN.clear(),
    htab: (x) => { SCREEN.removeCursor(); SCREEN.cx = Math.max(0, Math.min(CONFIG.cols - 1, x - 1)); SCREEN.drawCursor(); },
    vtab: (y) => { SCREEN.removeCursor(); SCREEN.cy = Math.max(0, Math.min(CONFIG.rows - 1, y - 1)); SCREEN.drawCursor(); },
    setPos: (x, y) => { SCREEN.removeCursor(); SCREEN.cx = Math.max(0, Math.min(CONFIG.cols - 1, x - 1)); SCREEN.cy = Math.max(0, Math.min(CONFIG.rows - 1, y - 1)); SCREEN.drawCursor(); },

    // --- Command Execution ---
    handleCommand: (raw) => {
        const cRaw = raw.trim();
        const c = cRaw.toUpperCase();

        if (cRaw) {
            // Save to history (avoid duplicates at end)
            if (IO.history[IO.history.length - 1] !== cRaw) IO.history.push(cRaw);
            IO.historyIdx = IO.history.length;
        }

        if (!c) return IO.prompt();

        const m = cRaw.match(/^(\d+)\s*(.*)/);
        if (m) {
            const l = parseInt(m[1]);
            // Remove existing numerical line match (if any)
            let existingIdx = -1;
            for (let i = 0; i < SYS.program.length; i++) {
                if (SYS.program[i].line === l) { existingIdx = i; break; }
            }
            if (existingIdx !== -1) SYS.program.splice(existingIdx, 1);

            // Insert new line maintaining positional explicit boundaries
            if (m[2]) {
                let targetIdx = SYS.program.length; // Default to append
                let lastExplicitNumber = 0;

                for (let i = 0; i < SYS.program.length; i++) {
                    const ln = SYS.program[i].line;
                    if (ln !== null) {
                        lastExplicitNumber = ln;
                    }
                    if (l < lastExplicitNumber && ln !== null) {
                        targetIdx = i;
                        break;
                    }
                }
                SYS.program.splice(targetIdx, 0, { line: l, src: m[2] });
            }
            IO.prompt();
        } else {
            if (c.startsWith('LIST')) {
                let min = 0, max = 65535;
                const args = c.substring(4).trim();

                if (args === ".") {
                    min = SYS.lastExecLine; max = SYS.lastExecLine;
                }
                else if (args.length > 0) {
                    if (args.includes('-')) {
                        const parts = args.split('-');
                        if (parts[0].trim() !== "") min = parseInt(parts[0]);
                        if (parts[1].trim() !== "") max = parseInt(parts[1]);
                    } else {
                        min = parseInt(args);
                        max = parseInt(args);
                    }
                }

                let indent = 0;
                let currentEffectiveLine = 0;
                SYS.program.forEach(l => {
                    if (l.line !== null) currentEffectiveLine = l.line;

                    // Calculate indentation
                    const tokens = Tokenizer.tokenize(l.src);
                    let tempIndent = indent;

                    for (let t of tokens) {
                        const tu = t.toUpperCase();
                        if (tu === 'FOR') indent++;
                        else if (tu === 'NEXT') {
                            indent = Math.max(0, indent - 1);
                            tempIndent = indent;
                        }
                        else if (tu === 'REM' || t === "'") break;
                    }

                    if (l.line !== null) {
                        if (l.line >= min && l.line <= max) {
                            // Draw Line Number (Standard Color)
                            IO.print(`${l.line} `, false);
                        }
                    } else {
                        // Un-numbered blocks (like FUN or inline nested closures) natively sit inside arrays
                        // We check them against the currentEffectiveLine they belong to.
                        if (currentEffectiveLine >= min && currentEffectiveLine <= max) {
                            IO.print(`     `, false);
                        }
                    }

                    const shouldDraw = (l.line !== null && l.line >= min && l.line <= max) || (l.line === null && currentEffectiveLine >= min && currentEffectiveLine <= max);

                    if (shouldDraw) {
                        // Draw Indentation
                        const spaces = "  ".repeat(tempIndent);
                        IO.print(spaces, false);

                        // Draw Scanned Tokens with Color
                        const scanned = Tokenizer.scan(l.src);
                        let isComment = false;

                        for (let item of scanned) {
                            if (item.type === 'SPACE') {
                                IO.print(item.val, false);
                            } else {
                                let color = isComment ? SYNTAX.colors.COMMENT : SYNTAX.classify(item.val);

                                // Check if this token starts a comment
                                if (!isComment) {
                                    const tu = item.val.toUpperCase();
                                    if (tu === 'REM' || item.val === "'") {
                                        isComment = true;
                                        color = SYNTAX.colors.COMMENT;
                                    }
                                }

                                IO.print(item.val, false, color);
                            }
                        }
                        IO.print(""); // Newline
                    }
                });
                IO.prompt();
            }
            else if (c === 'RUN') {
                ENGINE.run().catch(e => {
                    IO.print("?RUNTIME ERROR");
                    SYS.running = false;
                    IO.prompt();
                });
            }
            else if (c.startsWith('EDIT')) {
                const arg = c.substring(4).trim();

                if (arg === "") {
                    // Start full integrated editor overlay
                    import('./editor.js').then(({ EDITOR }) => {
                        EDITOR.open();
                    });
                } else {
                    const mEdit = arg.match(/^(\d+)/);
                    if (mEdit) {
                        const ln = parseInt(mEdit[1]);
                        const found = SYS.program.find(l => l.line === ln);
                        if (found) {
                            IO.prompt(); // Draw the prompt ']'

                            // Pre-fill buffer with the line number and source
                            IO.lineBuffer = `${found.line} ${found.src}`;
                            IO.lineCursor = IO.lineBuffer.length;

                            // Draw the text
                            IO.refreshLine();
                            return; // Return early so we don't draw a blank prompt
                        } else {
                            IO.print("?UNDEFINED LINE ERROR");
                        }
                    } else {
                        IO.print("?SYNTAX ERROR");
                    }
                    IO.prompt();
                }
            }
            else if (c === 'VIZ') {
                import('./viz.js').then(({ VIZ }) => {
                    VIZ.open(SYS.program);
                });
                IO.prompt();
            }
            else if (c === 'NEW') { SYS.program = []; SYS.resetEnvironment(); FS.currentFilename = null; SCREEN.clear(); IO.prompt(); }
            else if (c === 'COPY') {
                // 1. Convert program objects back to text format in current internal order
                const text = SYS.program.map(l => l.line !== null ? `${l.line} ${l.src}` : l.src).join("\n");

                // 2. Write to system clipboard with fallback
                const doLegacyCopy = (txt) => {
                    try {
                        const textArea = document.createElement("textarea");
                        textArea.value = txt;
                        textArea.style.top = "0";
                        textArea.style.left = "0";
                        textArea.style.position = "fixed";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        if (successful) IO.print("COPIED TO CLIPBOARD");
                        else IO.print("?CLIPBOARD FAILED");
                    } catch (err) {
                        IO.print("?CLIPBOARD ERROR: " + err);
                    }
                    IO.prompt();
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            IO.print("COPIED TO CLIPBOARD");
                            IO.prompt();
                        })
                        .catch(err => {
                            doLegacyCopy(text);
                        });
                } else {
                    doLegacyCopy(text);
                }
                return;
            }
            else if (c === 'VARS' || c.startsWith('VARS ') || c.startsWith('VARS"')) {
                let targetVar = cRaw.substring(4).trim();
                if (targetVar.startsWith('"') && targetVar.endsWith('"') && targetVar.length >= 2) {
                    targetVar = targetVar.substring(1, targetVar.length - 1).trim();
                }

                if (targetVar === "") {
                    const keys = Object.keys(SYS.vars).sort();
                    for (const k of keys) {
                        let val = SYS.vars[k];
                        let formatted = IO.format(val);
                        if (typeof val === 'string') formatted = `"${formatted}"`;
                        IO.print(`${k} = ${formatted}`);
                    }
                    const arrKeys = Object.keys(SYS.arrays).sort();
                    for (const k of arrKeys) {
                        let val = SYS.arrays[k];
                        IO.print(`${k}[] = ${IO.format(val)}`);
                    }
                } else {
                    let found = false;
                    if (SYS.vars.hasOwnProperty(targetVar)) {
                        let val = SYS.vars[targetVar];
                        let formatted = IO.format(val);
                        if (typeof val === 'string') formatted = `"${formatted}"`;
                        IO.print(`${targetVar} = ${formatted}`);
                        found = true;
                    }
                    if (SYS.arrays.hasOwnProperty(targetVar)) {
                        let val = SYS.arrays[targetVar];
                        IO.print(`${targetVar}[] = ${IO.format(val)}`);
                        found = true;
                    }
                    if (!found) {
                        IO.print(`?UNDEFINED VARIABLE ${targetVar}`);
                    }
                }
                IO.prompt();
            }
            else if (c === 'WHERE') {
                if (SYS.program && SYS.program[SYS.pc]) {
                    let srcLine = SYS.program[SYS.pc].line !== null ? ` IN ${SYS.program[SYS.pc].line}` : "";
                    let srcCode = `\n  ${SYS.program[SYS.pc].src}`;
                    IO.print(`BREAK${srcLine}${srcCode}`);
                } else if (SYS.lastExecLine) {
                    IO.print("BREAK IN " + SYS.lastExecLine);
                } else {
                    IO.print("?NO RUN DATA");
                }
                IO.prompt();
            }
            else if (c === 'JSPEEK') {
                ENGINE.generateOnly();
                const ov = document.getElementById('js-overlay');
                const ct = document.getElementById('js-content');
                ct.textContent = SYS.transpiledSource || "// NO PROGRAM LOADED";
                ov.style.display = 'flex';
                IO.prompt();
            }
            else if (c === 'PASTE') {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    navigator.clipboard.readText().then(text => {
                        if (!text) {
                            IO.print("?CLIPBOARD EMPTY");
                            IO.prompt();
                            return;
                        }

                        const lines = text.split(/\r?\n/);
                        const numberedLines = [];
                        const unnumberedLines = [];

                        // 1. Separate existing programmatic state from unnumbered
                        SYS.program.forEach(p => {
                            if (p.line !== null) numberedLines.push(p);
                            else unnumberedLines.push(p);
                        });

                        let addedCount = 0;

                        // 2. Process incoming clipboard buffer
                        for (let line of lines) {
                            line = line.trimRight();
                            if (!line) continue; // Skip totally blank lines to prevent bloat

                            const m = line.match(/^\s*(\d+)\s+(.*)/);
                            if (m) {
                                const ln = parseInt(m[1]);
                                const src = m[2];
                                
                                // Remove any existing line with this number (overwrite/delete)
                                const existingIdx = numberedLines.findIndex(l => l.line === ln);
                                if (existingIdx !== -1) {
                                    numberedLines.splice(existingIdx, 1);
                                }
                                
                                // Only push if there's actual source (e.g. "10" deletes line 10)
                                if (src.trim() !== "") {
                                    numberedLines.push({ line: ln, src: src });
                                    addedCount++;
                                }
                            } else {
                                // Assume it's an unnumbered line
                                unnumberedLines.push({ line: null, src: line });
                                addedCount++;
                            }
                        }

                        // 3. Update memory bank and normalize
                        SYS.normalizeProgram(numberedLines, unnumberedLines);
                        
                        IO.print(`${addedCount} LINES PASTED`);
                        IO.prompt();
                        
                        // Optionally trigger a re-compile if we are smart
                        import('./engine.js').then(({ ENGINE }) => ENGINE.generateOnly());
                        
                    }).catch(err => {
                        IO.print("?CLIPBOARD PERMISSION DENIED");
                        IO.prompt();
                    });
                } else {
                    IO.print("?CLIPBOARD API NOT SUPPORTED");
                    IO.prompt();
                }
            }
            else {
                try {
                    const func = Compiler.compile({ line: 0, src: cRaw });
                    SYS.running = true;
                    const res = func(SYS, IO, GRAPHICS, FS, ENGINE, SOUND);
                    if (res && res.then) {
                        res.then(() => {
                            SYS.running = false;
                            IO.prompt();
                        }).catch((e) => {
                            SYS.running = false;
                            IO.print("?RUNTIME ERROR"); // Catch async errors
                            IO.prompt();
                        });
                    } else {
                        SYS.running = false;
                        IO.prompt();
                    }
                }
                catch (e) {
                    SYS.running = false;
                    let errStr = e.toString() === "SYNTAX" ? `SYNTAX ERROR` : e.toString();
                    IO.print(`\n?${errStr}\n  ${cRaw}`);
                    IO.prompt();
                }
            }
        }
    },

    // --- REPL Input Management ---
    prompt: () => {
        IO.cursorVisible = true;
        IO.print("]", false);
        // Save where the input area starts
        IO.promptStartX = SCREEN.cx;
        IO.promptStartY = SCREEN.cy;
        // Check for wrapping prompt
        if (IO.promptStartY >= CONFIG.rows) {
            IO.promptStartY = CONFIG.rows - 1;
        }
        IO.lineBuffer = "";
        IO.lineCursor = 0;
        IO.viewScroll = 0; // Reset scroll
        IO.historyIdx = IO.history.length;
        SCREEN.drawCursor();
    },

    refreshLine: () => {
        // 1. Calculate available width on the current line
        //    (from prompt start to end of screen width)
        const availableWidth = CONFIG.cols - IO.promptStartX;

        // 2. Adjust View Scroll based on Cursor
        //    Ensure cursor is visible within [viewScroll, viewScroll + availableWidth)
        //    Leave 1 char padding at right if possible, or just exact fit
        if (IO.lineCursor < IO.viewScroll) {
            IO.viewScroll = IO.lineCursor;
        } else if (IO.lineCursor >= IO.viewScroll + availableWidth) {
            IO.viewScroll = IO.lineCursor - availableWidth + 1;
        }

        // 3. Determine visible text
        const visibleText = IO.lineBuffer.substring(IO.viewScroll, IO.viewScroll + availableWidth);

        // 4. Move to prompt start
        SCREEN.removeCursor();
        SCREEN.cx = IO.promptStartX;
        SCREEN.cy = IO.promptStartY;

        // 5. Draw visible text
        SCREEN.put(visibleText);

        // 6. Clear remaining space on the line if text is shorter than width
        const usedWidth = visibleText.length;
        if (usedWidth < availableWidth) {
            const clearLen = availableWidth - usedWidth;
            // Don't use put() for clearing if it wraps, manually clear or use put with spaces
            // put() wraps if it hits edge.
            // If we are at edge, put() might wrap.
            // Better: Fill with spaces up to availableWidth
            SCREEN.put(" ".repeat(clearLen));
        }

        // 7. Position Cursor visually
        //    Visual X = promptStartX + (logicalCursor - viewScroll)
        const visualCursorX = IO.promptStartX + (IO.lineCursor - IO.viewScroll);
        SCREEN.moveTo(visualCursorX, IO.promptStartY);
    }
};
