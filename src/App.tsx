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
import { CurrentOrders } from "./pages/CurrentOrders";
import { OrderHistory } from "./pages/OrderHistory";
import { StaffDashboard } from "./pages/StaffDashboard";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          
          {/* Student Dashboard Routes */}
          <Route path="/student/home" element={<Home />} />
          <Route path="/student/menu" element={<BrowseMenu />} />
          <Route path="/student/cart" element={<MyCart />} />
          <Route path="/student/current-orders" element={<CurrentOrders />} />
          <Route path="/student/order-history" element={<OrderHistory />} />
          
          {/* Staff Dashboard Routes */}
          <Route path="/staff/*" element={<StaffDashboard />} />
          
          {/* Manager Dashboard Routes */}
          <Route path="/manager/*" element={<ManagerDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
