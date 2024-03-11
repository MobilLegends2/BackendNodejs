import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: Date.now },
  emojis: [{ type: String }], // Array field for emojis
  // Other fields you may want to include:
  // attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
