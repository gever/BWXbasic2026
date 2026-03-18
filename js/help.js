import { KEYWORDS } from './keywords.js';

export const HELP_DATA = {};

// Build HELP_DATA dynamically from the central KEYWORDS source
KEYWORDS.forEach(kw => {
    if (!kw.category) return; // Skip internal aliases/shorthands that lack a category
    
    if (!HELP_DATA[kw.category]) {
        HELP_DATA[kw.category] = [];
    }
    
    HELP_DATA[kw.category].push({
        c: kw.helpSyntax || kw.name,
        d: kw.desc,
        e: kw.example
    });
});
