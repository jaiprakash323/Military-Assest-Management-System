import { Router } from 'express';
import {
  getDashboardMetrics,
  getChartData,
  getBases,
  getEquipmentTypes,
  getAuditLogs,
  getInventoryByBase,
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard metrics (all authenticated users, base-scoped)
router.get('/dashboard', enforceBaseScope, getDashboardMetrics);
router.get('/chart-data', enforceBaseScope, getChartData);
router.get('/inventory', enforceBaseScope, getInventoryByBase);

// Reference data
router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);

// Audit logs (Admin only)
router.get('/audit-logs', authorizeRoles('ADMIN'), getAuditLogs);

export default router;
