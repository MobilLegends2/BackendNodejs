import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors"; // Import the cors middleware
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import authRoutes from './routes/authRoutes.js';
import sectionRoutes from './routes/section.js';
import conversationRoutes from './routes/conversation.js';
import messageRoutes from './routes/message.js';
import groupRoutes from './routes/group.js';
import attachmentRoutes from './routes/attachment.js';
import categoryRoutes from './routes/category.js';
import userRoutes from './routes/users.js';
import secretKeyRoutes from "./routes/secretKey.js";
import applicationRoutes from "./routes/application.js";
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/message.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';


const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = 9090 || process.env.PORT;

// Specifying the MongoDB database name
const databaseName = 'CrossChat';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

// Connecting to the MongoDB database
try {
  await mongoose.connect(`mongodb+srv://CrossChat:CrossChat123@crosschat.ekjeexv.mongodb.net/${databaseName}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log(`Connected to ${databaseName}`);
} catch (error) {
  console.error(error);
}

app.use(cors()); // Enable CORS middleware

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));

// Serve the Swagger UI with your OpenAPI specification
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/category', categoryRoutes);
app.use('/section', sectionRoutes);
app.use('/user', userRoutes);
app.use('/application', applicationRoutes);
app.use('/token', secretKeyRoutes);

// Using custom middleware for handling 404 errors
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
        conversation: messageData.conversationId
      });
      await message.save();

      // Emit the message to other sockets
      io.emit('new_message', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
