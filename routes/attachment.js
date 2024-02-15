import express from 'express';
import Attachment from '../models/attachment.js';
import Conversation from '../models/conversation.js';

const router = express.Router();

// Create a new attachment and associate it with a conversation
router.post('/conversations/:conversationId/attachments', async (req, res) => {
  try {
    const { url } = req.body;
    const conversationId = req.params.conversationId;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create a new attachment
    const attachment = new Attachment({
      conversation: conversationId,
      url
    });

    // Save the attachment
    await attachment.save();

    res.status(201).json(attachment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Delete an attachment
router.delete('/attachments/:id', async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Delete the attachment from the associated message
    const message = await Message.findById(attachment.message);
    if (message) {
      message.attachments.pull(req.params.id);
      await message.save();
    }

    // Delete the attachment itself
    await attachment.remove();

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
