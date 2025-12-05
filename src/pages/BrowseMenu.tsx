import { useState, useEffect, useCallback } from "react";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { MenuSection } from "@/components/student/MenuSection";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { menuAPI } from "@/lib/api";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imagePath: string;
  isAvailable: boolean;
}

export function BrowseMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  // Track menu signatures (ID + updatedAt) to detect changes
  const [prevMenuSignatures, setPrevMenuSignatures] = useState<Map<string, string>>(new Map());

  // Get cart count from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  }, []);

  const fetchMenu = useCallback(async (showLoading = false) => {
    try {
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }
      const items = await menuAPI.getMenu();
      setMenuItems(items);
      
      // Update menu signatures for change detection
      const newMenuSignatures = new Map<string, string>();
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const signature = item.updatedAt || item.createdAt || '';
          newMenuSignatures.set(item._id, signature);
        });
      }
      setPrevMenuSignatures(newMenuSignatures);
    } catch (error: any) {
      if (showLoading || isInitialLoad) {
        toast.error(error.message || "Failed to load menu");
      }
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenu(true);
  }, [fetchMenu]);

  // Smart polling: Check for menu changes every 5 seconds
  // Detects when items become unavailable (removed from API response) or available again
  useEffect(() => {
    const checkForChanges = async () => {
      try {
        // Fetch current menu (backend filters unavailable items for students)
        const currentMenu = await menuAPI.getMenu();
        
        if (!Array.isArray(currentMenu)) return;
        
        // Check if menu changed (items added, removed, or updated)
        let menuChanged = false;
        const currentMenuSignatures = new Map<string, string>();
        
        // Check current items
        currentMenu.forEach((item: any) => {
          const signature = item.updatedAt || item.createdAt || '';
          currentMenuSignatures.set(item._id, signature);
          
          // Check if this item's updatedAt changed
          const prevSignature = prevMenuSignatures.get(item._id);
          if (prevSignature && prevSignature !== signature) {
            menuChanged = true; // Item was updated
          }
        });
        
        // Check for new items (not in previous signatures)
        if (prevMenuSignatures.size > 0) {
          currentMenu.forEach((item: any) => {
            if (!prevMenuSignatures.has(item._id)) {
              menuChanged = true; // New item available
            }
          });
        }
        
        // Check for removed items (in previous but not in current)
        // This happens when items become unavailable
        if (prevMenuSignatures.size > 0) {
          prevMenuSignatures.forEach((_, itemId) => {
            if (!currentMenuSignatures.has(itemId)) {
              menuChanged = true; // Item became unavailable
            }
          });
        }
        
        // Update signatures
        setPrevMenuSignatures(currentMenuSignatures);
        
        // Refresh if menu changed
        if (menuChanged) {
          await fetchMenu(false);
        }
      } catch (error) {
        // Silently fail - don't spam errors
        console.error('Error checking for menu changes:', error);
      }
    };

    // Start checking after initial load completes
    if (!isInitialLoad) {
      const interval = setInterval(checkForChanges, 5000);
      return () => clearInterval(interval);
    }
  }, [prevMenuSignatures, isInitialLoad, fetchMenu]);

  // Refresh when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchMenu(false);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchMenu]);

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: `http://localhost:55555/uploads${item.imagePath}`,
      soldOut: !item.isAvailable,
    });
    return acc;
  }, {} as Record<string, any[]>);

  const handleAddToCart = (itemId: string) => {
    const item = menuItems.find(i => i._id === itemId);
    if (!item) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((i: any) => i.id === itemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: `http://localhost:55555/uploads${item.imagePath}`,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    toast.success("Item added to cart!");
  };

  // Loading skeleton component
  const MenuItemSkeleton = () => (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-20 mt-4" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartCount} />
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <MenuSection
            key={category}
            title={category}
            items={items}
            onAddToCart={handleAddToCart}
          />
        ))}
        {menuItems.length === 0 && (
          <p className="text-center text-muted-foreground">No menu items available</p>
        )}
      </div>
    </div>
  );
}