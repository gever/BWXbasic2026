import { CodeJar } from './vendor/codejar.js';
import { Tokenizer, SYNTAX } from './parser.js';
import { SYS } from './system.js';
import { IO } from './io.js';

export const EDITOR = {
    jar: null,
    overlay: null,
    saveBtn: null,
    active: false,

    init: () => {
        EDITOR.overlay = document.getElementById('editor-overlay');
        const editorDiv = document.getElementById('editor-content');
        EDITOR.saveBtn = document.getElementById('editor-save');

        EDITOR.saveBtn.addEventListener('click', EDITOR.close);

        const highlightAdapter = (editorContentContext) => {
            const rawCode = editorContentContext.textContent;

            // Re-render highlight payload
            const lines = rawCode.split('\n');
            let resultHTML = "";

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const scanned = Tokenizer.scan(line);
                let isComment = false;

                for (let item of scanned) {
                    if (item.type === 'SPACE') {
                        // Spaces are preserved in pre format
                        resultHTML += item.val;
                    } else {
                        let color = isComment ? SYNTAX.colors.COMMENT : SYNTAX.classify(item.val);

                        if (!isComment) {
                            const tu = item.val.toUpperCase();
                            if (tu === 'REM' || item.val === "'") {
                                isComment = true;
                                color = SYNTAX.colors.COMMENT;
                            }
                        }

                        // Escape HTML to prevent injection visual glitches
                        const escapedVal = item.val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        resultHTML += `<span style="color: ${color}">${escapedVal}</span>`;
                    }
                }
                if (i < lines.length - 1) resultHTML += "\n";
            }
            if (rawCode === "" || rawCode.endsWith('\n')) {
                resultHTML += "<br>";
            }
            editorContentContext.innerHTML = resultHTML;
        };

        EDITOR.jar = CodeJar(editorDiv, highlightAdapter, {
            tab: '  ',
            addClosing: false
        });
    },

    open: () => {
        EDITOR.active = true;

        // 1. Serialize SYS.program exactly identical to FS.download()
        const textSrc = SYS.program.map(l => l.line !== null ? `${l.line} ${l.src}` : l.src).join("\n");

        // 2. Push text to jar
        EDITOR.jar.updateCode(textSrc);

        // 3. Show overlay
        EDITOR.overlay.style.display = 'flex';

        // 4. Clear REPL buffer and trap focus
        IO.lineBuffer = "";
        IO.lineCursor = 0;
        setTimeout(() => {
            document.getElementById('editor-content').focus();
        }, 10);
    },

    close: () => {
        EDITOR.active = false;
        EDITOR.overlay.style.display = 'none';

        const updatedCode = EDITOR.jar.toString();
        const lines = updatedCode.split(/\r?\n/);

        // 1. Wipe current program
        SYS.program = [];
        SYS.labels = {};

        // 2. Re-parse code identically to FS.load() behavior
        for (let line of lines) {
            line = line.trimRight();

            // Match optional line numbers explicitly
            const m = line.match(/^\s*(\d+)\s+(.*)/);
            if (m) {
                SYS.program.push({ line: parseInt(m[1]), src: m[2] });
            } else {
                SYS.program.push({ line: null, src: line });
            }
        }

        IO.print("\nREADY.");
        IO.prompt();
    }
};
