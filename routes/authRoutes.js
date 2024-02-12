// routes/authRoutes.js
import express from 'express';
import { register, login,signInUsingToken,unlockSession, forgotPassword} from '../controllers/authController.js';

const router = express.Router();
router.post('/', forgotPassword);
router.post('/register', register);
router.post('/login', login);
router.post('/sign-in-with-token', signInUsingToken);
router.post('/unlock-session', unlockSession);

export default router;
