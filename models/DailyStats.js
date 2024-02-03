import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const dailyStatsSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0, // Temps en millisecondes ou en secondes
  },
});

export default model('DailyStats', dailyStatsSchema);
