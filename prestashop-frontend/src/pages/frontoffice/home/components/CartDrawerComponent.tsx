// src/components/CartDrawer.tsx
import { useCart } from '@/hooks/useCart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { API_QUERY } from '@/utils/url';
import { Spinner } from '@/components/ui/spinner';

export function CartDrawerComponent({
  setIsCheckoutOpen
}: {
  setIsCheckoutOpen: (open: boolean) => void;
}) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
    isLoadingCart
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {
        isLoadingCart && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground text-xs flex items-center">
              <Spinner className="mr-2" />
              Loading cart...</div>
          </div>
        )
      }
      {
        !isLoadingCart && (<SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {totalItems}
              </span>
            )}
          </Button>
        </SheetTrigger>)
      }
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({totalItems} items)</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-muted-foreground">
            <ShoppingCart className="h-16 w-16" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm">Add some products to get started!</p>

            <div>
              <Button onClick={() => setIsOpen(false)} className="mt-2">
                Continue Shopping
              </Button>{' '}or{' '}
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="mt-2"
              >
                Check Saved Carts
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.combinationId || 'default'}`}
                    className="flex items-start space-x-4"
                  >
                    {/* Product Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.image ? (
                        <img
                          src={`${item.image}?${API_QUERY}`}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        REF: {item.combinationReference || item.reference}
                      </p>
                      {item.combinationId && (
                        <span className="text-xs text-primary font-medium">
                          Custom variant selected
                        </span>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.productId, item.combinationId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.productId, item.combinationId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.productId, item.combinationId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Cart Footer */}
            <div className="space-y-4 py-5 px-5">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <p>Free shipping • Payment on delivery</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  // Navigate to checkout or open checkout modal
                  setIsOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}