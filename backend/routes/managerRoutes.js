/**
 * Manager/Admin routes
 * 
 * What this file does:
 * - Defines admin system management API endpoints
 * - Handles user management, order management, reports, and archiving
 * 
 * API Endpoints:
 * User Management:
 * - GET /api/manager/users - Get all staff/manager users
 * - POST /api/manager/users - Create staff/manager user
 * - PATCH /api/manager/users/:id - Update user (username, password, role)
 * - DELETE /api/manager/users/:id - Delete user
 * 
 * Order Management:
 * - GET /api/manager/orders - Get all orders (with optional status filter)
 * - GET /api/manager/orders/cancelled - Get all cancelled orders
 * - DELETE /api/manager/orders/cancelled - Clear all cancelled orders
 * 
 * Reports:
 * - GET /api/manager/reports - Get daily reports and analytics (with optional date filter)
 * 
 * Archive:
 * - POST /api/manager/archive/:orderId - Archive single order
 * - POST /api/manager/archive/bulk - Bulk archive orders older than specified days
 * - GET /api/manager/archive - Get archived orders (with optional date filter)
 * 
 * Frontend components using these endpoints:
 * - src/pages/AdminDashboard.tsx - Uses all manager endpoints
 * - src/components/admin/UserManagement.tsx - Uses user management endpoints (via props)
 * - src/components/admin/DailyReports.tsx - Uses getDailyReports endpoint (via props)
 * - src/components/admin/ArchiveOrders.tsx - Uses archive endpoints (via props)
 */
import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllOrders,
  getCancelledOrders,
  clearCancelledOrders,
  getDailyReports,
  archiveOrder,
  bulkArchiveOrders,
  getArchivedOrders
} from '../controllers/managerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);
router.use(authorize('manager'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', validateObjectId, updateUser);
router.delete('/users/:id', validateObjectId, deleteUser);

router.get('/orders', getAllOrders);
router.get('/orders/cancelled', getCancelledOrders);
router.delete('/orders/cancelled', clearCancelledOrders);

router.get('/reports', getDailyReports);

router.post('/archive/bulk', bulkArchiveOrders);
router.post('/archive/:orderId', validateObjectId, archiveOrder);
router.get('/archive', getArchivedOrders);

export default router;

