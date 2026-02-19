import { LIB } from './library.js';
import { Tokenizer } from './parser.js';
import { SYS } from './system.js';

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

export const Compiler = {
    genExpression: (tokens, ctx) => {
        const peek = () => tokens[ctx.idx], next = () => tokens[ctx.idx++];
        const parseExp = () => { let l = parseTerm(); while (ctx.idx < tokens.length && (peek() === '+' || peek() === '-')) l = `(${l} ${next()} ${parseTerm()})`; if (ctx.idx < tokens.length && ['=', '<', '>', '<=', '>=', '<>'].includes(peek())) { let op = next(), jop = op === '=' ? '===' : op === '<>' ? '!==' : op; l = `(${l} ${jop} ${parseExp()}?1:0)`; } return l; };
        const parseTerm = () => { let l = parsePower(); while (ctx.idx < tokens.length && (peek() === '*' || peek() === '/')) l = `(${l} ${next()} ${parsePower()})`; return l; };
        const parsePower = () => {
            let l = parseFactor();
            while (ctx.idx < tokens.length && peek() === '^') {
                next(); // consume ^
                // TODO: Fix operator precedence for power operator vs unary minus (currently -2^2=4, should be -4)
                l = `Math.pow(${l}, ${parseFactor()})`;
            }
            return l;
        };
        const parseFactor = () => {
            const t = next();
            if (!t) return "0";
            if (!isNaN(t) || t.startsWith('"')) return t;
            if (t === '(') { const e = parseExp(); next(); return `(${e})`; }
            if (t === '-') return `-${parseFactor()}`;
            if (t === '+') return parseFactor();

            if (/^[a-zA-Z]/.test(t)) {
                // Normalize token for Keyword/Function checks
                const tu = t.toUpperCase();

                // Handle INKEY$ and INKEY
                if (tu === 'INKEY$' || tu === 'INKEY') {
                    ctx.setAsync();
                    next(); // consume '('
                    const mode = parseExp();
                    next(); // consume ')'
                    return `(await IO.inkey(${mode}))`;
                }

                if (tu === 'TIME') {
                    return "performance.now()";
                }

                // Handle Math Functions (SIN, LEN, etc)
                if (LIB[tu]) {
                    next(); const a = [];
                    if (peek() !== ')') do { a.push(parseExp()); if (peek() === ',') next(); else break; } while (true);
                    next(); return `(${LIB[tu]})(${a.join(',')})`;
                }

                // Handle Array Access (Use raw 't' to preserve case)
                if (peek() === '(') { next(); const i = parseExp(); next(); return `SYS.getArray('${t}',${i})`; }

                // Handle Variables (Use raw 't' to preserve case)
                return `(SYS.vars['${t}']!==undefined?SYS.vars['${t}']:0)`;
            }
            return "0";
        };
        return parseExp();
    },
    compile: (lineObj) => {
        // CHANGE: Do NOT uppercase the source string here.
        const tokens = Tokenizer.tokenize(lineObj.src);

        let async = false;
        const ctx = { idx: 0, jsLoops: [], setAsync: () => async = true };

        // Helper to check next token case-insensitively without consuming it
        const peekUpper = () => (tokens[ctx.idx] || "").toUpperCase();

        const peek = () => tokens[ctx.idx], next = () => tokens[ctx.idx++], remain = () => tokens.slice(ctx.idx);
        let body = "";

        while (ctx.idx < tokens.length) {
            const cmdRaw = next();
            if (cmdRaw === ':') continue; if (cmdRaw.toUpperCase() === 'REM' || cmdRaw === "'") break;

            // Normalize command to uppercase for switching
            const cmd = cmdRaw.toUpperCase();
            let chunk = "";

            if (cmd === 'PRINT') {
                let nl = true;
                const p = [];

                // PRINT statements are complicated by ';' and ',' separators...
                while (ctx.idx < tokens.length) {
                    // Stop if we hit a command separator
                    if ([':', "'", 'THEN', 'ELSE'].includes(peekUpper())) break;

                    // 1. Handle leading or consecutive separators
                    //    (e.g., PRINT ,, X  or  PRINT X,,)
                    if (peek() === ';' || peek() === ',') {
                        // If comma, push a space string literal into the output list
                        if (peek() === ',') p.push('" "');
                        nl = false;
                        next();
                        continue;
                    }

                    // 2. Parse the Expression
                    p.push(`IO.format(${Compiler.genExpression(tokens, ctx)})`);
                    nl = true;

                    // 3. Handle trailing separator immediately after expression
                    //    (e.g., PRINT X, )
                    if (peek() === ';' || peek() === ',') {
                        // If comma, push a space string literal
                        if (peek() === ',') p.push('" "');
                        nl = false;
                        next();
                    }
                }

                // Join all parts (expressions + spaces) and print
                chunk = `IO.print(${p.length ? p.join(' + "" + ') : '""'}, ${nl});`;
                if (nl) {
                    async = true;
                    chunk += ` await new Promise(r => setTimeout(r, 0));`;
                }
                chunk += ` if(SYS.break){SYS.running=false;return;}`;
            }
            else if (cmd === 'GOTO') {
                const tgt = Compiler.genExpression(tokens, ctx);
                // Fix: Added { ... SYS.running=false; } to the else block
                chunk = `var _t=${tgt};if(SYS.labels[_t]!==undefined)SYS.pc=SYS.labels[_t]-1; else { IO.print("?UNDEF LINE "+_t); SYS.running=false; }`;
            }
            else if (cmd === 'GOSUB') {
                const tgt = Compiler.genExpression(tokens, ctx);
                // Fix: Added { ... SYS.running=false; } to the else block
                chunk = `var _t=${tgt};if(SYS.labels[_t]!==undefined){SYS.stack.push(SYS.pc);SYS.pc=SYS.labels[_t]-1;} else { IO.print("?UNDEF LINE "+_t); SYS.running=false; }`;
            }
            else if (cmd === 'RETURN') {
                // Fix: Added { ... SYS.running=false; } to the else block
                chunk = `if(SYS.stack.length>0)SYS.pc=SYS.stack.pop(); else { IO.print("?RETURN WITHOUT GOSUB"); SYS.running=false; }`;
            }
            else if (cmd === 'IF') {
                const cond = Compiler.genExpression(tokens, ctx);
                // Case-insensitive 'THEN'
                if (next().toUpperCase() !== 'THEN') throw "SYNTAX";

                // Scan for ELSE, respecting nesting
                let elseIdx = -1;
                let depth = 0;
                for (let i = ctx.idx; i < tokens.length; i++) {
                    const t = tokens[i].toUpperCase();
                    if (t === 'IF') {
                        depth++;
                    } else if (t === 'ELSE') {
                        if (depth === 0) {
                            elseIdx = i;
                            break;
                        }
                    } else if (t === 'ELSE' && depth > 0) {
                        depth--; // This ELSE belongs to a nested IF
                    }
                }

                let matchThen, matchElse;

                if (elseIdx !== -1) {
                    // Split tokens into THEN and ELSE parts
                    matchThen = tokens.slice(ctx.idx, elseIdx);
                    matchElse = tokens.slice(elseIdx + 1);
                    // Consume all tokens
                    ctx.idx = tokens.length;
                } else {
                    matchThen = tokens.slice(ctx.idx);
                    matchElse = null;
                    ctx.idx = tokens.length;
                }

                const compileBranch = (branchTokens) => {
                    if (!branchTokens || branchTokens.length === 0) return "";
                    // Check for single line number (GOTO shorthand)
                    if (branchTokens.length === 1 && !isNaN(branchTokens[0])) {
                        return `if(SYS.labels[${Number(branchTokens[0])}]!==undefined)SYS.pc=SYS.labels[${Number(branchTokens[0])}]-1; else { IO.print("?UNDEF LINE ${branchTokens[0]}"); SYS.running=false; }`;
                    }
                    // Compile as sub-program
                    const src = branchTokens.join(" "); // Reconstruct source
                    // We need to use recursion but safely.
                    // The issue is 'tokens' in Compiler.compile is local.
                    // We can use a recursive helper or just call Compiler.compile again with a fake object.
                    const sid = "SUB_" + Math.random().toString(36).substr(2, 9);
                    SYS[sid] = Compiler.compile({ line: lineObj.line, src: src });
                    return `return SYS['${sid}'](SYS,IO,GRAPHICS,FS);`;
                };

                const tb = compileBranch(matchThen);
                const eb = matchElse ? compileBranch(matchElse) : "";

                chunk = `if(${cond}){${tb}} ${eb ? `else {${eb}}` : ""}`;
            }
            else if (cmd === 'FOR') {
                const v = next(); // Variable name (keep case)
                next(); // '='
                const s = Compiler.genExpression(tokens, ctx);
                next(); // 'TO' (ignored, but we blindly consume it)
                const e = Compiler.genExpression(tokens, ctx);
                let st = "1"; if (peekUpper() === 'STEP') { next(); st = Compiler.genExpression(tokens, ctx); }

                let isSingle = false;
                // Case-insensitive lookahead for NEXT
                for (let k = ctx.idx; k < tokens.length; k++) { if (tokens[k].toUpperCase() === 'NEXT' && tokens[k + 1] === v) { isSingle = true; break; } }

                if (isSingle) {
                    chunk = `{ const _st=${st}; for(SYS.vars['${v}']=${s}; (_st>=0?SYS.vars['${v}']<=${e}:SYS.vars['${v}']>=${e}); SYS.vars['${v}']+=_st) {`;
                    ctx.jsLoops.push(v);
                } else {
                    chunk = `SYS.vars['${v}']=${s};SYS.forStack['${v}']={target:${e},step:${st},pc:SYS.pc};`;
                }
            }
            else if (cmd === 'NEXT') {
                const v = next(); // Variable name (keep case)
                if (ctx.jsLoops.length > 0 && ctx.jsLoops[ctx.jsLoops.length - 1] === v) {
                    chunk = `}}`; ctx.jsLoops.pop();
                } else {
                    chunk = `var l=SYS.forStack['${v}'];if(l){SYS.vars['${v}']+=l.step;if((l.step>=0&&SYS.vars['${v}']<=l.target)||(l.step<0&&SYS.vars['${v}']>=l.target))SYS.pc=l.pc;else delete SYS.forStack['${v}'];}`;
                }
            }
            else if (cmd === 'DIM') { const v = next(); next(); const sz = Compiler.genExpression(tokens, ctx); next(); chunk = `SYS.arrays['${v}']=new Array(${sz}+1).fill(0);`; }
            else if (cmd === 'INPUT') { async = true; let p = "?"; if (peek().startsWith('"')) { p = next().replace(/"/g, ''); if (peek() === ';') next(); } const v = next(), str = v.endsWith('$'); chunk = `IO.print("${p}",false);var val=await IO.input();SYS.vars['${v}']=${str ? 'val' : 'parseFloat(val)'};`; }

            else if (cmd === 'GR_PRINT') {
                const p = [];
                // Support standard print arguments (expressions, semicolons, commas)
                while (ctx.idx < tokens.length) {
                    if ([':', "'", 'THEN', 'ELSE'].includes(peekUpper())) break;

                    if (peek() === ';' || peek() === ',') {
                        // Treat comma as space for GR_PRINT for simplicity, or just ignore logic for tabs
                        if (peek() === ',') p.push('" "');
                        next();
                        continue;
                    }

                    p.push(`IO.format(${Compiler.genExpression(tokens, ctx)})`);

                    if (peek() === ';' || peek() === ',') {
                        if (peek() === ',') p.push('" "');
                        next();
                    }
                }
                chunk = `GRAPHICS.print(${p.length ? p.join(' + "" + ') : '""'});`;
            }

            else if (cmd === 'HGR' || cmd === 'HGR2' || cmd === 'TEXT') chunk = `GRAPHICS.setMode(1);`;
            else if (cmd === 'HCOLOR') {
                if (peek() === '=') next();
                chunk = `GRAPHICS.setLegacyColor(${Compiler.genExpression(tokens, ctx)});`;
            }
            else if (cmd === 'HPLOT') {
                let sc = "", sl = false;
                if (peekUpper() === 'TO') { next(); sl = true; }
                else {
                    const x = Compiler.genExpression(tokens, ctx);
                    if (peek() === ',') next();
                    sc = `GRAPHICS.plot(${x},${Compiler.genExpression(tokens, ctx)});`;
                }
                let lc = "";
                while (peekUpper() === 'TO') {
                    next(); const x = Compiler.genExpression(tokens, ctx);
                    if (peek() === ',') next();
                    lc += `GRAPHICS.lineTo(${x},${Compiler.genExpression(tokens, ctx)});`;
                }
                chunk = (sl ? "" : sc) + lc;
            }

            // --- NEW STATEFUL GRAPHICS API ---
            else if (cmd === 'GR_CLEAR' || cmd === 'GR_CLS') chunk = `GRAPHICS.clearToColor();`;
            else if (cmd === 'GR_COLOR') {
                if (peek() === '=') next();
                chunk = `GRAPHICS.setPaletteColor(${Compiler.genExpression(tokens, ctx)});`;
            }
            else if (cmd === 'GR_MOVETO') {
                const x = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                chunk = `GRAPHICS.moveTo(${x},${Compiler.genExpression(tokens, ctx)});`;
            }
            else if (cmd === 'GR_LINETO') {
                const x = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                chunk = `GRAPHICS.lineTo(${x},${Compiler.genExpression(tokens, ctx)});`;
            }
            else if (cmd === 'GR_RECT' || cmd === 'GR_FRECT') {
                const filled = cmd === 'GR_FRECT';
                const w = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                chunk = `GRAPHICS.rect(${w},${Compiler.genExpression(tokens, ctx)},${filled});`;
            }
            else if (cmd === 'GR_ELLIPSE' || cmd === 'GR_FELLIPSE') {
                const filled = cmd === 'GR_FELLIPSE';
                const w = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                chunk = `GRAPHICS.ellipse(${w},${Compiler.genExpression(tokens, ctx)},${filled});`;
            }
            else if (cmd === 'GR_TRI' || cmd === 'GR_FTRI') {
                const filled = cmd === 'GR_FTRI';
                const x2 = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                const y2 = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                const x3 = Compiler.genExpression(tokens, ctx);
                if (peek() === ',') next();
                chunk = `GRAPHICS.triangle(${x2},${y2},${x3},${Compiler.genExpression(tokens, ctx)},${filled});`;
            }
            else if (cmd === 'GR_FONT') {
                chunk = `GRAPHICS.fontSize = ${Compiler.genExpression(tokens, ctx)};`;
            }


            else if (cmd === 'SEED') {
                if (peek() === '(') {
                    next();
                    const val = Compiler.genExpression(tokens, ctx);
                    if (peek() === ')') next();
                    chunk = `SYS.setSeed(${val});`;
                } else {
                    chunk = `IO.print("?SYNTAX ERROR"); SYS.running=false;`;
                }
            }

            else if (cmd === 'LET' || (cmd && peek() === '=') || (cmd && peek() === '(')) {
                let v = cmdRaw; // Use raw for variable name
                if (cmd === 'LET') v = next();
                if (peek() === '(') {
                    next(); const i = Compiler.genExpression(tokens, ctx); next(); next();
                    chunk = `SYS.setArray('${v}',${i},${Compiler.genExpression(tokens, ctx)});`;
                } else {
                    next();
                    chunk = `SYS.vars['${v}']=${Compiler.genExpression(tokens, ctx)};`;
                }
            }

            else if (cmd === 'HTAB') chunk = `IO.htab(${Compiler.genExpression(tokens, ctx)});`;
            else if (cmd === 'VTAB') chunk = `IO.vtab(${Compiler.genExpression(tokens, ctx)});`;
            else if (cmd === 'SETPOS') { const x = Compiler.genExpression(tokens, ctx); next(); const y = Compiler.genExpression(tokens, ctx); chunk = `IO.setPos(${x},${y});`; }
            else if (cmd === 'HOME' || cmd === 'CLS') chunk = "IO.home();";

            else if (cmd === 'END') chunk = "SYS.running=false;";
            else if (cmd === 'DELAY') { async = true; chunk = `await new Promise(r=>setTimeout(r,${Compiler.genExpression(tokens, ctx)}));`; }
            else if (cmd === 'SAVE') chunk = `FS.save(${Compiler.genExpression(tokens, ctx)});`;
            else if (cmd === 'LOAD') { async = true; chunk = `await FS.load(${Compiler.genExpression(tokens, ctx)});`; }
            else if (cmd === 'DIR' || cmd === 'CATALOG') chunk = `FS.dir();`;
            else if (cmd === 'DOWNLOAD') chunk = `FS.download(${Compiler.genExpression(tokens, ctx)});`;
            else if (cmd === 'JSECHO') chunk = `IO.jsEcho = !IO.jsEcho; IO.print("JSECHO " + (IO.jsEcho ? "ON" : "OFF"));`;
            else if (cmd === 'HELP') chunk = `IO.help();`;
            else if (['LIST', 'RUN', 'EDIT', 'NEW', 'COPY', 'VARS', 'WHERE', 'JSPEEK'].includes(cmd)) {
                chunk = `IO.print("?ILLEGAL COMMAND IN LINE ${lineObj.line}"); SYS.running=false;`;
            }
            else chunk = `IO.print("?SYNTAX ERROR"); SYS.running=false;`;

            body += chunk + "\n";
        }

        try {
            const f = new (async ? AsyncFunction : Function)("SYS", "IO", "GRAPHICS", "FS", body);
            // NEW: Attach the generated text to the function so JSPEEK can read it
            f.generatedBody = body;
            return f;
        } catch (e) {
            return () => { IO.print(`?COMPILE ERROR ${lineObj.line}`); SYS.running = false; };
        }
    }
};
