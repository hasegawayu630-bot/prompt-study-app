import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

// Read new first 30 questions
const newQText = fs.readFileSync('./artifacts/new_q1_to_q30.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Combine new 30 + old 31-300
// Note: allQuestions is 0-indexed, so 30 means index 30 onwards (id 31+)
const remainingQuestions = allQuestions.slice(30);

const finalQuestions = [...newQuestions, ...remainingQuestions];

// Generate JS file content
let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

// Write back to questions.js
fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js');
