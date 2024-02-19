// routes/authRoutes.js
import express from 'express';
import { register, login,signInUsingToken,unlockSession, forgotPassword,loginGoogle,loginWithOutlook} from '../controllers/authController.js';

const router = express.Router();
router.post('/', forgotPassword);
router.post('/register', register);
router.post('/logingoogel',loginGoogle);
router.post('/login', login);
router.post('/Outlook', loginWithOutlook);
router.post('/sign-in-with-token', signInUsingToken);
router.post('/unlock-session', unlockSession);

export default router;
