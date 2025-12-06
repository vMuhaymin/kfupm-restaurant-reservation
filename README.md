# KFUPM Restaurant Reservation System

A full-stack web application for managing restaurant orders at KFUPM. Built with React, Express.js, and MongoDB.

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, TailwindCSS, shadcn/ui, Vite  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone https://github.com/vMuhaymin/kfupm-restaurant-reservation.git
cd kfupm-restaurant-reservation

# Install frontend
npm install

# Install backend
cd backend && npm install
```

### 2. Configure Backend
Create `backend/.env`:
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=55555
```

### 3. Run
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:55555

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student@system.com` | `student` |
| Staff | `staff@system.com` | `staff` |
| Manager | `admin@system.com` | `admin` |

---

## 📡 API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | Student registration |
| `GET /api/menu` | Get menu items |
| `POST /api/orders` | Create order (Student) |
| `GET /api/orders/current` | Get active orders (Student) |
| `GET /api/staff/orders` | Get all orders (Staff/Manager) |
| `PATCH /api/staff/orders/:id/status` | Update order status |
| `GET /api/manager/users` | Get users (Manager) |
| `GET /api/manager/reports` | Get daily reports (Manager) |

---

## 📁 Project Structure

```
├── backend/
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose schemas (User, Order, MenuItem)
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, upload, validation
│   └── server.js       # Express entry point
│
├── src/
│   ├── pages/          # React pages
│   ├── components/     # UI components
│   ├── lib/api.ts      # API client
│   └── App.tsx         # Main app with routing
```

---

## ✨ Features

**Students:** Browse menu, place orders, track status, view history  
**Staff:** Manage orders, update status, toggle menu availability  
**Managers:** User management, menu CRUD, daily reports, order archiving

---

## 👥 Team

- **Abdul Muhaymin** - Student Dashboard
- **Shaheer Ahmar** - Admin Dashboard  
- **Ali Alsarhayd** - Auth & Staff Dashboard

---

**Version:** 2.0.0 | **Status:** Full-Stack Complete
