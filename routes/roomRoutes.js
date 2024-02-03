// routes/roomRoutes.js
import express from 'express';
const router = express.Router();

import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';

// GET all rooms
router.get('/', getAllRooms);

// GET a specific room by ID
router.get('/:id', getRoomById);

// POST create a new room
router.post('/', createRoom);

// PUT update a room by ID
router.put('/:id', updateRoom);

// DELETE delete a room by ID
router.delete('/:id', deleteRoom);

export default router;
