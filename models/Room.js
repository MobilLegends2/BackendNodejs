import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Ajoutez d'autres champs pertinents pour votre salle de discussion
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
