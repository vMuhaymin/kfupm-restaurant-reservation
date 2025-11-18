import { MenuCard } from "./MenuCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  soldOut?: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  onAddToCart: (itemId: string) => void;
}

export function MenuSection({ title, items, onAddToCart }: MenuSectionProps) {
  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-4 sm:mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            soldOut={item.soldOut}
            onAddToCart={() => onAddToCart(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
