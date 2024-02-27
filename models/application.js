import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema({
  name: { type: String },
  description: { type: String },
  
});

export default model('Application', ApplicationSchema);
