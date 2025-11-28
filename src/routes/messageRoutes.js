const express = require('express');
const { getConversationHistory, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Require login for all

// Route for the Inbox List
router.get('/inbox', getInbox);

// Route for specific chat history
router.get('/:recipientId', getConversationHistory);

module.exports = router;