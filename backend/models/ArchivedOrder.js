/**
 * ArchivedOrder model
 * 
 * What this file does:
 * - Defines ArchivedOrder schema for storing completed orders
 * - Preserves order history after archiving
 * - Maintains same structure as Order model for consistency
 * 
 * Frontend usage:
 * - Used by archive endpoints
 * - Frontend component: src/components/admin/ArchiveOrders.tsx
 * - Displays archived orders in admin dashboard
 */
import mongoose from 'mongoose';

const archivedOrderItemSchema = new mongoose.Schema({
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

const archivedOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [archivedOrderItemSchema],
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
    default: 'picked'
  },
  createdAt: {
    type: Date,
    required: true
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  archivedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for common queries
// Index on createdAt for date-based reports
archivedOrderSchema.index({ createdAt: 1 });

// Index on archivedAt for sorting
archivedOrderSchema.index({ archivedAt: -1 });

const ArchivedOrder = mongoose.model('ArchivedOrder', archivedOrderSchema);

export default ArchivedOrder;

