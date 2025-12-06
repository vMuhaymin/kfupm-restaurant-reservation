import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imagePath: string;
}

interface MenuAvailabilityProps {
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
}

export function MenuAvailability({ menuItems, onToggleAvailability }: MenuAvailabilityProps) {
  const handleToggle = (itemId: string, currentStatus: boolean) => {
    onToggleAvailability(itemId);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Menu Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Image</TableHead>
                  <TableHead className="text-xs sm:text-sm">Item</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No menu items found. Please check your connection or contact the manager.
                    </TableCell>
                  </TableRow>
                ) : (
                  menuItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="p-2 sm:p-4">
                        <ImageWithFallback
                          src={`http://localhost:55555/uploads${item.imagePath}`}
                          alt={item.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-semibold truncate">{item.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{item.category}</TableCell>
                      <TableCell className="text-xs sm:text-sm font-semibold">{item.price.toFixed(2)} SAR</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                        <Badge 
                          variant="outline" 
                          className={`${item.isAvailable 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                          } text-xs`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => handleToggle(item._id, item.isAvailable)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}