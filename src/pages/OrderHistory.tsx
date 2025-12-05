import { useState, useEffect } from "react";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { orderAPI } from "@/lib/api";

interface Order {
  _id: string;
  orderId: string;
  status: "pending" | "preparing" | "ready" | "picked" | "cancelled";
  pickupTime: string;
  specialInstructions?: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  }, []);

  useEffect(() => {
    const fetchOrders = async (showLoading = false) => {
      try {
        if (showLoading || isInitialLoad) {
          setLoading(true);
        }
        const data = await orderAPI.getOrderHistory();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (error: any) {
        console.error('Error fetching order history:', error);
        if (showLoading || isInitialLoad) {
          toast.error(error.message || "Failed to load order history");
        }
        setOrders([]);
      } finally {
        if (showLoading || isInitialLoad) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };
    fetchOrders(true);
    // Auto-refresh every 10 seconds to show newly picked orders (without showing loading)
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotal = (items: { name: string; quantity: number; price: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Loading skeleton component
  const OrderSkeleton = () => (
    <div className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="text-left sm:text-right space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
      <div className="border-t pt-4">
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-6">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-8">Order History</h1>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground">No order history</p>
          ) : (
            orders.map((order) => {
              const total = calculateTotal(order.items);
              const status = order.status === 'picked' ? 'Completed' : order.status === 'cancelled' ? 'Cancelled' : order.status;
              return (
                <div key={order._id} className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h2 className="text-xl sm:text-2xl font-bold font-display">Order ID#{order.orderId}</h2>
                      <Badge
                        className={
                          status === "Completed"
                            ? "bg-green-500 text-primary-foreground hover:bg-green-500/90"
                            : status === "Cancelled"
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
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
                        <span className="font-semibold ml-2 flex-shrink-0">
                          {(item.price * item.quantity).toFixed(2)} SAR
                        </span>
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm sm:text-base mb-2">Special Instructions:</h4>
                        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-lg sm:text-xl font-bold">Total: </span>
                      <span className="text-xl sm:text-2xl font-bold">
                        {total.toFixed(2)} SAR
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}