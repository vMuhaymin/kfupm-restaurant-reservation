import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  studentName: string;
  items: string[];
  pickupTime: string;
  status: string;
  date: string;
  total: number;
}

interface DailyReportsProps {
  orders: Order[];
}

export function DailyReports({ orders }: DailyReportsProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportGenerated, setReportGenerated] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  const filteredOrders = orders.filter(order => order.date === selectedDate);
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = filteredOrders.filter(order => order.status === 'Completed').length;

  const handleGenerateReport = () => {
    if (!selectedDate) {
      toast.error('Date range must not be empty');
      return;
    }
    setReportGenerated(true);
    toast.success('Report generated successfully');
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Daily Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date" className="text-sm">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setReportGenerated(false);
                }}
                max={today}
                className="text-sm"
              />
            </div>
            <Button 
              onClick={handleGenerateReport}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
            >
              Generate Report
            </Button>
          </div>

          {reportGenerated && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl">{totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl">{totalRevenue.toFixed(2)} SAR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completed Orders</p>
                        <p className="text-2xl">{completedOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders:</span>
                      <span>{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Orders:</span>
                      <span>{completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending/In Progress:</span>
                      <span>{totalOrders - completedOrders}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="text-blue-600">{totalRevenue.toFixed(2)} SAR</span>
                    </div>
                    {totalOrders > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Order Value:</span>
                        <span>{(totalRevenue / totalOrders).toFixed(2)} SAR</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}