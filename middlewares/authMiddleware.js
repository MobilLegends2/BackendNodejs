import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token format', details: decoded });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token', details: err });
  } 
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  next();
};
