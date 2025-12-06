import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderConfirmationDialog = ({
  isOpen,
  onClose,
}: OrderConfirmationDialogProps) => {
  const navigate = useNavigate();

  const handleThanks = () => {
    onClose();
    navigate("/current-orders");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <div className="flex flex-col items-center py-8 px-4">
          <div className="w-32 h-32 bg-[#FFF9C4] rounded-full flex items-center justify-center mb-6">
            <span className="text-6xl">🎉</span>
          </div>

          <h2 className="text-2xl font-bold mb-8">
            Your order has been placed!
          </h2>

          <Button
            onClick={handleThanks}
            className="bg-foreground text-background hover:bg-foreground/90 px-16 py-6 rounded-lg text-lg"
          >
            Thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmationDialog;