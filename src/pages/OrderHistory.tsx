import { StudentNavbar } from "@/components/student/StudentNavbar";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  status: "Completed" | "Cancelled";
  pickupTime: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  date: string;
}

export function OrderHistory() {
  const orders: Order[] = [
    {
      id: "0010",
      status: "Completed",
      pickupTime: "1:00 PM",
      items: [
        { name: "Roasted Corn", quantity: 1, price: 15.0 },
        { name: "Organic Asparagus", quantity: 2, price: 32.0 },
      ],
      total: 47.0,
      date: "2024-03-15",
    },
    {
      id: "0009",
      status: "Completed",
      pickupTime: "12:30 PM",
      items: [{ name: "Cherry Tomato", quantity: 3, price: 42.0 }],
      total: 42.0,
      date: "2024-03-14",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={0} />

      <div className="max-w-7xl mx-auto mt-8 py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-8">Order History</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-3xl shadow-md p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold font-display">Order ID#{order.id}</h2>
                  <Badge
                    className={
                      order.status === "Completed"
                        ? "bg-green-500 text-primary-foreground hover:bg-green-500/90"
                        : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">{order.date}</p>
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
                    <span className="font-semibold ml-2 flex-shrink-0">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold">Total: </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}