import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Middleware to authenticate incoming requests via JWT.
 * Extracts token from Authorization header, verifies it,
 * and attaches decoded user data to req.user.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No authentication token provided.',
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'military-asset-secret-key-default-2026';
    const decoded = jwt.verify(token, jwtSecret);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, baseId: true },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed. User no longer exists.',
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.baseId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(500).json({ message: 'Authentication error.' });
  }
};
