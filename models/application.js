import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema({
  name: { type: String },
  description: { type: String },
  subscriptionType: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  
});

export default model('Application', ApplicationSchema);
