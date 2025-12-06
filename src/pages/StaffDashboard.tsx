import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/student/Navbar";
import { ViewOrders } from "@/components/staff/ViewOrders";
import { CanceledOrders } from "@/components/staff/CanceledOrders";
import { MenuAvailability } from "@/components/staff/MenuAvailability";
import { staffAPI, menuAPI, getUser } from "@/lib/api";
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
  canceledAt?: string;
  cancelledAt?: string; // Backend uses cancelledAt (double 'l')
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imagePath: string;
}

export function StaffDashboard() {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [canceledOrders, setCanceledOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
      const [ordersData, canceledData, menuData] = await Promise.all([
        staffAPI.getOrders(),
        staffAPI.getCancelledOrders(),
        menuAPI.getMenu() // Staff can see all items, not just available
      ]);
      
      setOrders(ordersData);
      setCanceledOrders(canceledData);
      setMenuItems(menuData || []); // Ensure it's always an array
      
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
      
      // Debug: Log menu items count
      console.log('Menu items loaded:', menuData?.length || 0);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.message || "Failed to load data");
      // Set empty arrays on error to prevent undefined
      setMenuItems([]);
      setOrders([]);
      setCanceledOrders([]);
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  // Fetch orders and menu on mount
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
          staffAPI.getOrders(),
          staffAPI.getCancelledOrders(),
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
      await fetchData(false); // Refresh orders without showing loading
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleConfirmPickup = async (orderId: string) => {
    try {
      await staffAPI.updateOrderStatus(orderId, 'picked');
      // Optimistically remove from view immediately
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      toast.success('Pickup confirmed - Order completed');
      // Refresh data in background to ensure consistency (without showing loading)
      fetchData(false);
    } catch (error: any) {
      console.error('Pickup error:', error);
      // Revert optimistic update on error
      fetchData(false);
      toast.error(error.message || "Failed to confirm pickup");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await staffAPI.cancelOrder(orderId);
      await fetchData(false);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    // Optimistic update - update UI immediately
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId 
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
    
    try {
      await menuAPI.toggleAvailability(itemId);
      toast.success('Menu availability updated');
    } catch (error: any) {
      // Revert on error
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId 
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        )
      );
      toast.error(error.message || "Failed to toggle availability");
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('menu-availability')) {
      return (
        <div className="p-3 sm:p-6 max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-16 h-16 rounded" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24 hidden sm:block" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24 hidden md:block" />
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Default skeleton for orders
    return (
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32 hidden sm:block" />
                  <Skeleton className="h-4 w-40 flex-1" />
                  <Skeleton className="h-4 w-16 hidden md:block" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="staff" currentPath={location.pathname} />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" currentPath={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate to="/staff/orders" replace />} />
        <Route 
          path="/orders" 
          element={
            <ViewOrders 
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
              onConfirmPickup={handleConfirmPickup}
              onCancelOrder={handleCancelOrder}
            />
          } 
        />
        <Route 
          path="/cancelled-orders" 
          element={<CanceledOrders canceledOrders={canceledOrders} />} 
        />
        <Route 
          path="/menu-availability" 
          element={
            <MenuAvailability 
              menuItems={menuItems}
              onToggleAvailability={handleToggleAvailability}
            />
          } 
        />
      </Routes>
    </div>
  );
}