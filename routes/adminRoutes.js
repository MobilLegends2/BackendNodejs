/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints pour les opérations d'administration
 */

import express from 'express';
import { banUser, unbanUser, banUserWithDuration,verifyResetCode,newPassword,getBannedUsers ,resetPassword} from '../controllers/adminController.js';
import { body } from 'express-validator';

const router = express.Router();

// Routes pour le bannissement d'utilisateur

/**
 * @swagger
 * /admin/{id}/ban:
 *   put:
 *     summary: Bannir un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à bannir
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur banni avec succès
 *       400:
 *         description: L'utilisateur est déjà banni
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/:id/ban',
  [
    // Ajoutez les validateurs express si nécessaires
    body('durationInMinutes').isInt().withMessage('La durée doit être un nombre entier positif'),
  ],
  banUser
);

router.get('/getBannedUsers',getBannedUsers)
router.put('/newPassword',newPassword)
router.put('/r',resetPassword)
router.post('/verifyResetCode',verifyResetCode)
/**
 * @swagger
 * /admin/{id}/unban:
 *   put:
 *     summary: Débannir un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à débannir
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur débanni avec succès
 *       400:
 *         description: L'utilisateur n'est pas banni
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/unban', unbanUser);

/**
 * @swagger
 * /admin/{id}/banWithDuration:
 *   put:
 *     summary: Bannir un utilisateur pour une durée définie
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à bannir
 *         schema:
 *           type: string
 *       - in: body
 *         name: durationInMinutes
 *         required: true
 *         description: Durée du bannissement en minutes
 *         schema:
 *           type: object
 *           properties:
 *             durationInMinutes:
 *               type: integer
 *     responses:
 *       200:
 *         description: Utilisateur banni avec succès pour une durée définie
 *       400:
 *         description: L'utilisateur est déjà banni
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/:id/banWithDuration',
  [
    // Ajoutez les validateurs express si nécessaires
    body('durationInMinutes').isInt().withMessage('La durée doit être un nombre entier positif'),
  ],
  banUserWithDuration
);

export default router;
