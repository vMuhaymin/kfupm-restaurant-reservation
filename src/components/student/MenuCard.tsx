import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  soldOut?: boolean;
  onAddToCart: () => void;
}

export function MenuCard({ name, description, price, image, soldOut, onAddToCart }: MenuCardProps) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow flex flex-col h-full">
      <div className="relative flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-40 sm:h-48 object-cover"
        />
        {soldOut && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-destructive text-destructive-foreground px-2 sm:px-3 py-1 rounded-md text-xs font-bold">
            SOLD OUT
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-card-foreground mb-1 text-sm sm:text-base line-clamp-2">{name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-grow">{description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-semibold text-card-foreground text-sm sm:text-base">{price.toFixed(2)} SAR</span>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-7 h-7 sm:w-8 sm:h-8"
            onClick={onAddToCart}
            disabled={soldOut}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}