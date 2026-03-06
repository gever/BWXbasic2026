import { LIB } from './library.js';

export const Tokenizer = {
    regex: /([0-9]*\.?[0-9]+)|(".*?")|([a-zA-Z][a-zA-Z0-9_]*\$?)|(<=|>=|<>|<|>|=)|([\+\-\*\/\^])|(\()|(\))|(:)|(,)|(;)|(')|(\S)/g,
    tokenize: (str) => { const t = []; let m; while ((m = Tokenizer.regex.exec(str)) !== null) t.push(m[0]); return t; },
    scan: (str) => {
        const results = [];
        let lastIndex = 0;
        let m;
        const r = new RegExp(Tokenizer.regex);
        while ((m = r.exec(str)) !== null) {
            if (m.index > lastIndex) {
                results.push({ type: 'SPACE', val: str.substring(lastIndex, m.index) });
            }
            results.push({ type: 'TOKEN', val: m[0] });
            lastIndex = r.lastIndex;
        }
        if (lastIndex < str.length) {
            results.push({ type: 'SPACE', val: str.substring(lastIndex) });
        }
        return results;
    }
};

export const SYNTAX = {
    colors: {
        KEYWORD: '#FFD700',
        FUNCTION: '#87CEEB',
        COMMAND: '#FF6347',
        STRING: '#98FB98',
        NUMBER: '#DA70D6',
        COMMENT: '#808080',
        DEFAULT: '#33FF33'
    },
    classify: (token) => {
        if (!token) return SYNTAX.colors.DEFAULT;
        if (token.startsWith('"')) return SYNTAX.colors.STRING;
        if (!isNaN(token)) return SYNTAX.colors.NUMBER;

        const tu = token.toUpperCase();
        if (tu === 'REM' || token === "'") return SYNTAX.colors.COMMENT;

        if (['PRINT', 'INPUT', 'LET', 'DIM', 'DICT', 'ARRAY', 'READ', 'RESTORE', 'DATA', 'HOME', 'CLS', 'GR_CLEAR', 'GR_CLS', 'GR_COLOR', 'GR_MOVETO', 'GR_LINETO', 'GR_RECT', 'GR_FRECT', 'GR_ELLIPSE', 'GR_FELLIPSE', 'GR_TRI', 'GR_FTRI', 'GR_PRINT', 'GR_FONT', 'GR_COPY', 'GR_SET_CANVAS', 'GR_FREE', 'GR_FWD', 'GR_FD', 'GR_BK', 'GR_RT', 'GR_LT', 'GR_PEN_DN', 'GR_PD', 'GR_PEN_UP', 'GR_PU', 'GR_TURTLE_RESET', 'GR_TR', 'GR_PUSH', 'GR_POP', 'HGR', 'HGR2', 'TEXT', 'HCOLOR', 'HPLOT', 'VTAB', 'HTAB', 'SETPOS', 'SAVE', 'LOAD', 'DIR', 'CATALOG', 'DOWNLOAD', 'UPLOAD', 'JSECHO', 'DEL', 'SEED', 'DELAY', 'STOP', '?'].includes(tu)) return SYNTAX.colors.COMMAND;

        if (['ON', 'FOR', 'FORKEYS', 'NEXT', 'IF', 'THEN', 'ELSE', 'GOTO', 'GOSUB', 'RETURN', 'STEP', 'TO', 'END', 'STOP', 'NIL', 'FUN', 'CALL', 'DEF', 'AND', 'OR', '!'].includes(tu)) return SYNTAX.colors.KEYWORD;

        if (['SIN', 'COS', 'TAN', 'ATN', 'EXP', 'LOG', 'SQR', 'ABS', 'SGN', 'INT', 'RND', 'RAND', 'LEN', 'LEFT$', 'RIGHT$', 'MID$', 'STR$', 'VAL', 'ASC', 'CHR$', 'UPPER$', 'LOWER$', 'INKEY', 'INKEY$', 'TIME', 'INSTR', 'GR_CANVAS', 'GR_GET_CANVAS', 'GR_CANVAS_WIDTH', 'GR_CANVAS_HEIGHT', 'GR_RGB'].includes(tu)) return SYNTAX.colors.FUNCTION;

        return SYNTAX.colors.DEFAULT;
    }
};
