/**
 * Order model
 * 
 * What this file does:
 * - Defines Order schema for MongoDB
 * - Fields: orderId, userId, items, pickupTime, specialInstructions, status
 * - Tracks order status transitions and cancellation
 * 
 * Frontend usage:
 * - Used by all order-related endpoints
 * - Order data displayed in student, staff, and admin dashboards
 * - Order information shown in CurrentOrders, OrderHistory, StaffDashboard, AdminDashboard
 */
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  specialInstructions: {
    type: String,
    default: ''
  },
  pickupTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'picked', 'cancelled'],
    default: 'pending'
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  canceledBy: {
    type: String,
    enum: ['student', 'staff', 'manager'],
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for common queries
// Compound index for student queries: userId + status
orderSchema.index({ userId: 1, status: 1 });

// Index for staff queries: status
orderSchema.index({ status: 1 });

// Compound index for daily reports: createdAt + status
orderSchema.index({ createdAt: 1, status: 1 });

// Note: orderId already has unique: true which creates an index automatically
// No need for explicit index({ orderId: 1 })

const Order = mongoose.model('Order', orderSchema);

export default Order;

