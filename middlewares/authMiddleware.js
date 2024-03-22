import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js'; // Assuming JWT_SECRET import

import User from '../models/User.js';
export const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization');
  console.log(token);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.decode(token.replace('Bearer ', ''), JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token format', details: decoded });
    }

    // Query the User model to find the user by their ID
    const user = await User.findById(decoded.userId);

    // Check if the user exists and is not banned
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    } else if (user.isBanned) { // Assuming 'isBanned' is a boolean field in your User model
      return res.status(403).json({ success: false, message: 'Forbidden - User is banned' });
    }

    // If the user is found and not banned, attach user ID to the request object
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token', details: err });
  }
};

export const authorizeAdmin = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token format' });
  }
 
  try {
    const decoded = jwt.decode(token.replace('Bearer ', ''), JWT_SECRET);

    console.log(decoded)
    const userId = decoded.userId; // Assuming the user ID is stored in decoded.userId
    const existingUser = await User.findById(userId)
    console.log(existingUser)
    if (!existingUser || existingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing admin:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
