import { Tokenizer, SYNTAX } from './parser.js';

export const VIZ = {
    overlay: null,

    open: (program) => {
        if (!VIZ.overlay) {
            VIZ.createOverlay();
        }

        const svgContent = VIZ.generateSVG(program);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                        background: #1e1e1e;
                        color: #ccc;
                        font-family: 'VT323', monospace;
                        user-select: none;
                    }
                    #container {
                        width: 100vw;
                        height: 100vh;
                        cursor: grab;
                        transform-origin: 0 0;
                    }
                    #container:active {
                        cursor: grabbing;
                    }
                    svg {
                        display: block;
                        overflow: visible;
                    }
                    .box {
                        fill: #222;
                        stroke: #555;
                        stroke-width: 2;
                        rx: 5;
                        ry: 5;
                    }
                    .arrow {
                        fill: none;
                        stroke: #888;
                        stroke-width: 2;
                        marker-end: url(#arrowhead);
                    }
                    text {
                        font-family: monospace;
                        font-size: 14px;
                        dominant-baseline: text-before-edge;
                    }
                </style>
            </head>
            <body>
                <div id="container">
                    ${svgContent}
                </div>
                <script>
                    const container = document.getElementById('container');
                    let scale = 1;
                    let panX = 0;
                    let panY = 0;
                    let isDragging = false;
                    let startX, startY;

                    function updateTransform() {
                        container.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
                    }

                    container.addEventListener('mousedown', e => {
                        isDragging = true;
                        startX = e.clientX - panX;
                        startY = e.clientY - panY;
                    });

                    window.addEventListener('mouseup', () => {
                        isDragging = false;
                    });

                    window.addEventListener('keydown', e => {
                        if (e.key === 'Escape') {
                            window.parent.document.getElementById('viz-close-btn').click();
                        }
                    });

                    window.addEventListener('mousemove', e => {
                        if (!isDragging) return;
                        panX = e.clientX - startX;
                        panY = e.clientY - startY;
                        updateTransform();
                    });

                    container.addEventListener('wheel', e => {
                        e.preventDefault();
                        const zoomSensitivity = 0.001;
                        const delta = -e.deltaY * zoomSensitivity;
                        
                        const oldScale = scale;
                        scale = Math.min(Math.max(0.1, scale * Math.exp(delta)), 5);
                        
                        // mouse position relative to container
                        const rect = container.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const mouseY = e.clientY - rect.top;

                        // Adjust pan to zoom into cursor
                        const scaleRatio = scale / oldScale;
                        panX = e.clientX - (e.clientX - panX) * scaleRatio;
                        panY = e.clientY - (e.clientY - panY) * scaleRatio;
                        
                        updateTransform();
                    }, { passive: false });

                    // Center initial view roughly
                    const svgNode = document.querySelector('svg');
                    if (svgNode) {
                        const bbox = svgNode.getBBox();
                        if (bbox.width > 0) {
                            panX = (window.innerWidth - bbox.width) / 2 - bbox.x;
                            panY = 50 - bbox.y; // 50px top padding
                            updateTransform();
                        }
                    }
                </script>
            </body>
            </html>
        `;

        const iframe = document.getElementById('viz-iframe');
        iframe.srcdoc = htmlContent;
        VIZ.overlay.style.display = 'flex';
    },

    close: () => {
        if (VIZ.overlay) {
            VIZ.overlay.style.display = 'none';
            document.getElementById('viz-iframe').srcdoc = '';
            document.getElementById('input-trap').focus();
        }
    },

    createOverlay: () => {
        const monitor = document.getElementById('monitor');
        const overlay = document.createElement('div');
        overlay.id = 'viz-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 40px;
            left: 40px;
            right: 40px;
            bottom: 40px;
            z-index: 60;
            display: none;
            flex-direction: column;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
            border: 1px solid #444;
            background-color: #222;
        `;

        const header = document.createElement('div');
        header.className = 'help-header'; // recycle styling
        header.innerHTML = `
            <span>PROGRAM STRUCTURE VISUALIZATION</span>
            <button class="help-close" id="viz-close-btn">CLOSE</button>
        `;
        overlay.appendChild(header);

        const iframe = document.createElement('iframe');
        iframe.id = 'viz-iframe';
        iframe.style.cssText = `
            flex-grow: 1;
            border: none;
            background: #1e1e1e;
        `;
        overlay.appendChild(iframe);

        monitor.appendChild(overlay);

        document.getElementById('viz-close-btn').addEventListener('click', VIZ.close);
        VIZ.overlay = overlay;
    },

    generateSVG: (program) => {
        if (!program || program.length === 0) {
            return '<svg width="400" height="200"><text x="50" y="100" fill="#fff">NO PROGRAM LOADED</text></svg>';
        }

        // 1. Identify branch targets (GOTO X, GOSUB X, THEN X)
        const targets = new Set();
        const branchTypes = ['GOTO', 'GOSUB', 'THEN'];

        program.forEach(line => {
            const tokens = Tokenizer.tokenize(line.src);
            for (let i = 0; i < tokens.length - 1; i++) {
                const upper = tokens[i].toUpperCase();
                if (branchTypes.includes(upper)) {
                    // Check if next token is a line number
                    // Sometimes there are spaces, tokenize might not capture spaces in array
                    // Actually, Tokenizer.tokenize ignores spaces
                    const nextToken = tokens[i + 1];
                    if (!isNaN(nextToken)) {
                        targets.add(parseInt(nextToken));
                    }
                }
            }
        });

        // 2. Break program into basic blocks
        const blocks = [];
        let currentBlock = [];
        const terminalCommands = ['GOTO', 'END', 'STOP', 'RETURN']; // GOSUB continues locally after, but execution jumps

        const finalizeBlock = () => {
            if (currentBlock.length > 0) {
                blocks.push([...currentBlock]);
                currentBlock = [];
            }
        };

        for (let i = 0; i < program.length; i++) {
            const line = program[i];

            // If line is a target, it must start a new block
            if (targets.has(line.line) && currentBlock.length > 0) {
                finalizeBlock();
            }

            currentBlock.push(line);

            // If line ends unconditionally or branches, end block
            const tokens = Tokenizer.tokenize(line.src).map(t => t.toUpperCase());

            let isTerminal = false;
            for (let j = 0; j < tokens.length; j++) {
                const t = tokens[j];
                if (terminalCommands.includes(t) || t === 'GOSUB') {
                    isTerminal = true;
                    break;
                }
                if (t === 'THEN' && j < tokens.length - 1 && !isNaN(tokens[j + 1])) {
                    // Implicit GOTO (e.g., THEN 100)
                    isTerminal = true;
                    break;
                }
            }

            if (isTerminal) {
                finalizeBlock();
            }
        }
        finalizeBlock();

        // 3. Layout blocks vertically
        const boxWidth = 600;
        const lineMetrics = { height: 18, padX: 10, padY: 10 };
        const maxCharsPerLine = 75; // Approx chars that fit in 600px width with 14px monospace
        const blockSpecs = [];
        let currentY = 50;

        blocks.forEach((blockLines, idx) => {
            // Process lines into wrapped text lines
            const wrappedLines = [];

            blockLines.forEach(line => {
                const scanned = Tokenizer.scan(line.src);
                let currentWrapLine = [];
                let currentCharCount = line.line !== null ? line.line.toString().length + 1 : 5; // Account for line number prefix
                let isComment = false;

                // add prefix as a 'token' to the first wrapped line
                // use regular spaces, we will use xml:space="preserve" on the text element
                const prefixText = line.line !== null ? line.line + ' ' : '     ';
                currentWrapLine.push({ text: prefixText, color: '#ccc' });

                scanned.forEach(item => {
                    let textFragment = item.val;
                    let color = '#ccc'; // default

                    if (item.type !== 'SPACE') {
                        color = isComment ? SYNTAX.colors.COMMENT : SYNTAX.classify(item.val);
                        if (!isComment) {
                            const tu = item.val.toUpperCase();
                            if (tu === 'REM' || item.val === "'") {
                                isComment = true;
                                color = SYNTAX.colors.COMMENT;
                            }
                        }
                    }

                    // XML Escape
                    textFragment = textFragment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const len = item.val.length;

                    if (currentCharCount + len > maxCharsPerLine) {
                        // Push current line, start a new one
                        if (currentWrapLine.length > 0) {
                            wrappedLines.push(currentWrapLine);
                        }
                        currentWrapLine = [{ text: '      ' + textFragment, color: color }]; // indentation for wrapped lines
                        currentCharCount = 6 + len;
                    } else {
                        currentWrapLine.push({ text: textFragment, color: color });
                        currentCharCount += len;
                    }
                });

                if (currentWrapLine.length > 0) {
                    wrappedLines.push(currentWrapLine);
                }
            });

            // Calculate height based on wrapped lines
            const height = (wrappedLines.length * lineMetrics.height) + (lineMetrics.padY * 2);

            // Collect outgoing branches
            const outBranches = [];
            const lastLine = blockLines[blockLines.length - 1];
            const tokens = Tokenizer.tokenize(lastLine.src);

            for (let i = 0; i < tokens.length - 1; i++) {
                const upper = tokens[i].toUpperCase();
                if (['GOTO', 'GOSUB', 'THEN'].includes(upper)) {
                    const nextToken = tokens[i + 1];
                    if (!isNaN(nextToken)) {
                        outBranches.push({
                            target: parseInt(nextToken),
                            type: upper === 'GOSUB' ? 'dashed' : 'solid'
                        });
                    }
                }
            }

            // Check default fallthrough
            let hasFallthrough = false;
            const lastTokens = tokens.map(t => t.toUpperCase());
            if (!lastTokens.some(t => ['GOTO', 'END', 'STOP', 'RETURN', 'RUN'].includes(t))) {
                if (idx < blocks.length - 1) {
                    hasFallthrough = true;
                    outBranches.push({
                        target: blocks[idx + 1][0].line,
                        type: 'solid'
                    });
                }
            }

            blockSpecs.push({
                id: `block_${idx}`,
                firstLine: blockLines[0].line,
                lastLine: lastLine.line,
                lines: blockLines,
                wrappedLines: wrappedLines,
                x: 100,
                y: currentY,
                width: boxWidth,
                height: height,
                outBranches: outBranches
            });

            currentY += height + 40; // Spacing
        });

        // Compute SVG size
        const svgHeight = currentY + 100;
        const svgWidth = boxWidth + 300; // Extra room for arrows

        // 4. Generate SVG elements
        let defs = `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                </marker>
            </defs>
        `;

        let rects = '';
        let texts = '';
        let arrows = '';

        // Function to find block center by line number
        const getTargetBlock = (lineNum) => {
            return blockSpecs.find(b => b.lines.some(l => l.line === lineNum));
        };

        // Draw blocks
        blockSpecs.forEach(b => {
            rects += `<rect class="box" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" />\n`;

            let ty = b.y + lineMetrics.padY;

            b.wrappedLines.forEach(wLine => {
                let textLine = '';
                wLine.forEach(span => {
                    textLine += `<tspan fill="${span.color}">${span.text}</tspan>`;
                });
                texts += `<text x="${b.x + lineMetrics.padX}" y="${ty}" xml:space="preserve">${textLine}</text>\n`;
                ty += lineMetrics.height;
            });
        });

        // Draw edges
        blockSpecs.forEach(b => {
            b.outBranches.forEach(branch => {
                const targetBlock = getTargetBlock(branch.target);
                if (!targetBlock) return;

                const startX = b.x + b.width;
                const startY = b.y + b.height / 2;

                // Fallthrough directly below
                if (targetBlock.y > b.y && targetBlock.firstLine === branch.target && branch.target === b.lastLine + 1 && b.x === targetBlock.x) {
                    // Direct vertical line is handled via fallthrough usually, but we draw it curved slightly
                }

                const endX = targetBlock.x + targetBlock.width;
                const endY = targetBlock.y + targetBlock.height / 2;

                const midX = Math.max(startX, endX) + 50 + (Math.abs(b.y - targetBlock.y) * 0.1);

                const dash = branch.type === 'dashed' ? 'stroke-dasharray="5,5"' : '';

                arrows += `<path class="arrow" ${dash} d="M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + endY) / 2} T ${endX} ${endY}" />\n`;
            });
        });

        return `
            <svg id="viz-svg" width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
                ${defs}
                ${rects}
                ${texts}
                ${arrows}
            </svg>
        `;
    }
};
