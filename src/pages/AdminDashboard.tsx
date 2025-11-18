import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/student/Navbar";
import { ViewOrders } from "@/components/staff/ViewOrders";
import { CanceledOrders } from "@/components/staff/CanceledOrders";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { DailyReports } from "@/components/admin/DailyReports";
import { UserManagement } from "@/components/admin/UserManagement";
import { ArchiveOrders } from "@/components/admin/ArchiveOrders";

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

interface User {
  id: string;
  username: string;
  role: 'staff' | 'manager';
  createdAt: string;
}

export function ManagerDashboard() {
  const location = useLocation();

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
    {
      id: 'ORD004',
      studentName: 'Sarah Davis',
      items: ['Sandwich', 'Coffee'],
      pickupTime: '11:30 AM',
      status: 'Completed',
      date: '2025-11-08',
      total: 7.50,
      imageUrl: 'https://images.unsplash.com/photo-1673534409216-91c3175b9b2d?w=400',
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
    { id: 'ITEM007', name: 'Pasta', price: 7.50, category: 'Main Course', available: true, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
    { id: 'ITEM008', name: 'Ice Cream', price: 3.50, category: 'Dessert', available: true, imageUrl: 'https://images.unsplash.com/photo-1663904458920-f153c162fa79?w=400' },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 'USER001', username: 'staff1', role: 'staff', createdAt: '2025-01-15' },
    { id: 'USER002', username: 'manager1', role: 'manager', createdAt: '2025-01-10' },
    { id: 'USER003', username: 'staff2', role: 'staff', createdAt: '2025-02-20' },
  ]);

  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);

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

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `ITEM${String(menuItems.length + 1).padStart(3, '0')}`,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const handleEditMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems(menuItems.filter(item => item.id !== itemId));
  };

  const handleAddUser = (user: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    const newUser: User = {
      id: `USER${String(users.length + 1).padStart(3, '0')}`,
      username: user.username,
      role: user.role,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleArchiveOrders = (daysOld: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const toArchive = orders.filter(order => {
      const orderDate = new Date(order.date);
      return order.status === 'Completed' && orderDate < cutoffDate;
    });

    setArchivedOrders([...archivedOrders, ...toArchive]);
    setOrders(orders.filter(order => !toArchive.includes(order)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="manager" currentPath={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate to="/manager/orders" replace />} />
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
          path="/menu-management" 
          element={
            <MenuManagement 
              menuItems={menuItems}
              onAddItem={handleAddMenuItem}
              onEditItem={handleEditMenuItem}
              onDeleteItem={handleDeleteMenuItem}
            />
          } 
        />
        <Route 
          path="/daily-reports" 
          element={<DailyReports orders={[...orders, ...canceledOrders]} />} 
        />
        <Route 
          path="/user-management" 
          element={
            <UserManagement 
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          } 
        />
        <Route 
          path="/archive" 
          element={
            <ArchiveOrders 
              orders={orders}
              archivedOrders={archivedOrders}
              onArchiveOrders={handleArchiveOrders}
            />
          } 
        />
      </Routes>
    </div>
  );
}
