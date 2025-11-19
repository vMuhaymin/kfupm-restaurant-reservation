import { useState } from "react";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { MenuSection } from "@/components/student/MenuSection";
import { toast } from "sonner";
import roastedCorn from "@/assets/roasted-corn.jpg";
import asparagusSalad from "@/assets/asparagus-salad.jpg";
import shrimpSkewers from "@/assets/shrimp-skewers.jpg";
import wrapSandwich from "@/assets/wrap-sandwich.jpg";

export function BrowseMenu() {
  const [cartCount, setCartCount] = useState(2);

  const mainCourseItems = [
    {
      id: "mc-1",
      name: "Roasted Corn",
      description: "Description",
      price: 15.0,
      image: roastedCorn,
    },
    {
      id: "mc-2",
      name: "Organic Asparagus",
      description: "Description",
      price: 16.0,
      image: asparagusSalad,
    },
    {
      id: "mc-3",
      name: "Purple Onion",
      description: "Description",
      price: 18.0,
      image: shrimpSkewers,
      soldOut: true,
    },
    {
      id: "mc-4",
      name: "Cherry Tomato",
      description: "Description",
      price: 14.0,
      image: wrapSandwich,
    },
  ];

  const appetizerItems = [
    {
      id: "ap-1",
      name: "Roasted Corn",
      description: "Description",
      price: 15.0,
      image: roastedCorn,
    },
    {
      id: "ap-2",
      name: "Organic Asparagus",
      description: "Description",
      price: 16.0,
      image: asparagusSalad,
    },
    {
      id: "ap-3",
      name: "Purple Onion",
      description: "Description",
      price: 18.0,
      image: shrimpSkewers,
      soldOut: true,
    },
    {
      id: "ap-4",
      name: "Cherry Tomato",
      description: "Description",
      price: 14.0,
      image: wrapSandwich,
    },
  ];

  const beverageItems = [
    {
      id: "bv-1",
      name: "Roasted Corn",
      description: "Description",
      price: 15.0,
      image: roastedCorn,
    },
    {
      id: "bv-2",
      name: "Organic Asparagus",
      description: "Description",
      price: 16.0,
      image: asparagusSalad,
    },
    {
      id: "bv-3",
      name: "Purple Onion",
      description: "Description",
      price: 18.0,
      image: shrimpSkewers,
      soldOut: true,
    },
    {
      id: "bv-4",
      name: "Cherry Tomato",
      description: "Description",
      price: 14.0,
      image: wrapSandwich,
    },
  ];

  const handleAddToCart = (itemId: string) => {
    setCartCount((prev) => prev + 1);
    toast.success("Item added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar cartCount={cartCount} />
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
        <MenuSection
          title="Main Course"
          items={mainCourseItems}
          onAddToCart={handleAddToCart}
        />
        <MenuSection
          title="Appetizers"
          items={appetizerItems}
          onAddToCart={handleAddToCart}
        />
        <MenuSection
          title="Beverages"
          items={beverageItems}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}