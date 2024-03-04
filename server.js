import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import authRoutes from './routes/authRoutes.js';
import sectionRoutes from './routes/section.js';
import conversationRoutes from './routes/conversation.js';
import messageRoutes from './routes/message.js';
import groupRoutes from './routes/group.js';
import attachmentRoutes from './routes/attachment.js';
import categoryRoutes from './routes/category.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/message.js';
import Conversation from './models/conversation.js'; // Import the Conversation model

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = 9090 || process.env.PORT;
const databaseName = 'CrossCHat';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

try {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${databaseName}`);
  console.log(`Connected to ${databaseName}`);
} catch (error) {
  console.error(error);
}

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));

app.use('/api/auth', authRoutes);
app.use('/category', categoryRoutes);
app.use('/section', sectionRoutes);
app.use('/', attachmentRoutes);
app.use('/', groupRoutes);
app.use('/', conversationRoutes);
app.use('/', messageRoutes);
app.use(notFoundError);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('new_message', async (messageData) => {
    console.log('New message:', messageData);
    try {
      // Save the message to the database
      const message = new Message({
        sender: messageData.sender,
        content: messageData.content,
        conversation: messageData.conversation
      });
      await message.save();

      // Update conversation with new message
      await Conversation.updateOne(
        { _id: messageData.conversation },
        { $push: { messages: message._id } }
      );

      // Emit the message to other sockets
// Emit the message to other sockets with conversation
// Emit the message to other sockets with conversationId
io.emit('new_message', { ...messageData, conversation: messageData.conversation });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
