import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface Order {
  id: string;
  studentName: string;
  items: string[];
  pickupTime: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed';
  imageUrl?: string;
}

interface ViewOrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onConfirmPickup: (orderId: string) => void;
}

export function ViewOrders({ orders, onUpdateStatus, onConfirmPickup }: ViewOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrders = orders.filter(order => order.status !== 'Completed');
  
  const filteredOrders = activeOrders.filter(order => 
    order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = (orderId: string, currentStatus: Order['status']) => {
    let newStatus: Order['status'];
    
    if (currentStatus === 'Pending') {
      newStatus = 'Preparing';
    } else if (currentStatus === 'Preparing') {
      newStatus = 'Ready';
    } else {
      return;
    }
    
    onUpdateStatus(orderId, newStatus);
    toast.success('Order status updated successfully');
  };

  const handleConfirmPickup = (orderId: string, status: Order['status']) => {
    if (status !== 'Ready') {
      toast.error('Order must be Ready before confirming pickup');
      return;
    }
    onConfirmPickup(orderId);
    toast.success('Pickup confirmed - Order completed');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="p-2 sm:p-4">
                        {order.imageUrl && (
                          <ImageWithFallback
                            src={order.imageUrl}
                            alt={order.items[0]}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-semibold">{order.id}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell truncate">{order.studentName}</TableCell>
                      <TableCell className="text-xs sm:text-sm truncate">{order.items.join(', ')}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{order.pickupTime}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className={`${getStatusColor(order.status)} text-xs`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex gap-1 flex-col sm:flex-row">
                          {(order.status === 'Pending' || order.status === 'Preparing') && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, order.status)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                            >
                              {order.status === 'Pending' ? 'Prepare' : 'Ready'}
                            </Button>
                          )}
                          {order.status === 'Ready' && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPickup(order.id, order.status)}
                              className="bg-green-600 hover:bg-green-700 text-xs h-8"
                            >
                              Pickup
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
