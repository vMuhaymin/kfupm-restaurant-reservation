import { useState } from "react";
import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface StudentNavbarProps {
  cartCount?: number;
}

export function StudentNavbar({ cartCount = 0 }: StudentNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/student/menu', label: 'Browse Menu' },
    { path: '/student/current-orders', label: 'Current Orders' },
    { path: '/student/order-history', label: 'Order History' },
    { path: '/student/cart', label: 'My Cart' },
  ];

  const isActive = (pagePath: string) => {
    return location.pathname === pagePath;
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold font-display text-primary whitespace-nowrap">KFUPM Restaurant</h1>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  onClick={() => navigate(item.path)}
                  className={isActive(item.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
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
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full justify-start ${isActive(item.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                >
                  {item.label}
                </Button>
              ))}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full justify-start border-primary text-primary hover:bg-primary/10 mt-2"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}