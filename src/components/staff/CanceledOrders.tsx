import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Search, Trash2 } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";

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
  status: string;
  canceledAt?: string;
  cancelledAt?: string; // Backend uses cancelledAt (double 'l')
  createdAt: string;
}

interface CanceledOrdersProps {
  canceledOrders: Order[];
  onClearAll?: () => void;
}

export function CanceledOrders({ canceledOrders, onClearAll }: CanceledOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const filteredOrders = canceledOrders.filter(order => {
    const studentName = `${order.userId.firstName} ${order.userId.lastName}`;
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCanceledTime = (order: Order) => {
    // Backend uses 'cancelledAt' (double 'l'), but frontend might use 'canceledAt' (single 'l')
    const canceledTime = order.cancelledAt || order.canceledAt;
    if (!canceledTime) return 'N/A';
    return new Date(canceledTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
      setIsClearDialogOpen(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl">Canceled Orders</CardTitle>
            {/* Only show clear button if onClearAll handler is provided (admin/manager only) */}
            {canceledOrders.length > 0 && onClearAll && (
              <Button
                onClick={() => setIsClearDialogOpen(true)}
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Canceled Orders
              </Button>
            )}
          </div>
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
              {searchTerm ? 'No canceled orders found' : 'No canceled orders found'}
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
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Canceled</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
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
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{formatCanceledTime(order)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                            Canceled
                          </Badge>
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

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Canceled Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all <strong>{canceledOrders.length}</strong> canceled order(s)? 
              This action cannot be undone and will remove all canceled orders from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}