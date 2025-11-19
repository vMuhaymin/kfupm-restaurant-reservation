import { useState } from "react";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import PaymentDialog from "@/components/student/PaymentDialog";
import vegetableMixups from "@/assets/vegetable-mixups.jpg";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export function MyCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Vegetable Mixups",
      description: "Vegetable Fritters with Egg",
      price: 60.5,
      quantity: 1,
      image: vegetableMixups,
    },

  ]);

  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartItems.length} />

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
                  <p className="font-bold text-lg">${item.price}</p>
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
                <Input
                  type="text"
                  placeholder="Select pickup time.."
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="rounded-xl text-sm"
                />
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
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg sm:text-xl font-bold">Total</span>
                  <span className="text-xl sm:text-2xl font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-6 rounded-xl text-base sm:text-lg"
                  onClick={() => setIsPaymentOpen(true)}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
      />
    </div>
  );
}