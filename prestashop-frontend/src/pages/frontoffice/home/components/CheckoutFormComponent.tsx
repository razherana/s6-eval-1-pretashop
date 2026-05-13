// src/pages/frontoffice/home/components/CheckoutFormComponent.tsx
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { useFrontofficeAuth } from '@/hooks/useFrontofficeAuth';
import { processCheckout } from '../services/orderService';
import { cartToCartItems, type UserCart } from '../services/cartService';
import { Loader2, CheckCircle, Package, User, UserPlus, ShoppingCart, Save } from 'lucide-react';
import { SavedCartsComponent } from './SavedCartsComponent';
import { toast } from 'sonner';
import type { CartItem } from '@/contexts/CartContext';

interface CustomerFormData {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  city: string;
  phone: string;
}

export function CheckoutFormComponent() {
  const { items, totalPrice, clearCart, addToCart } = useCart();
  const { language } = useLanguage();
  const { authData } = useFrontofficeAuth();

  const [activeTab, setActiveTab] = useState<string>(
    authData.isAuthenticated && authData.user ? 'account' : 'guest'
  );

  const [formData, setFormData] = useState<CustomerFormData>({
    firstname: authData.user?.firstname || '',
    lastname: authData.user?.lastname || '',
    email: authData.user?.email || '',
    address: '',
    city: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: number;
    reference: string;
    totalAmount: number;
  } | null>(null);

  // Cart selection state
  const [checkoutMode, setCheckoutMode] = useState<'current' | 'saved'>('current');
  const [selectedCartId, setSelectedCartId] = useState<string>('');
  
  // Loaded cart items state
  const [loadedCartItems, setLoadedCartItems] = useState<CartItem[]>([]);
  const [loadingCartItems, setLoadingCartItems] = useState(false);

  const handleSelectCart = useCallback(async (cart: UserCart) => {
    setSelectedCartId(cart.id.toString());
    setLoadingCartItems(true);
    
    try {
      const cartItems = await cartToCartItems(cart);
      setLoadedCartItems(cartItems);
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast.error('Failed to load cart items');
      setLoadedCartItems([]);
    } finally {
      setLoadingCartItems(false);
    }
  }, []);

  const handleUseCart = useCallback(async (items: CartItem[]) => {
    clearCart();
    for (const item of items) {
      if (item.productId) {
        addToCart(item);
      }
    }
    setCheckoutMode('current');
    setSelectedCartId('');
    setLoadedCartItems([]);
    toast.success('Saved cart loaded into current cart');
  }, [clearCart, addToCart]);

  const getCartItems = useCallback((): CartItem[] => {
    if (checkoutMode === 'saved' && selectedCartId) {
      return loadedCartItems;
    }
    return items;
  }, [checkoutMode, selectedCartId, loadedCartItems, items]);

  const getDisplayTotal = useCallback((): number => {
    if (checkoutMode === 'saved' && loadedCartItems.length > 0) {
      return loadedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    return totalPrice;
  }, [checkoutMode, loadedCartItems, totalPrice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cartItems = getCartItems();

    if (cartItems.length === 0) {
      toast.error('No items to checkout');
      return;
    }

    const formDataToUse = { ...formData };

    if (activeTab === 'account' && authData.user) {
      formDataToUse.firstname = authData.user.firstname;
      formDataToUse.lastname = authData.user.lastname;
      formDataToUse.email = authData.user.email;
    }

    if (!formDataToUse.address || !formDataToUse.city || !formDataToUse.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const customerInfo: CustomerFormData = {
        firstname: formDataToUse.firstname,
        lastname: formDataToUse.lastname,
        email: formDataToUse.email,
        address: formDataToUse.address,
        city: formDataToUse.city,
        phone: formDataToUse.phone,
      };

      const result = await processCheckout(
        cartItems,
        customerInfo,
        language?.language_id || 1,
        language?.currency_id || 1,
        activeTab === 'account' ? authData.user?.id : undefined,
      );

      setOrderSuccess({
        orderId: result.orderId,
        reference: result.orderReference,
        totalAmount: result.totalAmount,
      });

      clearCart();
      setLoadedCartItems([]);
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

  const displayItems = getCartItems();
  const displayTotal = getDisplayTotal();

  if (orderSuccess) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">Thank you for your order.</p>
          <p className="text-lg font-semibold">
            Order Reference: <span className="text-primary">{orderSuccess.reference}</span>
          </p>
          <p className="text-sm text-muted-foreground">Order ID: {orderSuccess.orderId}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm">
            You will pay <strong>{orderSuccess.totalAmount.toFixed(2)} €</strong> upon delivery.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Free shipping included • Payment on delivery
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guest" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Guest Checkout
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex items-center gap-2"
            disabled={!authData.isAuthenticated}
          >
            <User className="h-4 w-4" />
            My Account
            {!authData.isAuthenticated && (
              <span className="text-xs ml-1">(Login required)</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Cart Selection (only for authenticated users) */}
        {authData.isAuthenticated && (
          <div className="mt-4">
            <Label>Checkout Mode</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={checkoutMode === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCheckoutMode('current');
                  setSelectedCartId('');
                  setLoadedCartItems([]);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Current Cart
              </Button>
              <Button
                type="button"
                variant={checkoutMode === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCheckoutMode('saved')}
              >
                <Save className="mr-2 h-4 w-4" />
                Saved Carts
              </Button>
            </div>

            {checkoutMode === 'saved' && (
              <div className="mt-3">
                {loadingCartItems && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading cart items...
                    </span>
                  </div>
                )}
                <SavedCartsComponent
                  onSelectCart={handleSelectCart}
                  onUseCart={handleUseCart}
                  selectedCartId={selectedCartId}
                />
              </div>
            )}
          </div>
        )}

        <TabsContent value="guest" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          {authData.user && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Account Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{authData.user.firstname} {authData.user.lastname}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium truncate">{authData.user.email}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <div className="space-y-4 mt-4">
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
      </Tabs>

      {/* Order Summary */}
      <div className="bg-muted p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Items ({displayItems.length})</span>
            <span>{displayTotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{displayTotal.toFixed(2)} €</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Payment method: <strong>Payment on delivery</strong></p>
          <p>Free shipping on all orders</p>
          {activeTab === 'account' && authData.user && (
            <p className="text-primary">✓ Ordering as: {authData.user.email}</p>
          )}
          {checkoutMode === 'saved' && selectedCartId && (
            <p className="text-blue-600">✓ Using saved cart #{selectedCartId}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading || loadingCartItems}>
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing Order...</>
        ) : (
          'Place Order (Payment on Delivery)'
        )}
      </Button>
    </form>
  );
}