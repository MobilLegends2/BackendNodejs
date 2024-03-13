import express from "express";
import { getAll, getUserById, updateUserById } from "../controllers/users.js";
import { authenticateUser, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:userId", getUserById);
router.put("/:userId", updateUserById);

export default router;
