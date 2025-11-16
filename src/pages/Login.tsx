
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import loginRes from "@/assets/loginres.png";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Authentication credentials
  const validCredentials = {
    "student@system.com": { password: "student", role: "student", path: "/student/home" },
    "admin@system.com": { password: "admin", role: "manager", path: "/manager/orders" },
    "staff@system.com": { password: "staff", role: "staff", path: "/staff/orders" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = validCredentials[email as keyof typeof validCredentials];

    if (user && user.password === password) {
      // Store user info in localStorage for session management
      localStorage.setItem("user", JSON.stringify({ email, role: user.role }));
      toast.success(`Welcome! Redirecting to ${user.role} dashboard...`);
      navigate(user.path);
    } else {
      toast.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-background flex">
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
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg"
              >
                Log In
              </Button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
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
                  to="/signup"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      
      <div className="hidden md:block w-px bg-border"></div>

      {/* Right Section - Welcome Image */}
      <div className="hidden md:flex md:w-2/3 h-full items-center justify-center p-12 bg-secondary">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={loginRes}
            alt="Welcome to KFUPM Student Restaurant"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

