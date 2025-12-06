import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Button } from "@/components/ui/button";
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
import { Minus, Plus, PartyPopper, ShoppingCart, X } from "lucide-react";
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

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imagePath: string;
  isAvailable: boolean;
}

export function EditCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Calculate cart count from localStorage (My Cart), not from EditCart items
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (error) {
        setCartCount(0);
      }
    };
    
    updateCartCount();
    // Update cart count periodically to catch changes from other pages
    const interval = setInterval(updateCartCount, 500);
    return () => clearInterval(interval);
  }, []);

  // Load order data on mount
  useEffect(() => {
    const loadOrderForEdit = async () => {
      try {
        // Get order ID from localStorage (set by CurrentOrders when Edit is clicked)
        const editingOrderStr = localStorage.getItem('editingOrder');
        if (!editingOrderStr) {
          toast.error('No order selected for editing');
          navigate('/student/current-orders');
          return;
        }

        const editingOrder = JSON.parse(editingOrderStr);
        const orderIdToEdit = editingOrder.orderId;
        
        if (!orderIdToEdit) {
          toast.error('Invalid order ID');
          navigate('/student/current-orders');
          return;
        }

        setOrderId(orderIdToEdit);
        setPickupTime(editingOrder.pickupTime || '');
        setSpecialInstructions(editingOrder.specialInstructions || '');

        // Fetch the full order details
        const order = await orderAPI.getOrder(orderIdToEdit);
        
        // Load menu to get full item details
        const menu = await menuAPI.getMenu();
        
        // Map order items to cart format with full details
        const items: CartItem[] = order.items.map((item: any) => {
          const menuItem = menu.find((m: MenuItem) => m.name === item.name);
          return {
            id: menuItem?._id || `edit-${item.name}`,
            name: item.name,
            description: menuItem?.description || '',
            price: item.price,
            quantity: item.quantity,
            image: menuItem ? `http://localhost:55555/uploads${menuItem.imagePath}` : ''
          };
        });

        setCartItems(items);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading order for edit:', error);
        toast.error(error.message || 'Failed to load order for editing');
        navigate('/student/current-orders');
      }
    };

    loadOrderForEdit();
  }, [navigate]);

  // Load menu items for the menu dialog
  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const menu = await menuAPI.getMenu();
      // Only show available items
      const availableItems = menu.filter((item: MenuItem) => item.isAvailable);
      setMenuItems(availableItems);
    } catch (error: any) {
      toast.error('Failed to load menu items');
      console.error('Error loading menu:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleOpenMenu = () => {
    setShowMenuDialog(true);
    if (menuItems.length === 0) {
      loadMenuItems();
    }
  };

  const addItemFromMenu = (menuItem: MenuItem) => {
    const existingItem = cartItems.find(item => item.id === menuItem._id);
    
    if (existingItem) {
      // If item already exists, increase quantity
      setCartItems(items =>
        items.map(item =>
          item.id === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`${menuItem.name} quantity increased`);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: menuItem._id,
        name: menuItem.name,
        description: menuItem.description || '',
        price: menuItem.price,
        quantity: 1,
        image: `http://localhost:55555/uploads${menuItem.imagePath}`
      };
      setCartItems(items => [...items, newItem]);
      toast.success(`${menuItem.name} added to cart`);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) => {
      const item = items.find(i => i.id === id);
      if (!item) return items;
      
      const newQuantity = item.quantity + delta;
      
      // If quantity would be 0 or less, remove the item
      if (newQuantity <= 0) {
        const updated = items.filter(i => i.id !== id);
        toast.success(`${item.name} removed from cart`);
        return updated;
      }
      
      // Otherwise, update the quantity
      return items.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeItem = (id: string) => {
    setCartItems((items) => {
      const item = items.find(i => i.id === id);
      const updated = items.filter(item => item.id !== id);
      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
      return updated;
    });
  };

  const handleUpdateOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!pickupTime) {
      toast.error("Please select a pickup time");
      return;
    }

    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }

    const user = getUser();
    if (!user) {
      toast.error("Please login to update an order");
      navigate('/auth/login');
      return;
    }

    setIsUpdatingOrder(true);

    try {
      const orderItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      await orderAPI.updateOrder(orderId, {
        items: orderItems,
        pickupTime,
        specialInstructions,
      });

      // Clear editing state
      localStorage.removeItem('editingOrder');
      
      setShowSuccessDialog(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

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

  const breakfastSlots = generateTimeSlots(6, 0, 8, 30);
  const lunchSlots = generateTimeSlots(11, 0, 14, 0);
  const dinnerSlots = generateTimeSlots(18, 0, 20, 30);

  const allTimeSlots = [
    { label: 'Breakfast', slots: breakfastSlots },
    { label: 'Lunch', slots: lunchSlots },
    { label: 'Dinner', slots: dinnerSlots },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
          <p className="text-center text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Edit Order</h1>
          <p className="text-muted-foreground">Modify your order items, pickup time, or special instructions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Items Button */}
            <div className="bg-card rounded-3xl shadow-md p-4 sm:p-6">
              <Button
                onClick={handleOpenMenu}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                variant="default"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add Items from Menu
              </Button>
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="bg-card rounded-3xl shadow-md p-8 text-center">
                <p className="text-muted-foreground">Your cart is empty. Add items from the menu.</p>
              </div>
            ) : (
              cartItems.map((item) => (
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
                      <p className="text-sm text-muted-foreground mb-2">Quantity:</p>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
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
                      <span className="truncate">{item.name} x{item.quantity}</span>
                      <span className="font-semibold ml-2 flex-shrink-0">
                        {(item.price * item.quantity).toFixed(2)} SAR
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg sm:text-xl font-bold">Total</span>
                    <span className="text-xl sm:text-2xl font-bold">
                      {total.toFixed(2)} SAR
                    </span>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-6 rounded-xl text-base sm:text-lg disabled:opacity-50"
                    onClick={handleUpdateOrder}
                    disabled={isUpdatingOrder}
                  >
                    {isUpdatingOrder ? "Updating Order..." : "Update Order"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Dialog */}
      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Items from Menu</DialogTitle>
            <DialogDescription>
              Select items to add to your order
            </DialogDescription>
          </DialogHeader>
          
          {loadingMenu ? (
            <div className="py-8 text-center text-muted-foreground">Loading menu...</div>
          ) : menuItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No items available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => addItemFromMenu(item)}
                >
                  <img
                    src={`http://localhost:55555/uploads${item.imagePath}`}
                    alt={item.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-sm font-bold mt-1">{item.price} SAR</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <PartyPopper className="h-8 w-8 text-yellow-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Your order has been updated!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Your order changes have been saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
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