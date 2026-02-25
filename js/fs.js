import { SYS } from './system.js';
import { IO } from './io.js';
import { SCREEN } from './screen.js';
import { DEMOS } from './demos.js';

export const FS = {
    PREFIX: 'bwxBASIC_PROG_',
    currentFilename: "bwxBASIC_program.bas",

    save: (fn, quiet = false) => {
        if (!fn || fn === 0 || fn === "0") fn = FS.currentFilename;
        if (!fn) { if (!quiet) IO.print("?MISSING FILE NAME"); return; }
        try {
            localStorage.setItem(FS.PREFIX + fn.toUpperCase(), JSON.stringify(SYS.program));
            if (!quiet) {
                FS.currentFilename = fn;
                IO.print("SAVED " + fn);
            }
        } catch (e) { if (!quiet) IO.print("?ERROR SAVING"); }
    },

    load: async (fn) => {
        if (!fn || fn === 0 || fn === "0") fn = FS.currentFilename;
        if (!fn) { IO.print("?MISSING FILE NAME"); return; }
        const f = fn.toUpperCase();
        let path = DEMOS[f];

        if (!path && (f.startsWith("/") || f.includes("/"))) {
            path = fn;
        }

        if (path) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error("404");
                const text = await response.text();

                const lines = text.split(/\r\n|\n|\r/);
                const prog = [];
                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;
                    const m = line.match(/^(\d+)\s+(.*)/);
                    if (m) {
                        const ln = parseInt(m[1]);
                        prog.push({ line: ln, src: m[2] });
                    } else {
                        // Un-numbered line
                        prog.push({ line: null, src: line });
                    }
                }

                SYS.program = prog;
                SYS.vars = {}; SYS.arrays = {};
                FS.currentFilename = fn;
                SCREEN.clear();
                IO.print("LOADED");
                return;
            } catch (e) { }
        }

        const d = localStorage.getItem(FS.PREFIX + f);
        if (d) {
            SYS.program = JSON.parse(d);
            SYS.vars = {};
            SYS.arrays = {};
            FS.currentFilename = fn;
            SCREEN.clear();
            IO.print("LOADED");
        }
        else IO.print("?FILE NOT FOUND");
    },

    dir: () => {
        IO.print("CATALOG");
        IO.print(" DEMO/"); for (let k in DEMOS) IO.print("  " + k);
        IO.print(" -----"); for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(FS.PREFIX)) IO.print("  " + k.replace(FS.PREFIX, '')); }
    },

    download: (fn) => {
        let t = "";
        SYS.program.forEach(l => {
            if (l.line !== null) t += `${l.line} ${l.src}\n`;
            else t += `${l.src}\n`;
        });
        const b = new Blob([t], { type: 'text/plain' });
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;

        let name = fn || FS.currentFilename;
        const parts = name.split(/[/\\]/);
        name = parts[parts.length - 1];

        if (!name.toUpperCase().endsWith(".BAS")) {
            name += ".BAS";
        }

        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    upload: () => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.bas,.txt,text/plain';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) { resolve(); return; }
                const reader = new FileReader();
                reader.onload = (re) => {
                    const text = re.target.result;
                    SYS.program = [];
                    FS.currentFilename = file.name;
                    text.split(/\r?\n/).forEach(line => {
                        line = line.replace(/\r/g, "");
                        if (line.trim().length > 0) {
                            const m = line.match(/^(\d+)\s+(.*)/);
                            if (m) {
                                SYS.program.push({ line: parseInt(m[1]), src: m[2] });
                            } else {
                                SYS.program.push({ line: null, src: line });
                            }
                        }
                    });
                    IO.print(`Uploaded ${file.name}`);
                    import('./engine.js').then(({ ENGINE }) => {
                        ENGINE.generateOnly();
                        resolve();
                    });
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }
};
