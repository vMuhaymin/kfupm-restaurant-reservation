import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:55555/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your account has been created successfully! Please login.");
        // Redirect to login page
        navigate('/login');
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to create account. Please check your connection and try again.");
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 border-b border-border">
        <h1 className="text-2xl font-bold font-display">KFUPM Restaurant</h1>
      </div>
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold font-display text-center mb-8">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First name</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last name</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Re-enter password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg mt-6 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create your account"}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              By creating an account, you agree to KFUPM<br />
              Student Cafeteria's Term and Conditions
            </p>
          </form>
          
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-muted-foreground text-sm">Do you have an account? </span>
            <Link to="/login" className="text-accent hover:underline text-sm font-medium">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


