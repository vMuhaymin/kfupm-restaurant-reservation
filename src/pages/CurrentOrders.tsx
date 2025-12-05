import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { orderAPI, getUser } from "@/lib/api";
import { Pencil, X } from "lucide-react";

interface Order {
  _id: string;
  orderId: string;
  status: "pending" | "preparing" | "ready" | "picked" | "cancelled";
  pickupTime: string;
  specialInstructions?: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

export function CurrentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  }, []);

  useEffect(() => {
    const fetchOrders = async (showLoading = false) => {
      // Check if user is logged in
      const user = getUser();
      if (!user) {
        setLoading(false);
        setIsInitialLoad(false);
        return;
      }

      try {
        if (showLoading || isInitialLoad) {
          setLoading(true);
        }
        const data = await orderAPI.getCurrentOrders();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setOrders(data);
          hasFetchedRef.current = true;
        } else {
          console.error('Invalid orders data:', data);
          setOrders([]);
        }
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        // Check if it's an authentication error
        if (error.message?.includes('authorized') || error.message?.includes('token') || error.message?.includes('Not authorized')) {
          toast.error("Please login again");
          // Clear invalid token and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          // Only show error on first fetch attempt
          if (!hasFetchedRef.current) {
            toast.error(error.message || "Failed to load orders");
          }
          setOrders([]);
        }
      } finally {
        if (showLoading || isInitialLoad) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };
    
    fetchOrders(true);
    // Set up polling to refresh orders periodically (every 10 seconds) without showing loading
    const interval = setInterval(() => fetchOrders(false), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Confirmed';
      case 'preparing':
        return 'Being prepared';
      case 'ready':
        return 'Ready';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#B8C5E0] text-foreground hover:bg-[#B8C5E0]/90';
      case 'preparing':
        return 'bg-[#FFA07A] text-foreground hover:bg-[#FFA07A]/90';
      case 'ready':
        return 'bg-green-500 text-primary-foreground hover:bg-green-500/90';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calculateTotal = (items: { name: string; quantity: number; price: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleEditOrder = async (order: Order) => {
    try {
      // DON'T clear the regular cart - keep My Cart items separate
      // Only store the order data for editing (EditCart will load it separately)
      const editingOrderData = {
        orderId: order._id,
        pickupTime: order.pickupTime,
        specialInstructions: order.specialInstructions || ''
      };
      localStorage.setItem('editingOrder', JSON.stringify(editingOrderData));
      console.log('[CurrentOrders] Set editingOrder in localStorage:', editingOrderData);
      
      toast.success('Order loaded for editing. Modify and update to save changes.');
      // Navigate to edit cart page (it will load the order items separately)
      navigate('/student/edit-cart');
    } catch (error: any) {
      toast.error('Failed to load order for editing');
      console.error('Error loading order for edit:', error);
    }
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrderId(orderToCancel);
      await orderAPI.cancelOrder(orderToCancel);
      toast.success('Order cancelled successfully');
      
      // Check if this order was being edited (in cart)
      const editingOrderStr = localStorage.getItem('editingOrder');
      if (editingOrderStr) {
        try {
          const editingOrder = JSON.parse(editingOrderStr);
          // If the cancelled order is the one being edited, clear cart and editing state
          if (editingOrder.orderId === orderToCancel) {
            localStorage.removeItem('cart');
            localStorage.removeItem('editingOrder');
            toast.info('Cart cleared - cancelled order was being edited');
          }
        } catch (error) {
          console.error('Failed to parse editing order:', error);
        }
      }
      
      // Remove from current orders list
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderToCancel));
      setShowCancelDialog(false);
      setOrderToCancel(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Loading skeleton component
  const OrderSkeleton = () => (
    <div className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
      <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto mt-8 py-8 px-4 space-y-6">
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4 space-y-6">
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground">No current orders</p>
        ) : (
          orders.map((order) => {
            const total = calculateTotal(order.items);
            return (
              <div key={order._id} className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold font-display">Order ID#{order.orderId}</h2>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusDisplay(order.status)}
                    </Badge>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-sm sm:text-base">Pickup Time: {order.pickupTime}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold font-display text-base sm:text-lg mb-4">Order Items</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between mb-2 text-sm sm:text-base">
                      <span className="truncate">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold ml-2 flex-shrink-0">{(item.price * item.quantity).toFixed(2)} SAR</span>
                    </div>
                  ))}
                  {order.specialInstructions && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Special Instructions:</h4>
                      <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-lg sm:text-xl font-bold">Total: </span>
                    <span className="text-xl sm:text-2xl font-bold">
                      {total.toFixed(2)} SAR
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Show Edit and Cancel buttons only for pending orders */}
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="text-xs sm:text-sm"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="text-xs sm:text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Call the restaurant +966####
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}