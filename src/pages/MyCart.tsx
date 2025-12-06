import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Minus, Plus, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { orderAPI, menuAPI, getUser } from "@/lib/api";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export function MyCart() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize editing state synchronously from localStorage
  const getInitialEditingState = () => {
    try {
      const editingOrderStr = localStorage.getItem('editingOrder');
      if (editingOrderStr) {
        const editingOrder = JSON.parse(editingOrderStr);
        return {
          orderId: editingOrder.orderId,
          pickupTime: editingOrder.pickupTime || '',
          specialInstructions: editingOrder.specialInstructions || ''
        };
      }
    } catch (error) {
      console.error('Failed to parse editing order:', error);
    }
    return null;
  };
  
  const initialEditing = getInitialEditingState();
  console.log('[MyCart] Component mount - initialEditing:', initialEditing);
  console.log('[MyCart] Component mount - localStorage editingOrder:', localStorage.getItem('editingOrder'));
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupTime, setPickupTime] = useState(initialEditing?.pickupTime || "");
  const [specialInstructions, setSpecialInstructions] = useState(initialEditing?.specialInstructions || "");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(initialEditing?.orderId || null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [wasEditing, setWasEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!initialEditing?.orderId); // Initialize from localStorage
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Track menu signatures (ID + updatedAt) to detect changes
  const [prevMenuSignatures, setPrevMenuSignatures] = useState<Map<string, string>>(new Map());
  
  console.log('[MyCart] Component mount - isEditMode initialized to:', !!initialEditing?.orderId, 'editingOrderId:', initialEditing?.orderId);

  // Keep isEditMode in sync with localStorage - run on mount, route change, and periodically
  useEffect(() => {
    const checkEditMode = () => {
      try {
        const editingOrderStr = localStorage.getItem('editingOrder');
        console.log('[MyCart checkEditMode] editingOrderStr:', editingOrderStr);
        if (editingOrderStr) {
          const editingOrder = JSON.parse(editingOrderStr);
          const hasOrderId = !!editingOrder.orderId;
          console.log('[MyCart checkEditMode] hasOrderId:', hasOrderId, 'orderId:', editingOrder.orderId);
          setIsEditMode(hasOrderId); // Always set
          // Use functional update to avoid stale closure
          setEditingOrderId(prev => {
            if (hasOrderId && editingOrder.orderId !== prev) {
              console.log('[MyCart checkEditMode] Updating editingOrderId from', prev, 'to', editingOrder.orderId);
              return editingOrder.orderId;
            }
            return prev;
          });
        } else {
          console.log('[MyCart checkEditMode] No editingOrder, setting isEditMode to false');
          setIsEditMode(false);
          setEditingOrderId(prev => {
            if (prev) {
              console.log('[MyCart checkEditMode] Clearing editingOrderId');
              return null;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[MyCart] Error checking edit mode:', error);
        setIsEditMode(false);
      }
    };
    
    // Check immediately on mount and route change
    checkEditMode();
    // Check every 200ms to catch changes quickly
    const interval = setInterval(checkEditMode, 200);
    return () => clearInterval(interval);
  }, [location.pathname]); // Re-run when route changes

  // Function to check and update cart based on menu availability
  const checkAndUpdateCart = useCallback(async (showLoading = false) => {
      // FIRST: Always sync editing state from localStorage (this is the source of truth)
      const editingOrderStr = localStorage.getItem('editingOrder');
      console.log('[MyCart] useEffect - editingOrderStr:', editingOrderStr);
      
      if (editingOrderStr) {
        try {
          const editingOrder = JSON.parse(editingOrderStr);
          console.log('[MyCart] useEffect - Parsed editingOrder:', editingOrder);
          
          // Force update state from localStorage
          if (editingOrder.orderId) {
            console.log('[MyCart] Setting editingOrderId to:', editingOrder.orderId);
            setEditingOrderId(editingOrder.orderId);
            setIsEditMode(true); // Set edit mode flag immediately
            console.log('[MyCart] Set isEditMode to TRUE');
          } else {
            console.log('[MyCart] No orderId in editingOrder, setting isEditMode to false');
            setIsEditMode(false);
          }
          if (pickupTime !== (editingOrder.pickupTime || '')) {
            setPickupTime(editingOrder.pickupTime || '');
          }
          if (specialInstructions !== (editingOrder.specialInstructions || '')) {
            setSpecialInstructions(editingOrder.specialInstructions || '');
          }
        } catch (error) {
          console.error('[MyCart] Failed to parse editing order:', error);
          localStorage.removeItem('editingOrder');
          setEditingOrderId(null);
          setIsEditMode(false);
        }
      } else {
        // No editingOrder in localStorage - clear state
        if (editingOrderId) {
          console.log('[MyCart] No editingOrder in localStorage, clearing state');
          setEditingOrderId(null);
          setPickupTime('');
          setSpecialInstructions('');
          setIsEditMode(false);
        }
      }
      
      // SECOND: Load cart items
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log('[MyCart] useEffect - Cart items:', cart.length);
      
      if (cart.length === 0) {
        setCartItems([]);
        // Only return early if we're NOT editing (if editing, cart might be loading)
        if (!editingOrderStr) {
          return;
        }
      }

      try {
        // Fetch current menu to check availability and get full item details
        const currentMenu = await menuAPI.getMenu();
        
        // Update menu signatures for change detection
        const newMenuSignatures = new Map<string, string>();
        if (Array.isArray(currentMenu)) {
          currentMenu.forEach((item: any) => {
            const signature = item.updatedAt || item.createdAt || '';
            newMenuSignatures.set(item._id, signature);
          });
        }
        setPrevMenuSignatures(newMenuSignatures);
        
        // If editing, we need to match cart items by name and get full details
        const isEditing = !!editingOrderStr;
        
        if (isEditing) {
          // When editing, match cart items by name to get full menu details
          const enrichedCartItems: CartItem[] = cart.map((cartItem: CartItem) => {
            const menuItem = currentMenu.find((menu: any) => menu.name === cartItem.name);
            if (menuItem) {
              return {
                id: menuItem._id, // Use actual menu item ID
                name: menuItem.name,
                description: menuItem.description || '',
                price: menuItem.price,
                quantity: cartItem.quantity,
                image: `http://localhost:55555/uploads${menuItem.imagePath}`
              };
            }
            // If menu item not found, keep cart item as-is
            return cartItem;
          });
          
          // Filter out unavailable items
          const availableCartItems = enrichedCartItems.filter((item: CartItem) => {
            const menuItem = currentMenu.find((menu: any) => menu.name === item.name);
            return menuItem && menuItem.isAvailable;
          });
          
          // Update cart with enriched items
          localStorage.setItem('cart', JSON.stringify(availableCartItems));
          setCartItems(availableCartItems);
          
          // Notify if any items were removed
          if (availableCartItems.length < cart.length) {
            const removedCount = cart.length - availableCartItems.length;
            toast.warning(`${removedCount} item(s) are no longer available and have been removed`);
          }
        } else {
          // Normal cart loading - match by ID
          const availableItemIds = new Set(currentMenu.map((item: any) => item._id));
          
          // Filter out unavailable items
          const availableCartItems = cart.filter((item: CartItem) => 
            availableItemIds.has(item.id)
          );
          
          // If any items were removed, update cart and notify user
          if (availableCartItems.length < cart.length) {
            const removedItems = cart.filter((item: CartItem) => 
              !availableItemIds.has(item.id)
            );
            
            localStorage.setItem('cart', JSON.stringify(availableCartItems));
            setCartItems(availableCartItems);
            
            if (removedItems.length === 1) {
              toast.error(`${removedItems[0].name} is no longer available and has been removed from your cart`);
            } else {
              toast.error(`${removedItems.length} items are no longer available and have been removed from your cart`);
            }
          } else {
            setCartItems(availableCartItems);
          }
        }
      } catch (error) {
        // If menu fetch fails, just load cart as-is
        console.error('Failed to check menu availability:', error);
        setCartItems(cart);
      } finally {
        if (showLoading || isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
  }, [isInitialLoad, pickupTime, specialInstructions, editingOrderId]);
  
  // Load cart from localStorage and check availability on mount
  useEffect(() => {
    checkAndUpdateCart(true);
  }, [checkAndUpdateCart]);

  // Smart polling: Check for menu changes every 5 seconds
  // Detects when items become unavailable and removes them from cart
  useEffect(() => {
    const checkForMenuChanges = async () => {
      try {
        // Fetch current menu (backend filters unavailable items for students)
        const currentMenu = await menuAPI.getMenu();
        
        if (!Array.isArray(currentMenu)) return;
        
        // Get current cart to check if any items are unavailable
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const availableItemIds = new Set(currentMenu.map((item: any) => item._id));
        
        // Check if any cart items are now unavailable
        const hasUnavailableItems = cart.some((item: CartItem) => 
          !availableItemIds.has(item.id)
        );
        
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
        
        // Refresh cart if menu changed OR if cart has unavailable items
        // This ensures we catch cases where items become unavailable
        if (menuChanged || hasUnavailableItems) {
          await checkAndUpdateCart(false);
        }
      } catch (error) {
        // Silently fail - don't spam errors
        console.error('Error checking for menu changes:', error);
      }
    };

    // Start checking after initial load completes
    if (!isInitialLoad) {
      const interval = setInterval(checkForMenuChanges, 5000);
      return () => clearInterval(interval);
    }
  }, [prevMenuSignatures, isInitialLoad, checkAndUpdateCart]);

  // Refresh when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      checkAndUpdateCart(false);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAndUpdateCart]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) => {
      const item = items.find(i => i.id === id);
      if (!item) return items;
      
      const newQuantity = item.quantity + delta;
      
      // If quantity would be 0 or less, remove the item
      if (newQuantity <= 0) {
        const updated = items.filter(i => i.id !== id);
        localStorage.setItem('cart', JSON.stringify(updated));
        toast.success(`${item.name} removed from cart`);
        
        // If cart becomes empty, clear editing state
        if (updated.length === 0) {
          localStorage.removeItem('editingOrder');
          setEditingOrderId(null);
          setPickupTime('');
          setSpecialInstructions('');
          setIsEditMode(false);
        }
        
        return updated;
      }
      
      // Otherwise, update the quantity
      const updated = items.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i
      );
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCartItems((items) => {
      const updated = items.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updated));
      
      // If cart becomes empty, clear editing state
      if (updated.length === 0) {
        localStorage.removeItem('editingOrder');
        setEditingOrderId(null);
        setPickupTime('');
        setSpecialInstructions('');
        setIsEditMode(false);
      }
      
      return updated;
    });
    toast.success("Item removed from cart");
  };

  // Clear editing state if cart becomes empty (but not if we're showing success dialog)
  useEffect(() => {
    if (cartItems.length === 0 && editingOrderId && !showSuccessDialog) {
      localStorage.removeItem('editingOrder');
      setEditingOrderId(null);
      setPickupTime('');
      setSpecialInstructions('');
      setIsEditMode(false);
    }
  }, [cartItems.length, editingOrderId, showSuccessDialog]);

  // Force re-render when localStorage changes (for edit mode detection)
  const [editModeCheck, setEditModeCheck] = useState(0);
  
  // Sync editing state from localStorage on mount and when needed
  useEffect(() => {
    const checkEditMode = () => {
      try {
        const editingOrderStr = localStorage.getItem('editingOrder');
        console.log('[MyCart] Checking edit mode - localStorage:', editingOrderStr);
        if (editingOrderStr) {
          const editingOrder = JSON.parse(editingOrderStr);
          console.log('[MyCart] Parsed editingOrder:', editingOrder);
          if (editingOrder.orderId) {
            if (editingOrder.orderId !== editingOrderId) {
              console.log('[MyCart] Setting editingOrderId from localStorage:', editingOrder.orderId);
              setEditingOrderId(editingOrder.orderId);
            }
            // Always update state to ensure it's in sync
            if (pickupTime !== (editingOrder.pickupTime || '')) {
              setPickupTime(editingOrder.pickupTime || '');
            }
            if (specialInstructions !== (editingOrder.specialInstructions || '')) {
              setSpecialInstructions(editingOrder.specialInstructions || '');
            }
            setEditModeCheck(prev => prev + 1); // Force re-render
            setForceRender(prev => prev + 1); // Force re-render
          }
        } else if (editingOrderId) {
          // localStorage cleared but state still has it
          console.log('[MyCart] Clearing editingOrderId - not in localStorage');
          setEditingOrderId(null);
          setPickupTime('');
          setSpecialInstructions('');
          setEditModeCheck(prev => prev + 1);
          setForceRender(prev => prev + 1);
        }
      } catch (error) {
        console.error('[MyCart] Failed to check edit mode:', error);
      }
    };
    
    // Check immediately on mount
    checkEditMode();
    
    // Listen for storage events (when localStorage changes from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editingOrder') {
        console.log('[MyCart] Storage event detected for editingOrder');
        checkEditMode();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically to catch changes (in case storage event doesn't fire in same tab)
    const interval = setInterval(checkEditMode, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [editingOrderId, pickupTime, specialInstructions]);

  // Always check localStorage to determine if we're editing (computed value)
  const isEditingMode = useMemo(() => {
    try {
      const editingOrderStr = localStorage.getItem('editingOrder');
      console.log('isEditingMode check - localStorage:', editingOrderStr);
      if (editingOrderStr) {
        const editingOrder = JSON.parse(editingOrderStr);
        const isEditing = !!editingOrder.orderId;
        console.log('isEditingMode result:', isEditing, 'orderId:', editingOrder.orderId);
        return isEditing;
      }
    } catch (error) {
      console.error('Failed to check editing mode:', error);
    }
    return false;
  }, [editingOrderId, cartItems.length, editModeCheck]); // Re-compute when these change

  // Get the order ID we're editing (always from localStorage as source of truth)
  const currentEditingOrderId = useMemo(() => {
    try {
      const editingOrderStr = localStorage.getItem('editingOrder');
      if (editingOrderStr) {
        const editingOrder = JSON.parse(editingOrderStr);
        const orderId = editingOrder.orderId || null;
        console.log('currentEditingOrderId:', orderId);
        return orderId;
      }
    } catch (error) {
      console.error('Failed to get editing order ID:', error);
    }
    return null;
  }, [editingOrderId, cartItems.length, editModeCheck]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Generate time slots for each meal period
  const generateTimeSlots = (startHour: number, startMin: number, endHour: number, endMin: number) => {
    const slots: string[] = [];
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const breakfastSlots = generateTimeSlots(6, 0, 8, 30); // 6:00 AM - 8:30 AM
  const lunchSlots = generateTimeSlots(11, 0, 14, 0); // 11:00 AM - 2:00 PM
  const dinnerSlots = generateTimeSlots(18, 0, 20, 30); // 6:00 PM - 8:30 PM

  const allTimeSlots = [
    { label: 'Breakfast', slots: breakfastSlots },
    { label: 'Lunch', slots: lunchSlots },
    { label: 'Dinner', slots: dinnerSlots },
  ];

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!pickupTime) {
      toast.error("Please select a pickup time");
      return;
    }

    const user = getUser();
    if (!user) {
      toast.error("Please login to place an order");
      navigate('/auth/login');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Check if we're editing an existing order
      // Use isEditMode state (which is kept in sync with localStorage) and editingOrderId
      const orderIdToUpdate = editingOrderId || currentEditingOrderId;
      const isEditing = isEditMode && !!orderIdToUpdate;
      
      console.log('[handlePlaceOrder] isEditMode:', isEditMode, 'editingOrderId:', editingOrderId, 'orderIdToUpdate:', orderIdToUpdate, 'isEditing:', isEditing);
      
      // Double-check localStorage as final source of truth
      let finalOrderId: string | null = null;
      try {
        const editingOrderStr = localStorage.getItem('editingOrder');
        if (editingOrderStr) {
          const editingOrder = JSON.parse(editingOrderStr);
          finalOrderId = editingOrder.orderId || null;
          console.log('[handlePlaceOrder] localStorage orderId:', finalOrderId);
        }
      } catch (error) {
        console.error('[handlePlaceOrder] Error reading localStorage:', error);
      }
      
      // Use localStorage value if available, otherwise use state
      const actualOrderId = finalOrderId || orderIdToUpdate;
      const shouldUpdate = isEditing && !!actualOrderId;
      
      console.log('[handlePlaceOrder] FINAL: shouldUpdate:', shouldUpdate, 'actualOrderId:', actualOrderId);
      
      if (shouldUpdate && actualOrderId) {
        // Update existing order
        console.log('[handlePlaceOrder] Updating order:', actualOrderId, 'with items:', orderItems);
        await orderAPI.updateOrder(actualOrderId, {
          items: orderItems,
          pickupTime,
          specialInstructions,
        });

        setSuccessMessage("Your order has been updated!");
        setWasEditing(true);
      } else {
        // Create new order
        await orderAPI.createOrder({
          items: orderItems,
          pickupTime,
          specialInstructions,
        });

        setSuccessMessage("Your order has been placed!");
        setWasEditing(false);
      }

      // Show success dialog first (before clearing cart)
      setShowSuccessDialog(true);
      
     
    } catch (error: any) {
      toast.error(error.message || (editingOrderId ? "Failed to update order" : "Failed to place order"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Don't show empty cart if success dialog is open (cart will be cleared after dialog closes)
  if (cartItems.length === 0 && !showSuccessDialog) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar cartCount={0} />
        <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
          <p className="text-center text-muted-foreground">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-3xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{item.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quantity:
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:bg-foreground/90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price:</p>
                  <p className="font-bold text-lg">{item.price} SAR</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-3xl shadow-md p-4 sm:p-6 sticky top-4 sm:top-8">
            <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">Order Summary</h2>

            <div className="space-y-6">
              <div>
                <label className="font-semibold mb-2 block text-sm sm:text-base">Pickup Time</label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger className="rounded-xl text-sm">
                    <SelectValue placeholder="Select pickup time.." />
                  </SelectTrigger>
                  <SelectContent>
                    {allTimeSlots.map((period) => (
                      <div key={period.label}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {period.label}
                        </div>
                        {period.slots.map((time) => {
                          const [hours, minutes] = time.split(':');
                          const hour24 = parseInt(hours);
                          const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
                          const ampm = hour24 >= 12 ? 'PM' : 'AM';
                          const displayTime = `${hour12}:${minutes} ${ampm}`;
                          return (
                            <SelectItem key={time} value={time}>
                              {displayTime}
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-semibold mb-2 block text-sm sm:text-base">
                  Special Instructions (Optional)
                </label>
                <Textarea
                  placeholder="Any special requests.."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="rounded-xl min-h-[100px] text-sm"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="font-semibold ml-2 flex-shrink-0">
                      {(item.price * item.quantity).toFixed(2)} SAR
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                {/* Show edit mode indicator */}
                {isEditMode && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold">
                      ✏️ Editing Order - Changes will update your existing order
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg sm:text-xl font-bold">Total</span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {total.toFixed(2)} SAR
                  </span>
                </div>

                {(() => {
                  // Always check localStorage directly for button text
                  let buttonIsEditing = isEditMode;
                  let buttonOrderId = editingOrderId || currentEditingOrderId;
                  
                  try {
                    const editingOrderStr = localStorage.getItem('editingOrder');
                    if (editingOrderStr) {
                      const editingOrder = JSON.parse(editingOrderStr);
                      if (editingOrder.orderId) {
                        buttonIsEditing = true;
                        buttonOrderId = editingOrder.orderId;
                      }
                    }
                  } catch (error) {
                    console.error('[Button Render] Error reading localStorage:', error);
                  }
                  
                  console.log('[Button Render] isEditMode:', isEditMode, 'buttonIsEditing:', buttonIsEditing, 'buttonOrderId:', buttonOrderId);
                  
                  return (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-6 rounded-xl text-base sm:text-lg disabled:opacity-50"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                      >
                        {isPlacingOrder 
                          ? (buttonIsEditing ? "Updating Order..." : "Placing Order...") 
                          : (buttonIsEditing ? "Update Order" : "Place Order")}
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <PartyPopper className="h-8 w-8 text-yellow-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">{successMessage}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {wasEditing ? "Your order changes have been saved." : "We'll prepare your order and notify you when it's ready!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                // Clear cart and editing state when closing dialog
                localStorage.removeItem('cart');
                localStorage.removeItem('editingOrder');
                setCartItems([]);
                setEditingOrderId(null);
                setIsEditMode(false);
                setShowSuccessDialog(false);
                navigate('/student/current-orders');
              }}
              className="w-full sm:w-auto bg-black text-white hover:bg-black/90"
            >
              Thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}