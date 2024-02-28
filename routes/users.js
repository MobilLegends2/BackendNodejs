import express from "express";

const router = express.Router();

import {
  getAll, getUserById, updateUserById,
} from "../controllers/users.js";
import { authenticateUser,authorizeAdmin } from "../middlewares/authMiddleware.js";



router.get("/",authenticateUser,authorizeAdmin, getAll);

router.get("/:userId", getUserById);
router.put("/:userId", updateUserById);



export default router;
