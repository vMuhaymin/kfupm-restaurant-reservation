// Shared TypeScript type definitions for the Restaurant Management System

export interface Order {
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

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl: string;
}

export interface User {
  id: string;
  username: string;
  role: 'staff' | 'manager';
  createdAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export interface StudentOrder {
  id: string;
  status: 'Being prepared' | 'Confirmed' | 'Completed' | 'Cancelled';
  pickupTime: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  phone?: string;
  date?: string;
}
