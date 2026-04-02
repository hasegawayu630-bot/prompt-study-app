import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q61_to_q90.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q60
const batch1and2 = allQuestions.slice(0, 60);
// Q91 to Q300
const batch4to10 = allQuestions.slice(90);

const finalQuestions = [...batch1and2, ...newQuestions, ...batch4to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js');
