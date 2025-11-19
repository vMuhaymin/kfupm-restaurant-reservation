import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/student/Navbar";
import { ViewOrders } from "@/components/staff/ViewOrders";
import { CanceledOrders } from "@/components/staff/CanceledOrders";
import { MenuAvailability } from "@/components/staff/MenuAvailability";

interface Order {
  id: string;
  studentName: string;
  items: string[];
  pickupTime: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Canceled';
  date: string;
  total: number;
  canceledAt?: string;
  imageUrl?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl: string;
}

export function StaffDashboard() {
  const location = useLocation();
  
  // Mock data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      studentName: 'John Smith',
      items: ['Burger', 'Fries', 'Soda'],
      pickupTime: '12:30 PM',
      status: 'Pending',
      date: '2025-11-08',
      total: 12.50,
      imageUrl: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400',
    },
    {
      id: 'ORD002',
      studentName: 'Emma Wilson',
      items: ['Salad', 'Juice'],
      pickupTime: '1:00 PM',
      status: 'Preparing',
      date: '2025-11-08',
      total: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1677653805080-59c57727c84e?w=400',
    },
    {
      id: 'ORD003',
      studentName: 'Michael Brown',
      items: ['Pizza', 'Soda'],
      pickupTime: '1:15 PM',
      status: 'Ready',
      date: '2025-11-08',
      total: 10.00,
      imageUrl: 'https://images.unsplash.com/photo-1703073186021-021fb5a0bde1?w=400',
    },
  ]);

  const [canceledOrders, setCanceledOrders] = useState<Order[]>([
    {
      id: 'ORD006',
      studentName: 'Lisa Anderson',
      items: ['Burger', 'Shake'],
      pickupTime: '2:00 PM',
      status: 'Canceled',
      date: '2025-11-08',
      total: 9.50,
      canceledAt: '10:45 AM',
      imageUrl: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400',
    },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 'ITEM001', name: 'Burger', price: 5.99, category: 'Main Course', available: true, imageUrl: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400' },
    { id: 'ITEM002', name: 'Pizza', price: 8.99, category: 'Main Course', available: true, imageUrl: 'https://images.unsplash.com/photo-1703073186021-021fb5a0bde1?w=400' },
    { id: 'ITEM003', name: 'Salad', price: 6.50, category: 'Appetizer', available: true, imageUrl: 'https://images.unsplash.com/photo-1677653805080-59c57727c84e?w=400' },
    { id: 'ITEM004', name: 'Fries', price: 2.99, category: 'Side Dish', available: true, imageUrl: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=400' },
    { id: 'ITEM005', name: 'Soda', price: 1.99, category: 'Beverage', available: true, imageUrl: 'https://images.unsplash.com/photo-1610873167013-2dd675d30ef4?w=400' },
    { id: 'ITEM006', name: 'Sandwich', price: 4.99, category: 'Main Course', available: false, imageUrl: 'https://images.unsplash.com/photo-1673534409216-91c3175b9b2d?w=400' },
  ]);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleConfirmPickup = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'Completed' } : order
    ));
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" currentPath={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate to="/staff/orders" replace />} />
        <Route 
          path="/orders" 
          element={
            <ViewOrders 
              orders={orders.filter(o => o.status !== 'Canceled') as any}
              onUpdateStatus={handleUpdateStatus}
              onConfirmPickup={handleConfirmPickup}
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