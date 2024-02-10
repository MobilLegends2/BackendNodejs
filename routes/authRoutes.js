// routes/authRoutes.js
import express from 'express';
import { register, login,signInUsingToken} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/sign-in-with-token', signInUsingToken);

export default router;
