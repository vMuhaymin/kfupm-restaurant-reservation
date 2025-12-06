/**
 * Order routes (Student endpoints)
 * 
 * What this file does:
 * - Defines order management API endpoints for students
 * - Handles order creation, viewing, updating, and cancellation
 * 
 * API Endpoints:
 * - POST /api/orders - Create new order (Student only)
 * - GET /api/orders/current - Get current active orders (pending, preparing, ready) (Student only)
 * - GET /api/orders/history - Get order history (picked, cancelled) (Student only)
 * - GET /api/orders/:id - Get single order details
 * - PATCH /api/orders/:id - Update order (items, pickup time, instructions) (Student only, pending orders)
 * - PATCH /api/orders/:id/cancel - Cancel order (Student only, pending orders)
 * 
 * Frontend components using these endpoints:
 * - src/pages/MyCart.tsx - Uses createOrder and updateOrder endpoints
 * - src/pages/CurrentOrders.tsx - Uses getCurrentOrders and cancelOrder endpoints
 * - src/pages/OrderHistory.tsx - Uses getOrderHistory endpoint
 * - src/pages/EditCart.tsx - Uses getOrder and updateOrder endpoints
 */
import express from 'express';
import {
  createOrder,
  getCurrentOrders,
  getOrderHistory,
  getOrder,
  updateOrder,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createOrder);
router.get('/current', protect, authorize('student'), getCurrentOrders);
router.get('/history', protect, authorize('student'), getOrderHistory);
router.patch('/:id', protect, authorize('student'), validateObjectId, updateOrder);
router.patch('/:id/cancel', protect, authorize('student'), validateObjectId, cancelOrder);
router.get('/:id', protect, validateObjectId, getOrder);

export default router;

