import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifiez si l'e-mail existe déjà dans la base de données
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user.' });
  }
};

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

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '10m' });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in user.' });
  }
};

export const generateAccessToken = (refreshToken, res) => {
  try {
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating access token.' });
  }
};
export const signInUsingToken = async (req, res) => {
  try {
    const { accessToken } = req.body;
    console.log(accessToken);
    if (!accessToken) {
      throw new Error('No access token provided');
    }
    // Verify the access token
    jwt.verify(accessToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // If access token is expired, attempt to refresh it using the refresh token
          const decodedRefreshToken = jwt.decode(accessToken);
          const userId = decodedRefreshToken.userId;
          const user = await User.findById(userId);
          
          if (!user) {
            return res.status(404).json({ message: 'User not found.' });
          }

          // Check if the refresh token is valid
          jwt.verify(user.refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
              return res.status(401).json({ message: 'Invalid refresh token.' });
            }

            // Generate a new access token using the refresh token
            const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
            return res.json({ accessToken: newAccessToken });
          });
        } else {
          return res.status(401).json({ message: 'Invalid access token.' });
        }
      }

      // If access token is valid, proceed with normal flow
      const userId = decoded.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      generateAccessToken(user.refreshToken, res);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error refreshing access token.' });
  }
};
