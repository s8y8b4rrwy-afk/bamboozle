
import { QUESTIONS } from '../data/questions';

// MOCK: Shuffle function
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// MOCK: State
let state = {
    recentCategories: [] as string[]
};

// SIMULATION LOGIC
function simulateRound(roundNum: number) {
    console.log(`\n--- ROUND ${roundNum} ---`);
    console.log('Recent Categories (Stale):', state.recentCategories);

    // 1. Get all available categories (Simplified: using all questions)
    const availableQuestions = QUESTIONS;
    const validCategories = Array.from(new Set(availableQuestions.map(q => q.category)));

    // 2. Split into Fresh and Stale
    const recent = state.recentCategories || [];
    const freshCategories = validCategories.filter(c => !recent.includes(c));
    const staleCategories = validCategories.filter(c => recent.includes(c));

    console.log(`Fresh Available (${freshCategories.length}):`, freshCategories);
    console.log(`Stale Available (${staleCategories.length}):`, staleCategories);

    // 3. Shuffle
    const shuffledFresh = shuffle(freshCategories);
    const shuffledStale = shuffle(staleCategories);

    // 4. Fill slots
    const options: string[] = [];
    options.push(...shuffledFresh.slice(0, 6)); // Take max fresh

    if (options.length < 6) {
        const needed = 6 - options.length;
        console.log(`> Need ${needed} more from Stale...`);
        options.push(...shuffledStale.slice(0, needed));
    }

    // 5. Update state
    state.recentCategories = options;
    console.log('SELECTED OPTIONS:', options);

    // VALIDATION
    const freshPicked = options.filter(o => freshCategories.includes(o));
    const stalePicked = options.filter(o => staleCategories.includes(o));
    console.log(`Stats: Picked ${freshPicked.length} Fresh, ${stalePicked.length} Stale`);

    if (freshPicked.length < Math.min(6, freshCategories.length)) {
        console.error('ERROR: Did not maximize fresh categories!');
    } else {
        console.log('SUCCESS: Logic valid.');
    }
}

// Run 5 rounds
for (let i = 1; i <= 5; i++) {
    simulateRound(i);
}
