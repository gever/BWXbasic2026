import { CONFIG } from './config.js';
import { IO } from './io.js';

let canvas = null;
let ctx = null;

export const SCREEN = {
    cx: 0, cy: 0,
    isCursorDrawn: false,

    init: (appCanvas, appCtx) => {
        canvas = appCanvas;
        ctx = appCtx;
        ctx.font = CONFIG.font;
        ctx.textBaseline = 'top';

        const metrics = ctx.measureText("M");
        CONFIG.charW = Math.ceil(metrics.width);
        CONFIG.charH = 26;

        CONFIG.cols = Math.floor(CONFIG.width / CONFIG.charW);
        CONFIG.rows = Math.floor(CONFIG.height / CONFIG.charH);

        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        SCREEN.drawCursor();
    },

    clear: () => {
        SCREEN.removeCursor();
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        SCREEN.cx = 0; SCREEN.cy = 0;
        SCREEN.drawCursor();
    },

    scroll: () => {
        SCREEN.removeCursor();
        ctx.drawImage(canvas,
            0, CONFIG.charH, CONFIG.width, CONFIG.height - CONFIG.charH,
            0, 0, CONFIG.width, CONFIG.height - CONFIG.charH
        );
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, CONFIG.height - CONFIG.charH, CONFIG.width, CONFIG.charH);
        SCREEN.drawCursor();
    },

    newline: () => {
        SCREEN.removeCursor();
        SCREEN.cx = 0; SCREEN.cy++;
        if (SCREEN.cy >= CONFIG.rows) { SCREEN.cy = CONFIG.rows - 1; SCREEN.scroll(); }
        else SCREEN.drawCursor();
    },

    moveTo: (x, y) => {
        SCREEN.removeCursor();
        SCREEN.cx = x; SCREEN.cy = y;
        while (SCREEN.cx >= CONFIG.cols) { SCREEN.cx -= CONFIG.cols; SCREEN.cy++; }
        if (SCREEN.cy >= CONFIG.rows) { SCREEN.cy = CONFIG.rows - 1; SCREEN.scroll(); }
        SCREEN.drawCursor();
    },

    put: (str, color) => {
        SCREEN.removeCursor();
        ctx.font = CONFIG.font;

        for (let char of str) {
            if (char === '\n') {
                SCREEN.newline();
            } else {
                if (SCREEN.cx >= CONFIG.cols) {
                    SCREEN.cx = 0; SCREEN.cy++;
                    if (SCREEN.cy >= CONFIG.rows) {
                        SCREEN.cy = CONFIG.rows - 1;
                        SCREEN.scroll();
                    }
                }

                ctx.fillStyle = CONFIG.bgColor;
                ctx.fillRect(SCREEN.cx * CONFIG.charW, SCREEN.cy * CONFIG.charH, CONFIG.charW, CONFIG.charH);
                ctx.fillStyle = color || CONFIG.color;
                ctx.fillText(char, (SCREEN.cx * CONFIG.charW) + CONFIG.fontOffsetX, (SCREEN.cy * CONFIG.charH) + CONFIG.fontOffsetY);

                SCREEN.cx++;
            }
        }
        SCREEN.drawCursor();
    },

    drawCursor: () => {
        if (!IO.cursorVisible || SCREEN.isCursorDrawn) return;
        const x = SCREEN.cx * CONFIG.charW;
        const y = SCREEN.cy * CONFIG.charH;
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = CONFIG.color;
        ctx.fillRect(x, y, CONFIG.charW, CONFIG.charH);
        ctx.restore();
        SCREEN.isCursorDrawn = true;
    },

    removeCursor: () => {
        if (!SCREEN.isCursorDrawn) return;
        const x = SCREEN.cx * CONFIG.charW;
        const y = SCREEN.cy * CONFIG.charH;
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = CONFIG.color;
        ctx.fillRect(x, y, CONFIG.charW, CONFIG.charH);
        ctx.restore();
        SCREEN.isCursorDrawn = false;
    }
};
