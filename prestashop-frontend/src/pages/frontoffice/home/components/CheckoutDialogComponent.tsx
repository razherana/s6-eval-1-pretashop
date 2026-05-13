// src/pages/frontoffice/home/components/CheckoutDialogComponent.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckoutFormComponent } from './CheckoutFormComponent';

export function CheckoutDialogComponent({
  isCheckoutOpen,
  setIsCheckoutOpen,
}: {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}) {

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout - Payment on Delivery</DialogTitle>
        </DialogHeader>
        <CheckoutFormComponent  />
      </DialogContent>
    </Dialog>
  );
}