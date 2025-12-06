import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authAPI, getUser } from "@/lib/api";
import loginRes from "@/assets/loginres.png";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the page user was trying to access (if redirected from ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || null;

  // Role-based navigation paths
  const getRolePath = (role: string) => {
    switch (role) {
      case "student":
        return "/student/menu";  // Redirect to menu page, not home (which is the landing page)
      case "staff":
        return "/staff/orders";
      case "manager":
        return "/manager/orders";
      default:
        return "/student/menu";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const data = await authAPI.login({ email, password });
      console.log('Login API response:', data);

      if (!data) {
        throw new Error('No data received from server');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      if (!data.role) {
        throw new Error('No role received from server');
      }

      // Validate role is one of the expected values
      const validRoles = ['student', 'staff', 'manager'];
      if (!validRoles.includes(data.role.toLowerCase())) {
        console.error('Invalid role received:', data.role);
        throw new Error(`Invalid user role: ${data.role}`);
      }

      // Prepare user data object
      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role.toLowerCase().trim(), // Normalize role to lowercase
      };

      // Store token and user info in localStorage
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        throw new Error('Failed to store authentication data. Please check your browser settings.');
      }

      // Verify data was stored correctly
      const storedToken = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      console.log('Verification - Stored token:', !!storedToken, 'Stored user:', !!storedUserStr);

      if (!storedToken || !storedUserStr) {
        throw new Error('Failed to store authentication data');
      }

      // Verify the stored user data can be parsed and has required fields
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (!storedUser.role || !storedUser._id || !storedUser.email) {
          throw new Error('Stored user data is incomplete');
        }
        console.log('Stored user data verified:', { role: storedUser.role, email: storedUser.email });
      } catch (parseError) {
        console.error('Error parsing stored user data:', parseError);
        throw new Error('Failed to verify stored authentication data');
      }

      // Redirect to the page user was trying to access, or to their role's default page
      const redirectPath = from || getRolePath(data.role);
      console.log('Redirect path determined:', redirectPath, 'from:', from, 'role:', data.role);
      
      // Show success message
      toast.success(`Welcome! Redirecting to ${data.role} dashboard...`);
      
      // Use React Router's navigate for SPA navigation (no full page reload)
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      
      // Better error handling - show specific error messages
      const errorMessage = error.message || "Failed to login. Please check your connection and try again.";
      console.error('Error message:', errorMessage);
      
      // Check if it's a network/connection error
      if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Cannot connect')) {
        toast.error("Cannot connect to server. Please make sure the backend is running on https://kfupm-restaurant-reservation.onrender.com");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/3 h-full flex flex-col p-8 bg-background">
        <h1 className="text-2xl font-bold font-display mb-12 text-foreground">
          KFUPM Restaurant
        </h1>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold font-display text-center mb-8 text-foreground">
              Log In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background border-border rounded-lg"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background border-border rounded-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center">
                <Link
                  to="/auth/forgot-password"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-muted-foreground text-sm">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="text-center">
                <span className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/auth/signup"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Welcome Image */}
      <div className="hidden md:flex md:w-2/3 h-full bg-secondary overflow-hidden">
        <img
          src={loginRes}
          alt="Welcome to KFUPM Student Restaurant"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}