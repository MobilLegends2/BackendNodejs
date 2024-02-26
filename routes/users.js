import express from "express";

const router = express.Router();

import {
  getAll,
} from "../controllers/users.js";
import { authenticateUser,authorizeAdmin } from "../middlewares/authMiddleware.js";



router.get("/",authenticateUser,authorizeAdmin, getAll);


export default router;