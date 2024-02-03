import express from "express";
import { body } from "express-validator";
import multer from "../middlewares/multer-config.js";

import {
  getAllUsers,
  addUser,
  sendResetCode,
  sendResetCodeByTel,
  getUserById,
  updateUserById,
  updateScoreById,
  deleteUserById,
  resetPassword,
  updatePassword
} from "../controllers/user.js";

const router = express.Router();

// Route pour obtenir la liste de tous les utilisateurs
router.get("/", getAllUsers);

// Route pour créer un nouvel utilisateur
router.post(
  "/",
  multer("image", 5 * 1024 * 1024), // Multer middleware should come before validation
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),

  addUser
);

router.post("/sendResetCode", sendResetCode);
router.post("/reset", sendResetCodeByTel, body('numeTel').isNumeric);
// Route pour obtenir les détails d'un utilisateur par ID
router.get("/:id", getUserById);

router.put(
  '/:id',
  multer("image", 5 * 1024 * 1024), // Multer middleware should come before validation
 

  updateUserById
);
router.put(
  '/',
  updateUserById
);

// Route to update a user's profile by ID
router.put(
  "/updateProfilById",  // New route path
  updateScoreById
);

// Route to update a user's profile by ID
router.put(
  "/updateR",  // New route path
  resetPassword
);

// Route pour supprimer un utilisateur par ID
router.delete("/:id", deleteUserById);
router.put('/updatePassword/:id', updatePassword);

export default router;
