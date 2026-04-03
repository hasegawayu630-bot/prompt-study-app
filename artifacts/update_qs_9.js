import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q241_to_q270.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q240 (index 0 to 239)
const batch1to8 = allQuestions.slice(0, 240);

// Q271 to Q300 (index 270 to 299)
const batch10 = allQuestions.slice(270);

const finalQuestions = [...batch1to8, ...newQuestions, ...batch10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 9');
