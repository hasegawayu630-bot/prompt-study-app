import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q271_to_q300.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q270 (index 0 to 269)
const batch1to9 = allQuestions.slice(0, 270);

const finalQuestions = [...batch1to9, ...newQuestions];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 10');
