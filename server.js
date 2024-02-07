import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';


import { notFoundError, errorHandler } from './middlewares/error-handler.js';


const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 9090;
const databaseName = 'greenworld';
const db_url = 'mongodb://localhost:27017';


mongoose.set('debug', true);
mongoose.Promise = global.Promise;

mongoose
  .connect(`${db_url}/${databaseName}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${databaseName}`);
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/img', express.static('public/images'));


// Vous pouvez ajuster le préfixe '/api' en fonction de vos besoins
app.use(notFoundError);
app.use(errorHandler);

// Sur toute demande à /evt, exécutez ce qui suit
app.use('/evt', (req, res, next) => {
  console.log("Middleware just ran on an evt route !");
  next();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
