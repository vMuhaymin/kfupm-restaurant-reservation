import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNavbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold font-display text-primary whitespace-nowrap">KFUPM Restaurant</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth/login")}
              className="text-foreground hover:bg-primary/10"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate("/auth/signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant="ghost"
                onClick={() => handleNavClick("/auth/login")}
                className="w-full justify-start"
              >
                Log In
              </Button>
              <Button
                onClick={() => handleNavClick("/auth/signup")}
                className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}