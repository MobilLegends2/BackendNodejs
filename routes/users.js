import express from "express";

const router = express.Router();

import {
  getAll, getUserById,
} from "../controllers/users.js";


router.get("/", getAll);
router.get("/:userId", getUserById);



export default router;
