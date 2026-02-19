import { SYS } from './system.js';
import { IO } from './io.js';
import { SCREEN } from './screen.js';
import { DEMOS } from './demos.js';

export const FS = {
    PREFIX: 'bwxBASIC_PROG_',
    currentFilename: "bwxBASIC_program.bas",

    save: (fn) => {
        try {
            localStorage.setItem(FS.PREFIX + fn.toUpperCase(), JSON.stringify(SYS.program));
            FS.currentFilename = fn;
            IO.print("SAVED " + fn);
        } catch (e) { IO.print("?ERROR SAVING"); }
    },

    load: async (fn) => {
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
                        prog.push({ line: parseInt(m[1]), src: m[2] });
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
        SYS.program.sort((a, b) => a.line - b.line);
        const t = SYS.program.map(l => `${l.line} ${l.src}`).join("\n");
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
    }
};
