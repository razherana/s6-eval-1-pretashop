// src/pages/frontoffice/home/components/SavedCartsComponent.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getSavedCarts,
  type UserCart,
} from '../services/cartService';
import { getCartTotal } from '../services/orderService';
import { useFrontofficeAuth } from '@/hooks/useFrontofficeAuth';
import { useFrontofficeData } from '@/hooks/useFrontofficeData';
import { useLanguage } from '@/hooks/useLanguage';
import { getWithLanguage, getFormattedPrice } from '@/utils/lang';
import { API_QUERY, fetchFromPrestashopApi } from '@/utils/url';
import {
  ShoppingCart,
  Calendar,
  Package,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ProductReadXML } from '@/pages/backoffice/home/types';
import { fetchProductCombinations } from '../services';

interface SavedCartsProps {
  onSelectCart: (cart: UserCart) => void;
}

interface CartProductInfo {
  productId: number;
  combinationId?: number;
  quantity: number;
  product?: ProductReadXML;
  combinationName?: string;
  price_ttc?: number;
  price?: number;
}

export function SavedCartsComponent({
  onSelectCart,
}: SavedCartsProps) {
  const { authData } = useFrontofficeAuth();
  const { data } = useFrontofficeData();
  const { language } = useLanguage();

  const [savedCarts, setSavedCarts] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);
  const [cartProducts, setCartProducts] = useState<Map<number, CartProductInfo[]>>(new Map());
  const [cartTotals, setCartTotals] = useState<Map<number, { total_wt: number; total: number }>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (authData.isAuthenticated && authData.user?.id) {
      const loadSavedCarts = async () => {
        if (!authData.user?.id) return;

        try {
          setLoading(true);
          const carts = await getSavedCarts(authData.user.id);
          setSavedCarts(carts);
        } catch (error) {
          console.error('Error loading saved carts:', error);
          toast.error('Failed to load saved carts');
        } finally {
          setLoading(false);
        }
      };

      loadSavedCarts();
    }
  }, [authData]);



  const loadCartDetails = async (cartId: number) => {
    if (cartProducts.has(cartId)) return;

    setLoadingProducts((prev) => new Set(prev).add(cartId));

    try {
      const total = await getCartTotal(cartId);
      setCartTotals((prev) => new Map(prev).set(cartId, total));

      const cart = savedCarts.find((c) => c.id === cartId);
      if (!cart) return;

      const rows = cart.associations?.cart_rows?.cart_row;
      if (!rows) return;

      const rowsArray = Array.isArray(rows) ? rows : [rows];
      const products: CartProductInfo[] = [];

      for (const row of rowsArray) {
        const productId = row.id_product["#text"];
        const quantity = row.quantity;
        const combinationId = row.id_product_attribute["#text"];

        try {
          const productResponse = await fetchFromPrestashopApi<{
            product: ProductReadXML;
          }>(`/products/${productId}?price[price_ttc][use_tax]=1${combinationId ? `&price[price_ttc][product_attribute]=${combinationId}` : ''}`, { method: 'GET' });

          const product = productResponse.product;

          if (product?.associations?.images?.image && !Array.isArray(product.associations.images.image)) {
            product.associations.images.image = [product.associations.images.image as never];
          }

          let combinationName: string | undefined;
          if (combinationId && combinationId !== 0 && data) {
            const combinations = await fetchProductCombinations(productId, data.combinationsCache);
            if (combinations) {
              const comb = combinations.find((c) => c.id === combinationId);
              if (comb?.associations?.product_option_values?.product_option_value) {
                const ovs = Array.isArray(
                  comb.associations.product_option_values.product_option_value
                )
                  ? comb.associations.product_option_values.product_option_value
                  : [comb.associations.product_option_values.product_option_value];

                const names = ovs.map((ov) => {
                  const ovDetail = data.productOptionValues.get(ov.id);
                  if (ovDetail) {
                    return getWithLanguage(ovDetail.name, language?.language_id || 1);
                  }
                  return `Option #${ov.id}`;
                });
                combinationName = names.join(', ');
              }
            }
          }

          products.push({
            productId,
            combinationId: combinationId !== 0 ? combinationId : undefined,
            quantity,
            product,
            combinationName,
            price_ttc: product?.price_ttc,
            price: product?.price,
          });
        } catch (error) {
          console.error(`Error loading product ${productId}:`, error);
        }
      }

      setCartProducts((prev) => new Map(prev).set(cartId, products));
    } catch (error) {
      console.error('Error loading cart details:', error);
    } finally {
      setLoadingProducts((prev) => {
        const next = new Set(prev);
        next.delete(cartId);
        return next;
      });
    }
  };

  const handleCartClick = (cart: UserCart) => {
    if (expandedCartId === cart.id.toString()) {
      setExpandedCartId(null);
    } else {
      setExpandedCartId(cart.id.toString());
      loadCartDetails(cart.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (savedCarts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No saved carts</p>
        <p className="text-sm">Save your cart from the shop to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedCarts.map((cart) => {
        const isExpanded = expandedCartId === cart.id.toString();
        const products = cartProducts.get(cart.id);
        const total = cartTotals.get(cart.id);
        const isLoading = loadingProducts.has(cart.id);

        return (
          <Card key={cart.id} className="transition-all">
            <CardContent className="p-0">
              {/* Cart Header */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleCartClick(cart)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cart #{cart.id}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(cart.date_add).toLocaleDateString(
                          language?.locale || 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {total && (
                      <span className="text-sm font-semibold">
                        {getFormattedPrice(
                          total.total_wt,
                          language?.currency || '€',
                          language?.conversion_change || 1,
                          language?.locale || 'en-US'
                        )}
                      </span>
                    )}
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div>
                  <Separator />
                  <div className="p-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : products && products.length > 0 ? (
                      <div className="space-y-3">
                        {products.map((product, index) => (
                          <div key={index}>
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 shrink-0 rounded overflow-hidden bg-gray-100">
                                {(() => {
                                  const images = product.product?.associations?.images?.image;
                                  const normalizedImages = Array.isArray(images) ? images : images ? [images] : [];
                                  return normalizedImages?.[0] ? (
                                  <img
                                    src={`${normalizedImages[0]['@_xlink:href']}?${API_QUERY}`}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                );
                                })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium truncate">
                                  {product.product?.name
                                    ? getWithLanguage(product.product.name, language?.language_id || 1)
                                    : `Product #${product.productId}`}
                                </h5>
                                {product.combinationName && (
                                  <p className="text-xs text-primary mt-0.5">{product.combinationName}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span>Qty: {product.quantity}</span>
                                  {product.price_ttc ? (
                                    <span>
                                      {getFormattedPrice(product.price_ttc, language?.currency || '€', language?.conversion_change || 1, language?.locale || 'en-US')}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            {index < products.length - 1 && <Separator className="mt-3" />}
                          </div>
                        ))}
                        {total && (
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Total (incl. tax)</span>
                              <span>
                                {getFormattedPrice(total.total_wt, language?.currency || '€', language?.conversion_change || 1, language?.locale || 'en-US')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No products in this cart</p>
                    )}

                    {/* Single action button */}
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCart(cart);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Current Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}