import { Router } from 'express';
import { createTransfer, getTransfers, updateTransferStatus } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Create transfer (Admin and Logistics Officer)
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);

// List transfers (all authenticated, base-scoped)
router.get('/', enforceBaseScope, getTransfers);

// Update transfer status (Admin only)
router.patch('/:id/status', authorizeRoles('ADMIN'), updateTransferStatus);

export default router;
