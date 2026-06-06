const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadPaper, askAI, generateSummary,
  suggestQuestions, generateFlowchart,
  getHistory, deletePaper
} = require('../controllers/paperControllers');

const router = express.Router();

router.post('/upload',   protect, upload.single('paper'), uploadPaper);
router.post('/ask',      protect, askAI);
router.post('/summary',  protect, generateSummary);
router.post('/suggest',  protect, suggestQuestions);
router.post('/flowchart',protect, generateFlowchart);
router.get('/history',   protect, getHistory);
router.delete('/:id',    protect, deletePaper);

module.exports = router;