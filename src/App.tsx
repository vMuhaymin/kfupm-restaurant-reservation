import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import SignUp from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { CheckEmail } from "./pages/CheckEmail";
import { SetNewPassword } from "./pages/SetNewPassword";
import { Home } from "./pages/Home";
import { BrowseMenu } from "./pages/BrowseMenu";
import { MyCart } from "./pages/MyCart";
import { EditCart } from "./pages/EditCart";
import { CurrentOrders } from "./pages/CurrentOrders";
import { OrderHistory } from "./pages/OrderHistory";
import { StaffDashboard } from "./pages/StaffDashboard";
import { ManagerDashboard as AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Authentication Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/check-email" element={<CheckEmail />} />
          <Route path="/auth/set-new-password" element={<SetNewPassword />} />
          
          {/* Student Dashboard Routes */}
          <Route 
            path="/student/home" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/menu" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <BrowseMenu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/cart" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyCart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/edit-cart" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <EditCart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/current-orders" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CurrentOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/order-history" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          
          {/* Staff Dashboard Routes */}
          <Route 
            path="/staff/*" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'manager']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Manager Dashboard Routes */}
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;