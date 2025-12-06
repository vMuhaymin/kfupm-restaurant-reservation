import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/student/Navbar";
import { ViewOrders } from "@/components/staff/ViewOrders";
import { CanceledOrders } from "@/components/staff/CanceledOrders";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { DailyReports } from "@/components/admin/DailyReports";
import { UserManagement } from "@/components/admin/UserManagement";
import { ArchiveOrders } from "@/components/admin/ArchiveOrders";
import { managerAPI, menuAPI, staffAPI } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Order {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: { name: string; quantity: number; price: number }[];
  pickupTime: string;
  specialInstructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
  canceledBy?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imagePath: string;
  description?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'staff' | 'manager';
  createdAt: string;
}

export function ManagerDashboard() {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [canceledOrders, setCanceledOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Track previous order counts to detect changes
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [prevCanceledCount, setPrevCanceledCount] = useState(0);
  // Track order signatures (ID + updatedAt) to detect edits
  const [prevOrderSignatures, setPrevOrderSignatures] = useState<Map<string, string>>(new Map());
  // Track menu signatures (ID + updatedAt) to detect menu changes
  const [prevMenuSignatures, setPrevMenuSignatures] = useState<Map<string, string>>(new Map());

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }
      
      const [ordersData, canceledData, menuData, usersData, archivedData] = await Promise.all([
        managerAPI.getAllOrders(),
        managerAPI.getCancelledOrders(),
        menuAPI.getMenu(),
        managerAPI.getUsers(),
        managerAPI.getArchivedOrders()
      ]);
      
      console.log('Fetched users:', usersData); // Debug log
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setCanceledOrders(Array.isArray(canceledData) ? canceledData : []);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setArchivedOrders(Array.isArray(archivedData) ? archivedData : []);
      
      // Update previous counts for change detection
      setPrevOrderCount(Array.isArray(ordersData) ? ordersData.length : 0);
      setPrevCanceledCount(Array.isArray(canceledData) ? canceledData.length : 0);
      
      // Update order signatures for edit detection
      const newSignatures = new Map<string, string>();
      if (Array.isArray(ordersData)) {
        ordersData.forEach((order: any) => {
          const signature = order.updatedAt || order.createdAt || '';
          newSignatures.set(order._id, signature);
        });
      }
      setPrevOrderSignatures(newSignatures);
      
      // Update menu signatures for change detection
      const newMenuSignatures = new Map<string, string>();
      if (Array.isArray(menuData)) {
        menuData.forEach((item: any) => {
          const signature = item.updatedAt || item.createdAt || '';
          newMenuSignatures.set(item._id, signature);
        });
      }
      setPrevMenuSignatures(newMenuSignatures);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      if (showLoading || isInitialLoad) {
        toast.error(error.message || "Failed to load data");
      }
      setOrders([]);
      setCanceledOrders([]);
      setMenuItems([]);
      setUsers([]);
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Smart polling: Check for order and menu changes every 5 seconds
  // Refreshes if order count changed, order was edited, or menu was changed
  useEffect(() => {
    const checkForChanges = async () => {
      try {
        // Fetch full order and menu data to check for edits
        const [ordersData, canceledData, menuData] = await Promise.all([
          managerAPI.getAllOrders(),
          managerAPI.getCancelledOrders(),
          menuAPI.getMenu()
        ]);
        
        const currentOrderCount = Array.isArray(ordersData) ? ordersData.length : 0;
        const currentCanceledCount = Array.isArray(canceledData) ? canceledData.length : 0;
        
        // Check if counts changed
        const countChanged = currentOrderCount !== prevOrderCount || currentCanceledCount !== prevCanceledCount;
        
        // Check if any order was edited (compare updatedAt timestamps)
        let orderEdited = false;
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          const currentSignatures = new Map<string, string>();
          ordersData.forEach((order: any) => {
            const signature = order.updatedAt || order.createdAt || '';
            currentSignatures.set(order._id, signature);
            
            // Check if this order's updatedAt changed
            const prevSignature = prevOrderSignatures.get(order._id);
            if (prevSignature && prevSignature !== signature) {
              orderEdited = true;
            }
          });
          
          // Check for new orders (not in previous signatures)
          if (prevOrderSignatures.size > 0) {
            ordersData.forEach((order: any) => {
              if (!prevOrderSignatures.has(order._id)) {
                orderEdited = true; // New order
              }
            });
          }
          
          setPrevOrderSignatures(currentSignatures);
        }
        
        // Check if any menu item was changed (compare updatedAt timestamps)
        let menuChanged = false;
        if (Array.isArray(menuData) && menuData.length > 0) {
          const currentMenuSignatures = new Map<string, string>();
          menuData.forEach((item: any) => {
            const signature = item.updatedAt || item.createdAt || '';
            currentMenuSignatures.set(item._id, signature);
            
            // Check if this menu item's updatedAt changed
            const prevSignature = prevMenuSignatures.get(item._id);
            if (prevSignature && prevSignature !== signature) {
              menuChanged = true;
            }
          });
          
          // Check for new menu items (not in previous signatures)
          if (prevMenuSignatures.size > 0) {
            menuData.forEach((item: any) => {
              if (!prevMenuSignatures.has(item._id)) {
                menuChanged = true; // New menu item
              }
            });
          }
          
          setPrevMenuSignatures(currentMenuSignatures);
        }
        
        // Refresh if counts changed OR if any order was edited OR if menu changed
        if (countChanged || orderEdited || menuChanged) {
          await fetchData(false);
          setPrevOrderCount(currentOrderCount);
          setPrevCanceledCount(currentCanceledCount);
        }
      } catch (error) {
        // Silently fail - don't spam errors
        console.error('Error checking for changes:', error);
      }
    };

    // Start checking after initial load completes
    if (!isInitialLoad) {
      const interval = setInterval(checkForChanges, 5000);
      return () => clearInterval(interval);
    }
  }, [prevOrderCount, prevCanceledCount, prevOrderSignatures, prevMenuSignatures, isInitialLoad, fetchData]);

  // Refresh when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchData(false);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'picked') => {
    try {
      await staffAPI.updateOrderStatus(orderId, newStatus);
      await fetchData(false);
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleConfirmPickup = async (orderId: string) => {
    try {
      await staffAPI.updateOrderStatus(orderId, 'picked');
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      await fetchData(false);
      toast.success('Pickup confirmed - Order completed');
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm pickup");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await managerAPI.cancelOrder(orderId);
      await fetchData(false);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const handleAddMenuItem = async (item: { name: string; price: number; category: string; description?: string; available: boolean; imageUrl: string }) => {
    try {
      // Extract imagePath from imageUrl (remove the base URL if present)
      let imagePath = item.imageUrl;
      if (imagePath.startsWith('http://localhost:55555/uploads')) {
        imagePath = imagePath.replace('http://localhost:55555/uploads', '');
      } else if (imagePath.startsWith('/uploads')) {
        imagePath = imagePath.replace('/uploads', '');
      } else if (!imagePath.startsWith('/')) {
        // If it's a full URL or placeholder, use a default path
        imagePath = '/menu_images/default.jpg';
      }
      
      // Ensure imagePath starts with /menu_images/
      if (!imagePath.startsWith('/menu_images/')) {
        imagePath = '/menu_images/' + imagePath.replace(/^\/+/, '');
      }
      
      await menuAPI.createMenuItem({
        name: item.name,
        price: item.price,
        category: item.category,
        isAvailable: item.available,
        imagePath: imagePath,
        description: item.description || ''
      });
      await fetchData(false);
      toast.success('Menu item added successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to add menu item");
    }
  };

  const handleEditMenuItem = async (itemId: string, updates: Partial<{ name: string; price: number; category: string; description?: string; available: boolean; imageUrl: string }>) => {
    try {
      const backendUpdates: any = {};
      
      if (updates.name !== undefined) backendUpdates.name = updates.name;
      if (updates.price !== undefined) backendUpdates.price = updates.price;
      if (updates.category !== undefined) backendUpdates.category = updates.category;
      if (updates.description !== undefined) backendUpdates.description = updates.description;
      if (updates.available !== undefined) backendUpdates.isAvailable = updates.available;
      
      if (updates.imageUrl !== undefined) {
        let imagePath = updates.imageUrl;
        if (imagePath.startsWith('http://localhost:55555/uploads')) {
          imagePath = imagePath.replace('http://localhost:55555/uploads', '');
        } else if (imagePath.startsWith('/uploads')) {
          imagePath = imagePath.replace('/uploads', '');
        }
        // Ensure imagePath starts with /menu_images/
        if (!imagePath.startsWith('/menu_images/')) {
          imagePath = '/menu_images/' + imagePath.replace(/^\/+/, '');
        }
        backendUpdates.imagePath = imagePath;
      }
      
      await menuAPI.updateMenuItem(itemId, backendUpdates);
      await fetchData(false);
      toast.success('Menu item updated successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to update menu item");
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await menuAPI.deleteMenuItem(itemId);
      await fetchData(false);
      toast.success('Menu item deleted successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete menu item");
    }
  };

  const handleAddUser = async (user: Omit<User, '_id' | 'createdAt' | 'email'> & { password: string }) => {
    try {
      await managerAPI.createUser({
        username: user.username,
        password: user.password,
        role: user.role,
      });
      await fetchData(false);
      toast.success('User created successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<User> & { password?: string }) => {
    try {
      const backendUpdates: any = {};
      
      if (updates.username !== undefined) backendUpdates.username = updates.username;
      if (updates.role !== undefined) backendUpdates.role = updates.role;
      if (updates.password !== undefined && updates.password) backendUpdates.password = updates.password;
      
      await managerAPI.updateUser(userId, backendUpdates);
      await fetchData(false);
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await managerAPI.deleteUser(userId);
      await fetchData(false);
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="manager" currentPath={location.pathname} />
        <LoadingSkeleton />
      </div>
    );
  }

  // Map backend data to component format
  const mapMenuItems = (items: MenuItem[]) => {
    return items.map(item => ({
      id: item._id,
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      available: item.isAvailable,
      imageUrl: `http://localhost:55555/uploads${item.imagePath}`
    }));
  };

  const mapUsers = (users: User[]) => {
    return users.map(user => ({
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: new Date(user.createdAt).toISOString().split('T')[0]
    }));
  };

  // Map orders for DailyReports and ArchiveOrders components
  const mapOrdersForReports = (orders: Order[]) => {
    return orders.map(order => {
      const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const studentName = `${order.userId.firstName} ${order.userId.lastName}`;
      const itemsList = order.items.map(item => `${item.quantity}x ${item.name}`);
      
      return {
        id: order._id,
        orderId: order.orderId,
        studentName,
        items: itemsList,
        pickupTime: order.pickupTime,
        status: order.status === 'picked' ? 'Completed' : 
                order.status === 'cancelled' ? 'Canceled' : 
                order.status.charAt(0).toUpperCase() + order.status.slice(1),
        date,
        total
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="manager" currentPath={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate to="/manager/orders" replace />} />
        <Route 
          path="/orders" 
          element={
            <ViewOrders 
              orders={orders.filter(o => o.status !== 'cancelled' && o.status !== 'picked')}
              onUpdateStatus={handleUpdateStatus}
              onConfirmPickup={handleConfirmPickup}
              onCancelOrder={handleCancelOrder}
            />
          } 
        />
        <Route 
          path="/cancelled-orders" 
          element={
            <CanceledOrders 
              canceledOrders={canceledOrders}
              onClearAll={async () => {
                try {
                  const result = await managerAPI.clearCancelledOrders();
                  toast.success(result.message || `Successfully deleted ${result.deletedCount} cancelled order(s)`);
                  // Refresh data after clearing
                  await fetchData(false);
                } catch (error: any) {
                  toast.error(error.message || "Failed to clear cancelled orders");
                }
              }}
            /> 
          } 
        />
        <Route 
          path="/menu-management" 
          element={
            <MenuManagement 
              menuItems={mapMenuItems(menuItems)}
              onAddItem={handleAddMenuItem}
              onEditItem={handleEditMenuItem}
              onDeleteItem={handleDeleteMenuItem}
            />
          } 
        />
        <Route 
          path="/daily-reports" 
          element={<DailyReports orders={mapOrdersForReports([...orders, ...canceledOrders])} />} 
        />
        <Route 
          path="/user-management" 
          element={
            <UserManagement 
              users={mapUsers(users)}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          } 
        />
        <Route 
          path="/archive" 
          element={
            <ArchiveOrders 
              orders={mapOrdersForReports(orders)}
              archivedOrders={mapOrdersForReports(archivedOrders)}
              onArchiveOrders={async (daysOld: number) => {
                try {
                  const result = await managerAPI.bulkArchiveOrders(daysOld);
                  toast.success(result.message || `Successfully archived ${result.archivedCount} order(s)`);
                  // Refresh data after archiving
                  await fetchData(false);
                } catch (error: any) {
                  toast.error(error.message || "Failed to archive orders");
                }
              }}
            /> 
          } 
        />
      </Routes>
    </div>
  );
}