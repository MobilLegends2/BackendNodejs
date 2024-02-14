import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import authRoutes from './routes/authRoutes.js';
import sectionRoutes from './routes/section.js';
import categoryRoutes from './routes/category.js';
import userRoutes from './routes/users.js';

// Creating an express app
const app = express();

// Setting the port number for the server (default to 9090 if not provided)
const PORT = 9090 || process.env.PORT;

// Specifying the MongoDB database name
const databaseName = 'CrossChat';

// Enabling debug mode for mongoose
mongoose.set('debug', true);

// Setting the global Promise library
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

// Enabling Cross-Origin Resource Sharing
app.use(cors());

// Using morgan for logging HTTP requests
app.use(morgan('dev')); 

// Parsing JSON request bodies
app.use(express.json());

// Parsing URL-encoded request bodies with extended format
app.use(express.urlencoded({ extended: true }));

// Serving static files (images) from the 'public/images' directory
app.use('/img', express.static('public/images'));

// Importing the routes for the 'tests' resource
app.use('/api/auth', authRoutes);
app.use('/category', categoryRoutes);
app.use('/section', sectionRoutes);
app.use('/user', userRoutes);

// Using custom middleware for handling 404 errors
app.use(notFoundError);

// Using custom middleware for handling general errors
app.use(errorHandler); 

// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
