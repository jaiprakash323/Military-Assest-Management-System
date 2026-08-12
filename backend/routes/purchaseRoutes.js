import { Router } from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Create purchase (Admin and Logistics Officer)
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createPurchase);

// List purchases (all authenticated, base-scoped)
router.get('/', enforceBaseScope, getPurchases);

export default router;
