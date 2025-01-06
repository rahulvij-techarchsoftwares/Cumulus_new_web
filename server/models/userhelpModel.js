const mongoose = require('mongoose');

const helpSupportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  interactions: [
    {
      question: {
        type: String,
        default: null, 
      },
      answer: {
        type: String,
        default: null, 
      },
      created_at: {
        type: Date,
        default: Date.now, 
      },
    },
  ],
});

const HelpSupport = mongoose.model('HelpSupport', helpSupportSchema);

module.exports = HelpSupport;