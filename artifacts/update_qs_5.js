import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q121_to_q150.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q120 (0..119)
const batch1to4 = allQuestions.slice(0, 120);

// Q151 to Q300 (150..)
const batch6to10 = allQuestions.slice(150);

const finalQuestions = [...batch1to4, ...newQuestions, ...batch6to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 5');
