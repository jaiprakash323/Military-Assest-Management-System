import { Router } from 'express';
import { createExpenditure, getExpenditures } from '../controllers/expenditureController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Create expenditure (Admin and Base Commander)
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createExpenditure);

// List expenditures (all authenticated, base-scoped)
router.get('/', enforceBaseScope, getExpenditures);

export default router;
