import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  console.log('Received Token:', typeof token, token);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'your-secret-key');

    // Check if decoded user and user id are present
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token format', details: decoded });
    }

    // Set the user information on req.user
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