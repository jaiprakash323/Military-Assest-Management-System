import { Router } from 'express';
import { createAssignment, getAssignments } from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Create assignment (Admin and Base Commander)
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createAssignment);

// List assignments (all authenticated, base-scoped)
router.get('/', enforceBaseScope, getAssignments);

export default router;
