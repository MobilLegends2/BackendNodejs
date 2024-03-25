import express from 'express';
import Message from '../models/message.js';
import Conversation from '../models/conversation.js';

const router = express.Router();

// Create a new message and add it to a specific conversation
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { sender, content } = req.body;
    const conversationId = req.params.conversationId;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create a new message
    const message = new Message({
      sender,
      content,
      conversation: conversationId
    });

    // Save the message
    await message.save();

    // Add the message to the conversation
    conversation.messages.push(message);
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a message
router.put('/messages/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findByIdAndUpdate(req.params.id, { content }, { new: true });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a message
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add an emoji to a specific message
router.post('/messages/:id/emoji', async (req, res) => {
  try {
    const { emoji } = req.body;
    const messageId = req.params.id;

    // Find the message by ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add the emoji to the message's emojis array
    message.emojis.push(emoji);
    
    // Save the updated message
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
