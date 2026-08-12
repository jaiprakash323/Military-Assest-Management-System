import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), register);
router.get('/me', authenticateToken, getMe);

export default router;
