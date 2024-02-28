import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  // Other fields you may want to include:
  // attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
