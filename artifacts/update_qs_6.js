import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q151_to_q180.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q150 (index 0 to 149)
const batch1to5 = allQuestions.slice(0, 150);

// Q181 to Q300 (index 180 to 299)
const batch7to10 = allQuestions.slice(180);

const finalQuestions = [...batch1to5, ...newQuestions, ...batch7to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 6');
