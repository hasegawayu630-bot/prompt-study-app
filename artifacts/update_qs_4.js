import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q91_to_q120.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q90 (0..89)
const batch1to3 = allQuestions.slice(0, 90);

// Q121 to Q300 (120..)
const batch5to10 = allQuestions.slice(120);

const finalQuestions = [...batch1to3, ...newQuestions, ...batch5to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js');
