import { CONFIG } from './config.js';
import { SCREEN } from './screen.js';

let ctx = null;

export const GRAPHICS = {
    lastX: 0, lastY: 0,
    color: '#FFFFFF',
    legacyColors: ['#000000', '#14F53C', '#A040A0', '#FFFFFF', '#000000', '#FF6000', '#3040FF', '#FFFFFF'],
    palette: [],
    fontSize: 26,
    buffers: {},
    nextBufferId: 1,
    currentCanvasId: 0,

    init: (appCtx) => {
        ctx = appCtx;
        GRAPHICS.buffers[0] = { ctx: appCtx, canvas: appCtx.canvas, logicalW: CONFIG.width / CONFIG.scaleX, logicalH: CONFIG.height / CONFIG.scaleY };
        const hslToHex = (h, s, l) => {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 32; x++) {
                let color;
                if (x === 31) {
                    const grayLit = 100 - (y * (100 / 7));
                    color = hslToHex(0, 0, grayLit);
                } else {
                    const lit = 90 - (y * 10);
                    const hue = (30 - x) * (300 / 30);
                    color = hslToHex(hue, 100, lit);
                }
                GRAPHICS.palette.push(color);
            }
        }
    },

    mapX: (x) => Math.floor(x * CONFIG.scaleX),
    mapY: (y) => Math.floor(y * CONFIG.scaleY),
    setMode: (m) => { if (m > 0) SCREEN.clear(); },
    clear: () => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.clear();
        else GRAPHICS.clearToColor();
    },

    createCanvas: (w, h) => {
        const id = GRAPHICS.nextBufferId++;
        const pw = Math.ceil(w * CONFIG.scaleX);
        const ph = Math.ceil(h * CONFIG.scaleY);
        let canvasElement;
        if (typeof OffscreenCanvas !== 'undefined') {
            canvasElement = new OffscreenCanvas(pw, ph);
        } else {
            canvasElement = document.createElement('canvas');
            canvasElement.width = pw;
            canvasElement.height = ph;
        }
        GRAPHICS.buffers[id] = { canvas: canvasElement, ctx: canvasElement.getContext('2d'), logicalW: w, logicalH: h };
        return id;
    },
    freeCanvas: (id) => {
        if (id !== 0 && GRAPHICS.buffers[id]) {
            if (GRAPHICS.currentCanvasId === id) GRAPHICS.setCanvas(0);
            delete GRAPHICS.buffers[id];
        }
    },
    setCanvas: (id) => {
        if (GRAPHICS.buffers[id]) {
            GRAPHICS.currentCanvasId = id;
            ctx = GRAPHICS.buffers[id].ctx;
        }
    },
    getCanvas: () => {
        return GRAPHICS.currentCanvasId;
    },
    getCanvasWidth: () => {
        if (GRAPHICS.currentCanvasId === 0) return CONFIG.width / CONFIG.scaleX;
        return GRAPHICS.buffers[GRAPHICS.currentCanvasId].logicalW;
    },
    getCanvasHeight: () => {
        if (GRAPHICS.currentCanvasId === 0) return CONFIG.height / CONFIG.scaleY;
        return GRAPHICS.buffers[GRAPHICS.currentCanvasId].logicalH;
    },
    copyCanvas: (id, x, y, w, h) => {
        if (GRAPHICS.buffers[id]) {
            const srcCanvas = GRAPHICS.buffers[id].canvas;
            const dx = GRAPHICS.mapX(x);
            const dy = GRAPHICS.mapY(y);
            const dw = w !== undefined ? Math.ceil(w * CONFIG.scaleX) : srcCanvas.width;
            const dh = h !== undefined ? Math.ceil(h * CONFIG.scaleY) : srcCanvas.height;
            ctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, dx, dy, dw, dh);
        }
    },

    setLegacyColor: (c) => {
        GRAPHICS.color = GRAPHICS.legacyColors[Math.floor(Math.abs(c)) % 8];
    },

    setPaletteColor: (c) => {
        GRAPHICS.color = GRAPHICS.palette[Math.floor(Math.abs(c)) % 256];
    },

    clearToColor: () => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.fillStyle = GRAPHICS.color;
        const cw = GRAPHICS.currentCanvasId === 0 ? CONFIG.width : GRAPHICS.buffers[GRAPHICS.currentCanvasId].canvas.width;
        const ch = GRAPHICS.currentCanvasId === 0 ? CONFIG.height : GRAPHICS.buffers[GRAPHICS.currentCanvasId].canvas.height;
        ctx.fillRect(0, 0, cw, ch);
    },

    moveTo: (x, y) => {
        GRAPHICS.lastX = GRAPHICS.mapX(x);
        GRAPHICS.lastY = GRAPHICS.mapY(y);
    },
    plot: (x, y) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = GRAPHICS.color;
        const cx = GRAPHICS.mapX(x), cy = GRAPHICS.mapY(y);
        ctx.fillRect(cx, cy, Math.ceil(CONFIG.scaleX), Math.ceil(CONFIG.scaleY));
        GRAPHICS.lastX = cx; GRAPHICS.lastY = cy;
    },
    lineTo: (x, y) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = GRAPHICS.color; ctx.lineWidth = 2; ctx.beginPath();
        const tx = GRAPHICS.mapX(x), ty = GRAPHICS.mapY(y);
        ctx.moveTo(GRAPHICS.lastX + (CONFIG.scaleX / 2), GRAPHICS.lastY + (CONFIG.scaleY / 2));
        ctx.lineTo(tx + (CONFIG.scaleX / 2), ty + (CONFIG.scaleY / 2));
        ctx.stroke();
        GRAPHICS.lastX = tx; GRAPHICS.lastY = ty;
    },
    rect: (w, h, fill) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        const gw = w * CONFIG.scaleX;
        const gh = h * CONFIG.scaleY;
        if (fill) {
            ctx.fillStyle = GRAPHICS.color;
            ctx.fillRect(GRAPHICS.lastX, GRAPHICS.lastY, gw, gh);
        } else {
            ctx.strokeStyle = GRAPHICS.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(GRAPHICS.lastX, GRAPHICS.lastY, gw, gh);
        }
    },
    ellipse: (w, h, fill) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        const gw = Math.abs(w * CONFIG.scaleX);
        const gh = Math.abs(h * CONFIG.scaleY);
        const cx = GRAPHICS.lastX + (gw / 2);
        const cy = GRAPHICS.lastY + (gh / 2);

        ctx.beginPath();
        ctx.ellipse(cx, cy, gw / 2, gh / 2, 0, 0, 2 * Math.PI);

        if (fill) {
            ctx.fillStyle = GRAPHICS.color;
            ctx.fill();
        } else {
            ctx.strokeStyle = GRAPHICS.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    },
    triangle: (x2, y2, x3, y3, fill) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        const tx1 = GRAPHICS.lastX;
        const ty1 = GRAPHICS.lastY;
        const tx2 = GRAPHICS.mapX(x2);
        const ty2 = GRAPHICS.mapY(y2);
        const tx3 = GRAPHICS.mapX(x3);
        const ty3 = GRAPHICS.mapY(y3);

        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.lineTo(tx3, ty3);
        ctx.closePath();

        if (fill) {
            ctx.fillStyle = GRAPHICS.color;
            ctx.fill();
        } else {
            ctx.strokeStyle = GRAPHICS.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    },
    print: (str) => {
        if (GRAPHICS.currentCanvasId === 0) SCREEN.removeCursor();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = GRAPHICS.color;
        ctx.font = `${GRAPHICS.fontSize}px VT323`;
        ctx.textBaseline = 'top';
        ctx.fillText(str, GRAPHICS.lastX, GRAPHICS.lastY);
        GRAPHICS.lastX += ctx.measureText(str).width;
    }
};
