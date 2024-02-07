// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user.' });
  }
};

// Fonction pour connecter un utilisateur
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    // Générer un token d'accès contenant l'identifiant de l'utilisateur
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
    // Générer un token de rafraîchissement
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Renvoyer à la fois le token d'accès et le token de rafraîchissement à l'utilisateur
    res.json({ accessToken, refreshToken });
  } catch (error) {
    // En cas d'erreur, renvoyer une réponse d'erreur
    console.error(error);
    res.status(500).json({ message: 'Error logging in user.' });
  }
};

// Fonction pour générer un nouveau token d'accès à partir d'un refreshToken
export const generateAccessToken = async (req, res) => {
  try {
    // Récupérer le refreshToken de la requête
    const { refreshToken } = req.body;

    // Vérifier si le refreshToken est présent
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing.' });
    }
    // Vérifier si le refreshToken est valide
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      // Si le refreshToken est valide, générer un nouveau accessToken
      const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });

      // Renvoyer le nouveau accessToken
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating access token.' });
  }
};