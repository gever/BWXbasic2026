import { CONFIG } from './config.js';
import { SYS } from './system.js';
import { SCREEN } from './screen.js';
import { GRAPHICS } from './graphics.js';
import { IO } from './io.js';
import { EDITOR } from './editor.js';

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const inputTrap = document.getElementById('input-trap');
const breakBtn = document.getElementById('break-btn');

IO.init(inputTrap);
EDITOR.init();

document.addEventListener('click', (e) => {
    if (e.target.id === 'help-search') return;
    if (EDITOR.active || e.target.closest('#editor-overlay')) return;
    inputTrap.focus();
});
breakBtn.onclick = (e) => {
    e.preventDefault();
    if (SYS.running) {
        SYS.break = true;
        if (IO.waiter) { IO.waiter(""); IO.waiter = null; }
        if (SYS.inputCallback) { SYS.inputCallback(""); SYS.inputCallback = null; }
    }
    inputTrap.focus();
};

window.onkeydown = (e) => {
    // Allow default key behavior if typing in the help search box or the editor is active
    if (EDITOR.active) return;

    // 0. Close Overlays (ESC)
    if (e.key === 'Escape') {
        const helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay && helpOverlay.style.display === 'flex') {
            helpOverlay.style.display = 'none';
            document.getElementById('input-trap').focus();
            return;
        }
        const vizOverlay = document.getElementById('viz-overlay');
        if (vizOverlay && vizOverlay.style.display === 'flex') {
            const vizBtn = document.getElementById('viz-close-btn');
            if (vizBtn) vizBtn.click();
            return;
        }
    }

    if (e.target && e.target.id === 'help-search') return;
    // 1. Handle Break (ESC)
    if (e.key === 'Escape' && SYS.running) {
        SYS.break = true;
        if (IO.waiter) { IO.waiter(""); IO.waiter = null; }
        if (SYS.inputCallback) { SYS.inputCallback(""); SYS.inputCallback = null; }
        return;
    }

    // 2. Handle Runtime Keys (INKEY$ or INPUT)
    if (SYS.running) {
        // CASE A: Program is running normally or waiting for INKEY$
        if (!SYS.inputCallback) {
            IO.bufferKey(e.key);
            if (e.key === 'Backspace') e.preventDefault();
        }
        // CASE B: Program is waiting for INPUT command
        else {
            e.preventDefault(); // Take control of the input

            if (e.key === 'Enter') {
                SCREEN.newline();
                const val = inputTrap.value; // Grab the accumulated text
                const cb = SYS.inputCallback;
                SYS.inputCallback = null;
                cb(val); // Send text back to the interpreter
            }
            else if (e.key === 'Backspace') {
                if (inputTrap.value.length > 0) {
                    // Remove last char from buffer
                    inputTrap.value = inputTrap.value.slice(0, -1);

                    // Visual Backspace: Move cursor back and clear cell
                    SCREEN.removeCursor();
                    if (SCREEN.cx > 0) SCREEN.cx--;
                    else if (SCREEN.cy > 0) { SCREEN.cy--; SCREEN.cx = CONFIG.cols - 1; }

                    // Erase the character visually
                    ctx.fillStyle = CONFIG.bgColor;
                    ctx.fillRect(SCREEN.cx * CONFIG.charW, SCREEN.cy * CONFIG.charH, CONFIG.charW, CONFIG.charH);
                    SCREEN.drawCursor();
                }
            }
            else if (e.key.length === 1) {
                // Add to buffer and screen
                inputTrap.value += e.key;
                SCREEN.put(e.key);
            }
        }
        return;
    }

    // 3. Handle Prompt Editing (When NOT running)
    // Use e.key to manage buffer manually

    if (e.ctrlKey || e.metaKey) return; // Allow Copy/Paste shortcuts

    e.preventDefault(); // Stop hidden input from doubling chars

    if (e.key === 'Enter') {
        SCREEN.newline();
        IO.handleCommand(IO.lineBuffer);
    }
    else if (e.key === 'Backspace') {
        if (IO.lineCursor > 0) {
            IO.lineBuffer = IO.lineBuffer.slice(0, IO.lineCursor - 1) + IO.lineBuffer.slice(IO.lineCursor);
            IO.lineCursor--;
            IO.refreshLine();
        }
    }
    else if (e.key === 'Delete') {
        if (IO.lineCursor < IO.lineBuffer.length) {
            IO.lineBuffer = IO.lineBuffer.slice(0, IO.lineCursor) + IO.lineBuffer.slice(IO.lineCursor + 1);
            IO.refreshLine();
        }
    }
    else if (e.key === 'ArrowLeft') {
        if (IO.lineCursor > 0) {
            IO.lineCursor--;
            IO.refreshLine();
        }
    }
    else if (e.key === 'ArrowRight') {
        if (IO.lineCursor < IO.lineBuffer.length) {
            IO.lineCursor++;
            IO.refreshLine();
        }
    }
    else if (e.key === 'ArrowUp') {
        if (IO.history.length > 0 && IO.historyIdx > 0) {
            IO.historyIdx--;
            IO.lineBuffer = IO.history[IO.historyIdx];
            IO.lineCursor = IO.lineBuffer.length;
            IO.refreshLine();
        }
    }
    else if (e.key === 'ArrowDown') {
        if (IO.historyIdx < IO.history.length - 1) {
            IO.historyIdx++;
            IO.lineBuffer = IO.history[IO.historyIdx];
            IO.lineCursor = IO.lineBuffer.length;
            IO.refreshLine();
        } else {
            // Clear line if going past history
            IO.historyIdx = IO.history.length;
            IO.lineBuffer = "";
            IO.lineCursor = 0;
            IO.refreshLine();
        }
    }
    else if (e.key.length === 1) {
        // Printable characters
        const textBefore = IO.lineBuffer.slice(0, IO.lineCursor);
        // Count quotes before cursor to see if we are inside a string
        const quoteCount = (textBefore.match(/"/g) || []).length;
        // If even quotes, we are outside a string -> Force Uppercase
        const char = (quoteCount % 2 === 0) ? e.key.toUpperCase() : e.key;

        IO.lineBuffer = textBefore + char + IO.lineBuffer.slice(IO.lineCursor);
        IO.lineCursor++;
        IO.refreshLine();
    }
};

inputTrap.oninput = null;

// --- Paste Support ---
inputTrap.addEventListener('paste', (e) => {
    e.preventDefault();
    // Get pasted data via clipboard API
    const text = (e.clipboardData || window.clipboardData).getData('text');

    // Split into lines, filtering out empty ones
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim() !== "");

    // Process each line sequentially
    const processLine = async (index) => {
        if (index >= lines.length) return;

        const line = lines[index];

        // Echo the line to the screen
        IO.print(line);

        // If it looks like a line number + code, handle it as a command
        // If it is a direct command (RUN, LIST), handle it immediately
        if (SYS.inputCallback) {
            // If we are stuck at an INPUT prompt, feed it the data
            const cb = SYS.inputCallback;
            SYS.inputCallback = null;
            cb(line);
        } else {
            // Standard command processing
            IO.handleCommand(line);
        }

        // Small delay to prevent freezing UI on large pastes
        setTimeout(() => processLine(index + 1), 10);
    };

    processLine(0);
});

// Init
document.fonts.load(CONFIG.font).then(() => {
    GRAPHICS.init(ctx);
    SCREEN.init(canvas, ctx);
    IO.print("bwxBASIC -- v0.8");
    IO.print("type HELP for manual");
    IO.prompt();
});
