import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Archive } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderId?: string; // Added orderId for backend compatibility
  studentName: string;
  items: string[];
  pickupTime: string;
  status: string;
  date: string;
  total: number;
}

interface ArchiveOrdersProps {
  orders: Order[];
  archivedOrders: Order[];
  onArchiveOrders: (daysOld: number) => void;
}

export function ArchiveOrders({ orders, archivedOrders, onArchiveOrders }: ArchiveOrdersProps) {
  const [daysOld, setDaysOld] = useState('30');
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const completedOrders = orders.filter(order => order.status === 'Completed');
  
  const getEligibleOrders = (days: number) => {
    // If days is 0, return all completed orders (for testing)
    if (days === 0) {
      return completedOrders;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return completedOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate < cutoffDate;
    });
  };

  const eligibleOrders = getEligibleOrders(parseInt(daysOld) || 30);

  const handleArchiveClick = () => {
    const days = parseInt(daysOld);
    
    if (isNaN(days) || days < 0) {
      toast.error('Please enter a valid number of days (0 or greater)');
      return;
    }

    if (eligibleOrders.length === 0) {
      toast.error('No completed orders eligible for archiving');
      return;
    }

    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    const days = parseInt(daysOld);
    onArchiveOrders(days);
    setIsArchiveDialogOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Archive Old Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="days" className="text-sm">Archive orders older than (days)</Label>
              <Input
                id="days"
                type="number"
                value={daysOld}
                onChange={(e) => setDaysOld(e.target.value)}
                placeholder="30"
                min="0"
                className="text-sm"
              />
            </div>
            <Button 
              onClick={handleArchiveClick}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
              disabled={eligibleOrders.length === 0}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              <span className="text-blue-600 font-semibold">{eligibleOrders.length}</span> completed orders are eligible for archiving
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Archive</AlertDialogTitle>
            <AlertDialogDescription>
              {parseInt(daysOld) === 0 ? (
                <>
                  Are you sure you want to archive <strong>{eligibleOrders.length}</strong> completed order(s)? 
                  This will move all completed orders to the archive.
                </>
              ) : (
                <>
                  Are you sure you want to archive <strong>{eligibleOrders.length}</strong> completed order(s) 
                  older than <strong>{daysOld}</strong> day(s)? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Archive Orders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {archivedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Archived Orders ({archivedOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Student</TableHead>
                    <TableHead className="text-xs sm:text-sm">Items</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedOrders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs sm:text-sm font-semibold">{order.orderId || order.id}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell truncate">{order.studentName}</TableCell>
                      <TableCell className="text-xs sm:text-sm truncate">{order.items.join(', ')}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs sm:text-sm font-semibold">{order.total.toFixed(2)} SAR</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 text-xs">
                          Archived
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {archivedOrders.length > 10 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center">
                Showing 10 of {archivedOrders.length} archived orders
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}