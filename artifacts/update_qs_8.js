import fs from 'fs';
import { questions as allQuestions } from '../src/questions.js';

const newQText = fs.readFileSync('./artifacts/new_q211_to_q240.json', 'utf8');
const newQuestions = JSON.parse(newQText);

// Q1 to Q210 (index 0 to 209)
const batch1to7 = allQuestions.slice(0, 210);

// Q241 to Q300 (index 240 to 299)
const batch9to10 = allQuestions.slice(240);

const finalQuestions = [...batch1to7, ...newQuestions, ...batch9to10];

let jsContent = 'export const questions = ' + JSON.stringify(finalQuestions, null, 2) + ';\n';

fs.writeFileSync('../src/questions.js', jsContent, 'utf8');
console.log('Successfully updated questions.js for Phase 8');
