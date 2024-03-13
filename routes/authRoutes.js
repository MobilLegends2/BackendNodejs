// routes/authRoutes.js
import express from 'express';
import { register, login,signInUsingToken,unlockSession, forgotPassword,loginGoogle,loginWithOutlook,activateAccount,signout} from '../controllers/authController.js';

const router = express.Router();
router.post('/forgotPassword', forgotPassword);
router.post('/register', register);
router.post('/logingoogel',loginGoogle);
router.post('/login', login);
router.post('/sign-out', signout);
router.post('/Outlook', loginWithOutlook);
router.post('/sign-in-with-token', signInUsingToken);
router.post('/unlock-session', unlockSession);
router.get('/activate/:token', activateAccount);
export default router;
