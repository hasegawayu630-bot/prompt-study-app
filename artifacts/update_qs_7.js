import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q181_to_q210.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q180 (index 0 to 179)
const batch1to6 = allQuestions.slice(0, 180);

// Q211 to Q300 (index 210 to 299)
const batch8to10 = allQuestions.slice(210);

const finalQuestions = [...batch1to6, ...newQuestions, ...batch8to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 7');
