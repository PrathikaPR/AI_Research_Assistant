const express = require('express');
const router = express.Router();

const {
    generateSummary,
    askAI,
    suggestQuestions,
    generateFlowchart
} = require('../controllers/paperControllers');

// 🧠 Summary
router.post('/summary', generateSummary);

// ❓ Ask AI
router.post('/ask-ai', askAI);

// ❓ Questions
router.post('/questions', suggestQuestions);

// 🔷 Flowchart AI
router.post('/flowchart', generateFlowchart);

module.exports = router;