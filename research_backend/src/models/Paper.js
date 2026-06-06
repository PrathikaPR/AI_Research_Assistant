const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  filename: String,
  filepath: String,
  content: String,

  summary: {
    type: String,
    default: ''
  },

  questions: {
    type: [String],
    default: []
  },

  chats: [
    {
      question: String,
      answer: String,
      askedAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  },
  flowchart: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Paper', PaperSchema);