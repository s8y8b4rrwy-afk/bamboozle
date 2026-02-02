
import { QUESTIONS } from '../data/questions';

const categories = QUESTIONS.map(q => q.category);
const uniqueCategories = [...new Set(categories)];

const categoryCounts = uniqueCategories.reduce((acc, cat) => {
    acc[cat] = categories.filter(c => c === cat).length;
    return acc;
}, {} as Record<string, number>);

console.log('--- AVAILABLE CATEGORIES ---');
console.log(`Total Questions: ${QUESTIONS.length}`);
console.log(`Unique Categories: ${uniqueCategories.length}`);
console.log('\nCounts per Category:');
Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .forEach(([cat, count]) => {
        console.log(`- ${cat}: ${count}`);
    });
