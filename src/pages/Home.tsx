import { LandingNavbar } from "@/components/common/LandingNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import chefHero from "@/assets/chef-hero.jpg";

export function Home() {
  const navigate = useNavigate();

  const scrollToAboutUs = () => {
    const aboutUsSection = document.getElementById('about-us');
    if (aboutUsSection) {
      aboutUsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] sm:h-[100vh] bg-black">
        <img
          src={chefHero}
          alt="Professional chef preparing food"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex flex-col justify-center">
            <p className="text-primary-foreground text-xs sm:text-sm font-medium mb-4 border-b-2 border-primary-foreground pb-1 w-fit">
              RESERVATION
            </p>
            <h1 className="text-primary-foreground text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
              KFUPM RESTAURANT
            </h1>
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
              <Button 
                onClick={() => navigate("/auth/login")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 w-full sm:w-auto"
              >
                GET STARTED
              </Button>
              <Button 
                variant="outline" 
                onClick={scrollToAboutUs}
                className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary px-6 sm:px-8 w-full sm:w-auto"
              >
                ABOUT US
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="about-us" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display mb-8 sm:mb-12">Know more about us!</h2>
        
        <div className="bg-primary rounded-3xl p-6 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 flex items-center justify-center lg:justify-start">
              <div className="bg-card rounded-full px-6 sm:px-8 py-3 sm:py-4 text-center">
                <p className="font-semibold text-xs sm:text-sm text-foreground">How does KFUPM</p>
                <p className="font-semibold text-xs sm:text-sm text-foreground">RESTAURANT work?</p>
              </div>
            </div>

            {/* Right Columns - 3 Info Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="bg-secondary rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="font-bold mb-2 text-foreground">Place an Order!</h3>
                <p className="text-sm text-muted-foreground">
                  Place order through our website
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-secondary rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">🍔</div>
                <h3 className="font-bold mb-2 text-foreground">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Your can track your order status
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-secondary rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="font-bold mb-2 text-foreground">Get your Order!</h3>
                <p className="text-sm text-muted-foreground">
                  Receive your order at a lighting fast speed!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-primary-foreground text-xs sm:text-sm">
              <span className="font-bold">KFUPM RESTAURANT</span> simplifies the food ordering process. Browse through
              our diverse menu, select your favorite dishes, and proceed to checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <p className="text-xs sm:text-sm">Copyright 2024, All Rights Reserved.</p>
          <div className="flex flex-wrap gap-3 sm:gap-8 text-xs sm:text-sm">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Pricing</a>
            <a href="#" className="hover:underline truncate">Do not sell my info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}