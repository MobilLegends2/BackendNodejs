import express from 'express';
import Conversation from '../models/conversation.js';

const router = express.Router();

// Create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participants } = req.body;
    const conversation = new Conversation({ participants });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().populate({
      path: 'messages',
      populate: { path: 'sender', select: 'name' } // Populate sender field with name only
    });

    // Modify conversations to replace sender ID with sender's name and keep only the last message
    conversations.forEach(conversation => {
      if (conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        lastMessage.sender = lastMessage.sender ? lastMessage.sender.name : 'Unknown'; // Replace sender ID with name if sender exists
        conversation.messages = [lastMessage]; // Keep only the last message
      } else {
        conversation.messages = []; // No messages in the conversation
      }
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Get a single conversation
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get messages in a specific conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Find conversation with given ID
    const conversation = await Conversation.findById(conversationId).populate('messages');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Send the conversation along with its messages
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a conversation
router.put('/conversations/:id', async (req, res) => {
  try {
    const { participants } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(req.params.id, { participants }, { new: true });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
