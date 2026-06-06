const express = require('express');
const router = express.Router();

const axios = require('axios');

router.get('/questions/:paperId', async (req, res) => {

    const { paperId } = req.params;

    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
        model: "mistral:latest",
        prompt: `Generate 5 exam questions from paper ${paperId}`,
        stream: false
    });

    res.json({
        questions: response.data.response.split('\n')
    });

});

module.exports = router;