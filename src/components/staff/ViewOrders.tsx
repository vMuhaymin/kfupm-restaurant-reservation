import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, X, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface Order {
  _id: string;
  orderId: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: { name: string; quantity: number; price: number }[];
  pickupTime: string;
  specialInstructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked' | 'cancelled';
  createdAt: string;
}

interface ViewOrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'picked') => void;
  onConfirmPickup: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
}

export function ViewOrders({ orders, onUpdateStatus, onConfirmPickup, onCancelOrder }: ViewOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const activeOrders = orders.filter(order => 
    order.status !== 'picked' && order.status !== 'cancelled'
  );
  
  const filteredOrders = activeOrders.filter(order => {
    const studentName = `${order.userId.firstName} ${order.userId.lastName}`;
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleStatusUpdate = (orderId: string, currentStatus: Order['status']) => {
    let newStatus: 'pending' | 'preparing' | 'ready' | 'picked';
    
    if (currentStatus === 'pending') {
      newStatus = 'preparing';
    } else if (currentStatus === 'preparing') {
      newStatus = 'ready';
    } else {
      return;
    }
    
    onUpdateStatus(orderId, newStatus);
  };

  const handleConfirmPickup = (orderId: string, status: Order['status']) => {
    if (status !== 'ready') {
      toast.error('Order must be Ready before confirming pickup');
      return;
    }
    onConfirmPickup(orderId);
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (orderToCancel && onCancelOrder) {
      await onCancelOrder(orderToCancel);
      setShowCancelDialog(false);
      setOrderToCancel(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'picked': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'picked': return 'Completed';
      default: return status;
    }
  };

  // Get image from first item (use same imagePath as student view)
  const getOrderImage = (order: Order) => {
    if (order.items && order.items.length > 0) {
      // This will be handled by matching menu items - for now return null
      return null;
    }
    return null;
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">View Orders</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {searchTerm ? 'No orders found' : 'No current orders'}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Image</TableHead>
                    <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Student</TableHead>
                    <TableHead className="text-xs sm:text-sm">Items</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Time</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Instructions</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const studentName = `${order.userId.firstName} ${order.userId.lastName}`;
                    const itemsList = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
                    return (
                      <TableRow key={order._id}>
                        <TableCell className="p-2 sm:p-4">
                          {order.items[0] && (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">📦</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-semibold">{order.orderId}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell truncate">{studentName}</TableCell>
                        <TableCell className="text-xs sm:text-sm truncate">{itemsList}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{order.pickupTime}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                          {order.specialInstructions ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    <span className="truncate max-w-[100px]">{order.specialInstructions}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{order.specialInstructions}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline" className={`${getStatusColor(order.status)} text-xs`}>
                            {getStatusDisplay(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <div className="flex gap-1 flex-col sm:flex-row">
                            {(order.status === 'pending' || order.status === 'preparing') && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order._id, order.status)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                              >
                                {order.status === 'pending' ? 'Prepare' : 'Ready'}
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPickup(order._id, order.status)}
                                className="bg-green-600 hover:bg-green-700 text-xs h-8"
                              >
                                Pickup
                              </Button>
                            )}
                            {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') && onCancelOrder && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelClick(order._id)}
                                className="text-xs h-8"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}