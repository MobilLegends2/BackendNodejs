import express from "express";

const router = express.Router();

import {
  getAll, getUserById, updateUserById,
} from "../controllers/users.js";


router.get("/", getAll);
router.get("/:userId", getUserById);
router.put("/:userId", updateUserById);



export default router;
