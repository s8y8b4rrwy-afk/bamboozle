
import { PHRASES_EN } from './en';
import { PHRASES_EL } from './el';

export type Language = 'en' | 'el';
export type PhraseKey = keyof typeof PHRASES_EN;

export const getNarratorPhrase = (lang: Language, key: PhraseKey, context: Record<string, any> = {}) => {
    let templates;

    if (lang === 'el') {
        templates = PHRASES_EL[key];
    } else {
        templates = PHRASES_EN[key];
    }

    // Fallback to English if key missing in target lang
    if (!templates) {
        templates = PHRASES_EN[key];
    }

    if (!templates) return `[Missing Text: ${String(key)}]`;

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace(/{(\w+)}/g, (_, k) => context[k] !== undefined ? context[k] : `unknown`);
};

export const getBotNames = (lang: Language): string[] => {
    return lang === 'el' ? PHRASES_EL.BOT_NAMES : PHRASES_EN.BOT_NAMES;
};
