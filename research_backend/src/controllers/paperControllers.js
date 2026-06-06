const fs = require('fs');
const path = require('path');
const Paper = require('../models/Paper');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ======================================================
// 📄 PDF TEXT EXTRACTION (child process — never hangs)
// ======================================================
const extractTextWithTimeout = (filePath) => {
    return new Promise((resolve) => {

        const absoluteFilePath = path.resolve(filePath);

        const script = `
            const pdfParse = require(${JSON.stringify(require.resolve('pdf-parse'))});
            const fs = require('fs');
            const buf = fs.readFileSync(${JSON.stringify(absoluteFilePath)});
            pdfParse(buf)
                .then(d => { 
                    process.stdout.write(d.text || ''); 
                    process.exit(0); 
                })
                .catch((e) => { 
                    process.stderr.write(e.message);
                    process.stdout.write(''); 
                    process.exit(0); 
                });
        `;

        const child = require('child_process').spawn(
            process.execPath,
            ['-e', script],
            { timeout: 12000 }
        );

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', chunk => output += chunk.toString());
        child.stderr.on('data', chunk => errorOutput += chunk.toString());

        child.on('close', (code) => {
            console.log('📄 Child process exit code:', code);
            console.log('📄 Extracted text length:', output.trim().length);
            if (errorOutput) console.log('⚠️ Child stderr:', errorOutput);
            resolve(output.trim());
        });

        child.on('error', (err) => {
            console.log('❌ Child process error:', err.message);
            resolve('');
        });
    });
};


// ======================================================
// 📄 UPLOAD PAPER
// ======================================================
const uploadPaper = async (req, res) => {
    try {
        console.log('REQ FILE => ', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'PDF file is required'
            });
        }

        console.log('📄 Extracting text...');
        const extractedText = await extractTextWithTimeout(req.file.path);
        console.log('✅ Extracted length:', extractedText.length);

const newPaper = new Paper({
    title: req.file.originalname,  
    filename: req.file.filename,   
    filepath: req.file.path,
    content: extractedText,
    userId: req.userId
});

        await newPaper.save();
        console.log('✅ Saved to DB:', newPaper._id);

        return res.status(201).json({
            success: true,
            message: 'Paper uploaded successfully',
            paper: { id: newPaper._id }
        });

    } catch (error) {
        console.log('UPLOAD ERROR => ', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// 📝 GENERATE SUMMARY
// ======================================================
const generateSummary = async (req, res) => {
    try {
        const { paperId } = req.body;

        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).json({
                success: false,
                message: 'Paper not found'
            });
        }

        const text = (paper.content || '')
            .replace(/\s+/g, ' ')
            .slice(0, 4000);

        if (!text || text.length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract enough text from this PDF.'
            });
        }

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert document summarizer. 
You can summarize ANY type of document — research papers, lecture notes, books, reports, manuals, legal documents, articles, etc.
STRICT RULES:
- Only summarize what is actually in the provided text
- Never say "no text provided" or "I cannot find"
- Never use research-paper-specific headings unless it IS a research paper
- Do not add outside knowledge`
                },
                {
                    role: 'user',
                    content: `Read the document text below and provide a clear structured summary.

First, detect what type of document this is, then pick 4-6 headings that naturally fit that document type.

Examples:
- Lecture notes → Key Topics, Main Concepts, Important Points, Summary
- Research paper → Problem, Methodology, Results, Conclusion
- Legal document → Parties Involved, Key Terms, Obligations, Summary
- Book/Article → Overview, Key Points, Main Themes, Takeaways
- Manual/Guide → Purpose, Key Steps, Important Notes, Summary
- Report → Overview, Findings, Recommendations, Conclusion

Rules:
- Start with: "📄 Document Type: [detected type]"
- Only use content from the text below
- Under each heading write 3-5 sentences based strictly on the document
- If a section has no relevant content, skip that heading entirely

Document Text:
"""
${text}
"""`
                }
            ],
            temperature: 0.3,
            max_tokens: 1500
        });

        const summary = response.choices[0].message.content;
        await Paper.findByIdAndUpdate(paperId, { summary }); 
        console.log('✅ Summary generated');

        return res.status(200).json({
            success: true,
            summary
        });

    } catch (error) {
        console.log('SUMMARY ERROR => ', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ======================================================
// ❓ SUGGEST QUESTIONS
// ======================================================
const suggestQuestions = async (req, res) => {
    try {
        const { paperId } = req.body;

        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).json({
                success: false,
                message: 'Paper not found'
            });
        }

        const text = (paper.content || '')
            .replace(/\s+/g, ' ')
            .slice(0, 3000);

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a research paper assistant. Only generate questions based on the provided text.'
                },
                {
                    role: 'user',
                    content: `Generate exactly 5 specific questions from this research paper. Number them 1 to 5.

Research Paper Text:
"""
${text}
"""`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const questions = response.choices[0].message.content
            .split('\n')
            .filter(q => q.trim() !== '');
        await Paper.findByIdAndUpdate(paperId, { questions });

        console.log('✅ Questions generated');

        return res.status(200).json({
            success: true,
            questions
        });

    } catch (error) {
        console.log('QUESTION ERROR => ', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// ❓ ASK AI
// ======================================================
const askAI = async (req, res) => {
    try {
        const { question, paperId } = req.body;

        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).json({
                success: false,
                message: 'Paper not found'
            });
        }

        const text = (paper.content || '')
            .replace(/\s+/g, ' ')
            .slice(0, 4000);

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a smart, friendly AI assistant. You have two jobs:
1. If the question is related to the uploaded document, answer using the document content provided.
2. If the question is general knowledge, casual conversation, or unrelated to the document, answer naturally from your own knowledge.
Be conversational, helpful, and friendly. Never say "this is not in the paper" for general questions.`
                },
                {
                    role: 'user',
                    content: `Uploaded Document Content (use this if the question is related):
"""
${text}
"""

User Question: ${question}`
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        const answer = response.choices[0].message.content;
        await Paper.findByIdAndUpdate(paperId, {   // ← add this block
    $push: { chats: { question, answer } }
});
        console.log('✅ Answer generated');

        return res.status(200).json({
            success: true,
            answer
        });

    } catch (error) {
        console.log('ASK AI ERROR => ', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// 📊 FLOWCHART
// ======================================================
const generateFlowchart = async (req, res) => {
    try {
        const { paperId } = req.body;

        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).json({
                success: false,
                message: 'Paper not found'
            });
        }

        const text = (paper.content || '')
            .replace(/\s+/g, ' ')
            .slice(0, 3000);

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI that creates flowcharts from research papers. Only use information from the provided text.'
                },
                {
                    role: 'user',
                    content: `Convert this research paper into a step-by-step flowchart.

Rules:
- Use arrows (→) between steps  
- Keep each step short and clear
- Return steps only

Research Paper Text:
"""
${text}
"""`
                }
            ],
            temperature: 0.3,
            max_tokens: 800
        });

        const flowchart = response.choices[0].message.content;
        await Paper.findByIdAndUpdate(paperId, { flowchart });
        

        console.log('✅ Flowchart generated');

        return res.status(200).json({
            success: true,
            flowchart
        });

    } catch (error) {
        console.log('FLOWCHART ERROR => ', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// 📜 GET HISTORY
// ======================================================
const getHistory = async (req, res) => {
    try {
        const papers = await Paper.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('title filename summary questions chats flowchart createdAt');
            

        // ✅ fallback to filename if title is empty
        const formatted = papers.map(p => ({
            ...p.toObject(),
            title: p.title || p.filename || 'Untitled Paper'
        }));

        return res.status(200).json({
            success: true,
            papers: formatted
        });
    } catch (error) {
        console.log('HISTORY ERROR => ', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePaper = async (req, res) => {
    try {
        const { id } = req.params;
        await Paper.findByIdAndDelete({ _id: id, userId: req.userId });
        return res.status(200).json({ success: true, message: 'Paper deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadPaper,
    generateSummary,
    suggestQuestions,
    askAI,
    generateFlowchart,
    getHistory,
    deletePaper    
};