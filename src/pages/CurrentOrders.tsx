import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  status: "Being prepared" | "Confirmed";
  pickupTime: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  phone: string;
}

export function CurrentOrders() {
  const orders: Order[] = [
    {
      id: "0002",
      status: "Being prepared",
      pickupTime: "2:30 PM",
      items: [{ name: "Vegetable Mixups", quantity: 2, price: 121.0 }],
      total: 121.0,
      phone: "+966####",
    },
    {
      id: "0001",
      status: "Confirmed",
      pickupTime: "2:30 PM",
      items: [
        { name: "Burger", quantity: 2, price: 21.0 },
        { name: "Cola", quantity: 1, price: 5.0 },
      ],
      total: 26.0,
      phone: "+966####",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={0} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4 space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold font-display">Order ID#{order.id}</h2>
                <Badge
                  className={
                    order.status === "Being prepared"
                      ? "bg-[#FFA07A] text-foreground hover:bg-[#FFA07A]/90"
                      : "bg-[#B8C5E0] text-foreground hover:bg-[#B8C5E0]/90"
                  }
                >
                  {order.status}
                </Badge>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-bold text-sm sm:text-base">Pickup Time: {order.pickupTime}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold font-display text-base sm:text-lg mb-4">Order Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between mb-2 text-sm sm:text-base">
                  <span className="truncate">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold ml-2 flex-shrink-0">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-lg sm:text-xl font-bold">Total: </span>
                <span className="text-xl sm:text-2xl font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Call the restaurant {order.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}