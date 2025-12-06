import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  userRole: 'staff' | 'manager';
  currentPath: string;
}

export function Navbar({ userRole, currentPath }: NavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const staffPages = [
    { path: '/staff/orders', label: 'View Orders' },
    { path: '/staff/cancelled-orders', label: 'Cancelled Orders' },
    { path: '/staff/menu-availability', label: 'Menu Availability' },
  ];

  const managerPages = [
    { path: '/manager/orders', label: 'View Orders' },
    { path: '/manager/cancelled-orders', label: 'Cancelled Orders' },
    { path: '/manager/menu-management', label: 'Menu Management' },
    { path: '/manager/daily-reports', label: 'Daily Reports' },
    { path: '/manager/user-management', label: 'User Management' },
    { path: '/manager/archive', label: 'Archive Orders' },
  ];

  const pages = userRole === 'manager' ? managerPages : staffPages;

  const isActive = (pagePath: string) => {
    return currentPath === pagePath;
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
              {pages.map((page) => (
                <Button
                  key={page.path}
                  variant={isActive(page.path) ? 'default' : 'ghost'}
                  onClick={() => navigate(page.path)}
                  className={isActive(page.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
                >
                  {page.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-muted-foreground text-sm">Role: <span className="font-semibold text-foreground">{userRole === 'manager' ? 'Admin' : 'Staff'}</span></span>
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
              {pages.map((page) => (
                <Button
                  key={page.path}
                  variant={isActive(page.path) ? 'default' : 'ghost'}
                  onClick={() => handleNavClick(page.path)}
                  className={`w-full justify-start ${isActive(page.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                >
                  {page.label}
                </Button>
              ))}
              <div className="px-2 py-2 text-sm text-muted-foreground">
                Role: <span className="font-semibold text-foreground">{userRole === 'manager' ? 'Admin' : 'Staff'}</span>
              </div>
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