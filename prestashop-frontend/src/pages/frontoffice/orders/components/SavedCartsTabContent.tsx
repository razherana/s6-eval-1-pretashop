// src/pages/frontoffice/orders/components/SavedCartsTabContent.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { getFormattedPrice } from "@/utils/lang";
import type { UserCart } from "@/pages/frontoffice/home/services/cartService";
import type { CartItem } from "@/contexts/CartContext";
import type { NavigateFunction } from "react-router-dom";
import { API_QUERY } from "@/utils/url";

interface SavedCartsTabContentProps {
  savedCarts: UserCart[];
  savedCartItemsMap: Map<number, CartItem[]>;
  loadingCarts: boolean;
  language: {
    currency: string;
    conversion_change: number;
    locale: string;
    language_id: number;
  };
  onViewCart: (cart: UserCart) => void;
  onAddToActiveCart: (cart: UserCart) => void;
  onDeleteCart: (cartId: number) => void;
  navigate: NavigateFunction;
}

export function SavedCartsTabContent({
  savedCarts,
  savedCartItemsMap,
  loadingCarts,
  language,
  onViewCart,
  onAddToActiveCart,
  onDeleteCart,
  navigate,
}: SavedCartsTabContentProps) {
  if (loadingCarts) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (savedCarts.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Saved Carts</h2>
        <p className="text-muted-foreground mb-6">
          You don't have any saved carts. Your active cart will be automatically
          saved when you leave.
        </p>
        <Button onClick={() => navigate("/frontoffice/home")}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedCarts.map((cart) => {
        const items = savedCartItemsMap.get(cart.id) || [];
        const cartDate = new Date(cart.date_add);
        const isEmpty = items.length === 0;

        return (
          <Card
            key={cart.id}
            className={`hover:shadow-md transition-shadow ${isEmpty ? "opacity-70" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    Cart #{cart.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Saved on{" "}
                    {cartDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {cartDate.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  variant={isEmpty ? "secondary" : "default"}
                  className={
                    isEmpty
                      ? "bg-gray-100 text-gray-600"
                      : "bg-blue-100 text-blue-700"
                  }
                >
                  {isEmpty
                    ? "Empty"
                    : `${items.length} item${items.length > 1 ? "s" : ""}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!isEmpty && (
                <div className="mb-4 space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={`${item.productId}-${item.combinationId ?? 0}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={`${item.image}?${API_QUERY}`}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover border"
                          />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-75">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground">
                            {item.reference}
                            {item.combinationReference &&
                              ` (${item.combinationReference})`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {getFormattedPrice(
                            item.price,
                            language.currency,
                            language.conversion_change,
                            language.locale,
                          )}
                        </p>
                        <p className="text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ...and {items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCart(cart)}
                >
                  {isEmpty ? "View" : "View Cart"}
                </Button>
                {!isEmpty && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAddToActiveCart(cart)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Use This Cart
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDeleteCart(cart.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
