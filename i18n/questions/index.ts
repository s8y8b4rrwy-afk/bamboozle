import { Question } from '../../types';

export type Language = 'en' | 'el';

import { QUESTIONS_EL } from './el';
import { QUESTIONS_EN } from './en';

export const getQuestions = (lang: Language): Omit<Question, 'id'>[] => {
    switch (lang) {
        case 'el':
            return QUESTIONS_EL;
        case 'en':
        default:
            return QUESTIONS_EN;
    }
};
