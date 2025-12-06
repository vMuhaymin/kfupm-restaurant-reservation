/**
 * Manager/Admin controller
 * 
 * What this file does:
 * - Handles complete system management for administrators
 * - Manages users (staff/manager accounts)
 * - Manages orders (view, cancel, archive)
 * - Generates daily reports and analytics
 * - Handles bulk operations (bulk archive, clear cancelled orders)
 * 
 * Frontend components using this:
 * - src/pages/AdminDashboard.tsx - Uses all manager controller functions
 * - src/components/admin/UserManagement.tsx - Uses user management functions (via props)
 * - src/components/admin/DailyReports.tsx - Uses getDailyReports function (via props)
 * - src/components/admin/ArchiveOrders.tsx - Uses archive functions (via props)
 */
import User from '../models/User.js';
import Order from '../models/Order.js';
import ArchivedOrder from '../models/ArchivedOrder.js';
import bcrypt from 'bcryptjs';

// ========== USER MANAGEMENT ==========

// @desc    Get all users (staff and managers)
// @route   GET /api/manager/users
// @access  Private/Manager
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['staff', 'manager'] }
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create staff or manager
// @route   POST /api/manager/users
// @access  Private/Manager
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, password, and role' });
    }

    if (!['staff', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Role must be staff or manager' });
    }

    // Auto-generate email
    const email = `${username}@system.com`;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : field === 'username' ? 'Username' : 'Field'} already in use` 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PATCH /api/manager/users/:id
// @access  Private/Manager
export const updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing to student role
    if (role && !['staff', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Role must be staff or manager' });
    }

    if (username) {
      user.username = username;
      // Regenerate email
      user.email = `${username}@system.com`;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (role) {
      user.role = role;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/manager/users/:id
// @access  Private/Manager
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Deletion rule: If user is a student with orders, disallow deletion
    // Staff and managers can be deleted (their orders remain but user info is preserved via populate)
    if (user.role === 'student') {
      const orderCount = await Order.countDocuments({ userId: user._id });
      if (orderCount > 0) {
        return res.status(400).json({ 
          message: `Cannot delete student with ${orderCount} existing order(s). Orders must be handled first.` 
        });
      }
    }

    // For staff/managers, orders remain but user reference will be broken
    // In production, you might want to anonymize or handle this differently
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ORDER MANAGEMENT ==========

// @desc    Get all orders
// @route   GET /api/manager/orders
// @access  Private/Manager
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cancelled orders
// @route   GET /api/manager/orders/cancelled
// @access  Private/Manager
export const getCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'cancelled' })
      .populate('userId', 'username email firstName lastName')
      .sort({ cancelledAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all cancelled orders
// @route   DELETE /api/manager/orders/cancelled
// @access  Private/Manager
export const clearCancelledOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({ status: 'cancelled' });
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} cancelled order(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== REPORTS ==========

// @desc    Get daily reports
// @route   GET /api/manager/reports
// @access  Private/Manager
export const getDailyReports = async (req, res) => {
  try {
    const { date } = req.query;
    
    let startDate, endDate;
    
    if (date) {
      // Parse date (YYYY-MM-DD)
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate('userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'picked').length;
    const pendingOrders = orders.filter(o => 
      ['pending', 'preparing', 'ready'].includes(o.status)
    ).length;
    
    // Calculate total revenue (only from picked orders)
    const totalRevenue = orders
      .filter(o => o.status === 'picked')
      .reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        );
        return sum + orderTotal;
      }, 0);
    
    res.json({
      date: date || new Date().toISOString().split('T')[0],
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ARCHIVE ==========

// @desc    Archive an order
// @route   POST /api/manager/archive/:orderId
// @access  Private/Manager
export const archiveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'username email firstName lastName');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only archive completed orders
    if (order.status !== 'picked') {
      return res.status(400).json({ 
        message: 'Only picked orders can be archived' 
      });
    }
    
    // Check if already archived
    const existingArchive = await ArchivedOrder.findOne({ orderId: order.orderId });
    if (existingArchive) {
      return res.status(400).json({ message: 'Order already archived' });
    }
    
    // Create archived order
    await ArchivedOrder.create({
      orderId: order.orderId,
      userId: order.userId,
      items: order.items,
      specialInstructions: order.specialInstructions,
      pickupTime: order.pickupTime,
      status: order.status,
      createdAt: order.createdAt,
      cancelledAt: order.cancelledAt
    });
    
    // Delete original order
    await order.deleteOne();
    
    res.json({ message: 'Order archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk archive orders older than specified days
// @route   POST /api/manager/archive/bulk
// @access  Private/Manager
export const bulkArchiveOrders = async (req, res) => {
  try {
    const { daysOld } = req.body;
    
    if (!daysOld || daysOld < 0) {
      return res.status(400).json({ message: 'Please provide a valid number of days (0 or greater)' });
    }
    
    // Build query - if daysOld is 0, archive all picked orders (for testing)
    let query = { status: 'picked' };
    
    if (daysOld > 0) {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      cutoffDate.setHours(0, 0, 0, 0);
      query.createdAt = { $lt: cutoffDate };
    }
    
    // Find all picked orders matching the criteria
    const ordersToArchive = await Order.find(query)
      .populate('userId', 'username email firstName lastName');
    
    if (ordersToArchive.length === 0) {
      return res.json({ 
        message: 'No orders found to archive',
        archivedCount: 0 
      });
    }
    
    // Archive each order
    let archivedCount = 0;
    let errors = [];
    
    for (const order of ordersToArchive) {
      try {
        // Check if already archived
        const existingArchive = await ArchivedOrder.findOne({ orderId: order.orderId });
        if (existingArchive) {
          continue; // Skip if already archived
        }
        
        // Create archived order
        await ArchivedOrder.create({
          orderId: order.orderId,
          userId: order.userId,
          items: order.items,
          specialInstructions: order.specialInstructions,
          pickupTime: order.pickupTime,
          status: order.status,
          createdAt: order.createdAt,
          cancelledAt: order.cancelledAt
        });
        
        // Delete original order
        await order.deleteOne();
        archivedCount++;
      } catch (error) {
        errors.push({ orderId: order.orderId, error: error.message });
      }
    }
    
    res.json({ 
      message: `Successfully archived ${archivedCount} order(s)`,
      archivedCount,
      totalFound: ordersToArchive.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get archived orders
// @route   GET /api/manager/archive
// @access  Private/Manager
export const getArchivedOrders = async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    const archivedOrders = await ArchivedOrder.find(query)
      .populate('userId', 'username email firstName lastName')
      .sort({ archivedAt: -1 });
    
    res.json(archivedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

