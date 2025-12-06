import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import OrderConfirmationDialog from "./OrderConfirmationDialog";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const PaymentDialog = ({ isOpen, onClose, total }: PaymentDialogProps) => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePurchase = () => {
    onClose();
    setShowConfirmation(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Credit Card Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Method Icons */}
            <div className="border rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Payment Method</p>
              <div className="flex gap-3">
                <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  MC
                </div>
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div className="w-12 h-8 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                  AMEX
                </div>
                <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  DIS
                </div>
              </div>
            </div>

            {/* Card Name */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Name on card
              </label>
              <Input
                placeholder="Meet Patel"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Card number
              </label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Card expiration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                        {m.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => 2024 + i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CVV */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Card Security Code
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Code"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="rounded-lg"
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              className="w-full bg-foreground text-background hover:bg-foreground/90 py-6 rounded-lg text-lg"
            >
              Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      />
    </>
  );
};

export default PaymentDialog;