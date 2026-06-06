require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

const paperRoutes = require('./routes/paperRoutes');
const aiRoutes = require('./routes/aiRoutes');
const questionRoutes = require('./routes/questionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();


// ===============================
// 🔌 DATABASE CONNECTION
// ===============================
connectDB();


// ===============================
// 📁 UPLOAD FOLDER SETUP
// ===============================
const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


// ===============================
// ⚙️ MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// 📂 STATIC FILES (uploaded PDFs)
// ===============================
app.use('/uploads', express.static(uploadPath));


// ===============================
// 🚀 ROUTES
// ===============================

// 📄 Paper routes (upload, etc.)
app.use('/api/papers', paperRoutes);

// 🧠 AI routes (summary, ask-ai)
app.use('/api', aiRoutes);

// ❓ Questions routes
app.use('/api', questionRoutes);

// 🔐 Auth routes
app.use('/api/auth', authRoutes);


// ===============================
// 🏠 TEST ROUTE
// ===============================
app.get('/', (req, res) => {
    res.send('AI Research Backend Running 🚀');
});


// ===============================
// ❌ 404 HANDLER (MUST BE LAST)
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


// ===============================
// 🚀 START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB Connected`);
});