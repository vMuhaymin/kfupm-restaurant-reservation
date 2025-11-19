import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface Order {
  id: string;
  studentName: string;
  items: string[];
  pickupTime: string;
  status: string;
  canceledAt?: string;
  imageUrl?: string;
}

interface CanceledOrdersProps {
  canceledOrders: Order[];
}

export function CanceledOrders({ canceledOrders }: CanceledOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = canceledOrders.filter(order => 
    order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Canceled Orders</CardTitle>
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
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{order.canceledAt || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                          Canceled
                        </Badge>
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
