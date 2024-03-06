import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema({
  name: { type: String },
  logo: { type: String },
  subscriptionType: { type: String },
  secretKey: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },

}, {
  timestamps: true
});

export default model('Application', ApplicationSchema);
