import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export function SetNewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const code = (location.state as { code?: string })?.code || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    if (!email || !code) {
      toast.error("Missing email or code. Please start over.");
      navigate("/forgot-password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { authAPI } = await import('@/lib/api');
      await authAPI.changePassword(email, code, password);
      
      toast.success("Your password has been successfully updated!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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
          <Link 
            to="/check-email" 
            className="inline-flex items-center text-accent hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
          
          <h2 className="text-3xl font-bold font-display mb-4">Set a new password</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Create a new password. Ensure it differs from previous ones for security
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-12 bg-background border-border rounded-lg"
                required
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}