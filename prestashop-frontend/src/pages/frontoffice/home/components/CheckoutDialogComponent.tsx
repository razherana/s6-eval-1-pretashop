// src/pages/frontoffice/home/components/CheckoutDialogComponent.tsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckoutFormComponent } from './CheckoutFormComponent';
import { useCart } from '@/hooks/useCart';

export function CheckoutDialogComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const handleOpenCheckout = () => setIsOpen(true);
    window.addEventListener('openCheckout', handleOpenCheckout);
    return () => window.removeEventListener('openCheckout', handleOpenCheckout);
  }, []);

  if (items.length === 0 && isOpen) {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout - Payment on Delivery</DialogTitle>
        </DialogHeader>
        <CheckoutFormComponent />
      </DialogContent>
    </Dialog>
  );
}