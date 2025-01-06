const express = require('express');
const router = express.Router();
const HelpSupport = require('../models/userhelpModel'); // Assuming your schema is in the models folder
const { authenticateToken } = require("../routes/userRoutes"); 

// Route to add a question for a user
router.post('/add-helpquestion', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; 
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question cannot be empty' });
    }

  
    let helpSupport = await HelpSupport.findOne({ user_id: user_id });

    if (!helpSupport) {
   
      helpSupport = new HelpSupport({
        user_id: user_id,
        interactions: [{ question }],
      });
    } else {
    
      helpSupport.interactions.push({ question });
    }

    await helpSupport.save();

    res.status(200).json({
      message: 'Question added successfully',
      helpSupport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




// Route to get all questions and answers for the logged-in user
router.get('/my-questions', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.user_id; 
      const helpSupport = await HelpSupport.findOne({ user_id: user_id });
  
      if (!helpSupport) {
        return res.status(404).json({ message: 'No questions found for this user' });
      }
  
      res.status(200).json({
        message: 'Questions and answers fetched successfully',
        interactions: helpSupport.interactions,
        user_id: user_id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

  // Route to add an answer for a specific question
router.post('/add-answer', async (req, res) => {
    try {
      const { question_id, answer } = req.body;
  
      if (!question_id || !answer || answer.trim() === '') {
        return res.status(400).json({ message: 'Question ID and answer are required' });
      }
  
      // Find the document containing the question
      const helpSupport = await HelpSupport.findOne({
        'interactions._id': question_id,
      });
  
      if (!helpSupport) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      // Update the specific question's answer
      const interaction = helpSupport.interactions.id(question_id);
      interaction.answer = answer;
  
      // Save the updated document
      await helpSupport.save();
  
      res.status(200).json({
        message: 'Answer added successfully',
        helpSupport,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;
