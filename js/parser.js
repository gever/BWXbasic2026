import { LIB } from './library.js';
import { SYNTAX_COMMANDS, SYNTAX_KEYWORDS, SYNTAX_FUNCTIONS } from './keywords.js';

export const Tokenizer = {
    regex: /([0-9]*\.?[0-9]+)|("([^"\\]|\\.)*")|([a-zA-Z][a-zA-Z0-9_]*\$?)|(<=|>=|<>|<|>|=)|([\+\-\*\/\^])|(\()|(\))|(:)|(,)|(;)|(')|(\S)/g,
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

        if (SYNTAX_COMMANDS.includes(tu)) return SYNTAX.colors.COMMAND;

        if (SYNTAX_KEYWORDS.includes(tu)) return SYNTAX.colors.KEYWORD;

        if (SYNTAX_FUNCTIONS.includes(tu)) return SYNTAX.colors.FUNCTION;

        return SYNTAX.colors.DEFAULT;
    }
};
