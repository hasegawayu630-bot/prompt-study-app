import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

// Read new questions
const newQText = fs.readFileSync('./artifacts/new_q31_to_q60.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q30 (index 0 to 29)
const batch1 = allQuestions.slice(0, 30);
// Q61 to Q300 (index 60 onwards)
const batch3to10 = allQuestions.slice(60);

const finalQuestions = [...batch1, ...newQuestions, ...batch3to10];

// Generate JS file content
let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

// Write back to questions.js
fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js');
