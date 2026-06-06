const axios = require('axios');
const Paper = require('../models/Paper');

// 🔥 Ollama base URL
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";


// ===============================
// 🧠 AI SUMMARY CONTROLLER
// ===============================
exports.generateSummary = async (req, res) => {
  try {

    const { paperId } = req.body;

    const paper = await Paper.findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const prompt = `
Summarize this research paper:

${paper.content}
`;

    const response = await axios.post(OLLAMA_URL, {
      model: "mistral:latest",
      prompt,
      stream: false
    });

    res.json({
      summary: response.data.response
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// ❓ ASK AI CONTROLLER
// ===============================
exports.askAI = async (req, res) => {
    try {
        const { question, paperContent } = req.body;

        const prompt = `
        You are a helpful AI assistant for research papers.

        Context:
        ${paperContent || "No context provided"}

        Question:
        ${question}
        `;

        const response = await axios.post(OLLAMA_URL, {
            model: "mistral:latest",
            prompt: prompt,
            stream: false
        });

        res.json({
            answer: response.data.response
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.generateFlowchart = async (req, res) => {

  try {

    const { paperId } = req.body;

    const paper = await require('../models/Paper').findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const prompt = `
You are an AI that creates flowcharts.

Convert this research paper into step-by-step flowchart format.

Rules:
- Only return steps
- Use arrows (↓)
- Keep it simple

Text:
${paper.content}
`;

    const response = await axios.post(OLLAMA_URL, {
      model: "mistral:latest",
      prompt,
      stream: false
    });

    res.json({
      flowchart: response.data.response
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};