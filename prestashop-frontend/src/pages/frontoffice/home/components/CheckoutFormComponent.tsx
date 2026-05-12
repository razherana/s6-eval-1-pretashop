// src/pages/frontoffice/home/components/CheckoutFormComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { processFullOrderFlow } from '../services/orderService';
import { Loader2, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerFormData {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  city: string;
  phone: string;
}

export function CheckoutFormComponent() {
  const { items, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const [formData, setFormData] = useState<CustomerFormData>({
    firstname: '',
    lastname: '',
    email: '',
    address: '',
    city: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: number;
    reference: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const result : {
        orderId: number;
        orderReference: string;
      } = await processFullOrderFlow(
        items,
        formData,
        language?.language_id || 1,
        language?.currency_id || 1,
      );

      setOrderSuccess({
        orderId: result.orderId,
        reference: result.orderReference,
      });
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (orderSuccess) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Thank you for your order.
          </p>
          <p className="text-lg font-semibold">
            Order Reference: <span className="text-primary">{orderSuccess.reference}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Order ID: {orderSuccess.orderId}
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm">
            You will pay <strong>{totalPrice.toFixed(2)} €</strong> upon delivery.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Free shipping included
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name *</Label>
            <Input
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              required
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name *</Label>
            <Input
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              required
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="+261 34 12 345 67"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="123 Main Street"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            placeholder="Antananarivo"
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-muted p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Items ({items.length})</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Payment method: <strong>Payment on delivery</strong></p>
          <p>Free shipping on all orders</p>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Order...
          </>
        ) : (
          'Place Order (Payment on Delivery)'
        )}
      </Button>
    </form>
  );
}