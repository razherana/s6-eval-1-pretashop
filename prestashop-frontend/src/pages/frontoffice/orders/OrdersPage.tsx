// src/pages/frontoffice/orders/OrdersPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFrontofficeAuth } from "@/hooks/useFrontofficeAuth";
import { useFrontofficeData } from "@/hooks/useFrontofficeData";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import { fetchCustomerOrders } from "@/pages/frontoffice/orders/services";
import {
  getSavedCarts,
  cartToCartItems,
  deleteCart,
  type UserCart,
} from "@/pages/frontoffice/home/services/cartService";
import type { CartItem } from "@/contexts/CartContext";
import { LanguageLoadingComponent } from "@/components/ui-manual/language-loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  ArrowLeft,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Ban,
  AlertCircle,
  FileText,
  History,
  ShoppingCart,
  Trash2,
  Plus,
  type LucideProps,
} from "lucide-react";
import { getFormattedPrice, getWithLanguage } from "@/utils/lang";
import type { OrderReadXML } from "@/pages/backoffice/home/types";
import { OrderDetailsComponent } from "./components/OrderDetailsComponent";
import { OrderHistoryComponent } from "./components/OrderHistoryComponent";
import { OrdersTabContent } from "./components/OrdersTabContent";
import { SavedCartsTabContent } from "./components/SavedCartsTabContent";
import { FrontofficeProtectedLayout } from "@/components/layout/FrontofficeProtectedLayout";
import { FrontofficeDataLoadingComponent } from "@/components/ui-manual/frontofficedata-loading-state";
import { toast } from "sonner";
import { API_QUERY } from "@/utils/url";

export function OrdersPage() {
  const navigate = useNavigate();
  const { authData } = useFrontofficeAuth();
  const { data } = useFrontofficeData();
  const { language } = useLanguage();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderReadXML | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Saved carts state
  const [savedCarts, setSavedCarts] = useState<UserCart[]>([]);
  const [savedCartItemsMap, setSavedCartItemsMap] = useState<
    Map<number, CartItem[]>
  >(new Map());
  const [loadingCarts, setLoadingCarts] = useState(false);
  const [selectedCart, setSelectedCart] = useState<UserCart | null>(null);
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!authData.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const customerOrders = await fetchCustomerOrders(authData.user.id);
      setOrders(customerOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [authData.user]);

  const loadSavedCarts = useCallback(async () => {
    if (!authData.user?.id) return;

    try {
      setLoadingCarts(true);
      const carts = await getSavedCarts(authData.user.id);
      setSavedCarts(carts);

      const itemsMap = new Map<number, CartItem[]>();
      for (const cart of carts) {
        try {
          const items = await cartToCartItems(cart);
          itemsMap.set(cart.id, items);
        } catch (err) {
          console.error(`Error loading items for cart ${cart.id}:`, err);
          itemsMap.set(cart.id, []);
        }
      }
      setSavedCartItemsMap(itemsMap);
    } catch (err) {
      console.error("Error loading saved carts:", err);
    } finally {
      setLoadingCarts(false);
    }
  }, [authData.user]);

  const handleDeleteCart = useCallback(
    async (cartId: number) => {
      try {
        await deleteCart(cartId);
        toast.success("Saved cart deleted");
        await loadSavedCarts();
      } catch (err) {
        console.error("Error deleting cart:", err);
        toast.error("Failed to delete cart");
      }
    },
    [loadSavedCarts],
  );

  const handleViewCart = (cart: UserCart) => {
    setSelectedCart(cart);
    setSelectedCartItems(savedCartItemsMap.get(cart.id) || []);
    setShowCartModal(true);
  };

  const handleAddToActiveCart = async (cart: UserCart) => {
    const items = savedCartItemsMap.get(cart.id) || [];
    if (items.length === 0) {
      toast.info("This cart is empty");
      return;
    }

    // Add each item from the saved cart into the active cart context
    for (const item of items) {
      addToCart(
        {
          productId: item.productId,
          combinationId: item.combinationId,
          name: item.name,
          price: item.price,
          image: item.image,
          reference: item.reference,
          combinationReference: item.combinationReference,
        },
        item.quantity,
      );
    }

    toast.success(
      `${items.reduce((sum, i) => sum + i.quantity, 0)} item(s) added to your active cart`,
    );

    await handleDeleteCart(cart.id);
    navigate("/frontoffice/home");
  };

  useEffect(() => {
    if (!authData.isAuthenticated) {
      navigate("/frontoffice/login");
      return;
    }

    (async () => {
      await Promise.all([loadOrders(), loadSavedCarts()]);
    })();
  }, [authData, loadOrders, loadSavedCarts, navigate]);

  const getOrderStateInfo = useCallback((stateId: string | number) => {
    const id = typeof stateId === 'string' ? parseInt(stateId) : stateId;
    const state = data?.orderStates.get(id);

    if (!state) return { name: `State #${id}`, color: "gray", icon: Clock };

    const stateName = language ? getWithLanguage(state.name, language.language_id) : `State #${id}`;

    // Map state IDs to icons and colors
    const stateConfig: Record<number, { icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; color: string }> = {
      1: { icon: Clock, color: "text-yellow-600 bg-yellow-100" },
      2: { icon: CheckCircle2, color: "text-green-600 bg-green-100" },
      3: { icon: Package, color: "text-blue-600 bg-blue-100" },
      4: { icon: Truck, color: "text-purple-600 bg-purple-100" },
      5: { icon: CheckCircle2, color: "text-green-600 bg-green-100" },
      6: { icon: Ban, color: "text-red-600 bg-red-100" },
      7: { icon: AlertCircle, color: "text-red-600 bg-red-100" },
      8: { icon: AlertCircle, color: "text-red-600 bg-red-100" },
      9: { icon: AlertCircle, color: "text-orange-600 bg-orange-100" },
      10: { icon: Clock, color: "text-yellow-600 bg-yellow-100" },
      11: { icon: CheckCircle2, color: "text-green-600 bg-green-100" },
      12: { icon: AlertCircle, color: "text-orange-600 bg-orange-100" },
      13: { icon: Clock, color: "text-yellow-600 bg-yellow-100" },
      14: { icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    };

    const config = stateConfig[id] || { icon: Clock, color: "text-gray-600 bg-gray-100" };

    return { name: stateName, ...config };
  }, [data, language]);

  const handleViewOrder = (order: OrderReadXML) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (!language) {
    return <LanguageLoadingComponent />;
  }

  if (!data) {
    return <FrontofficeDataLoadingComponent />;
  }

  if (!authData.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <FrontofficeProtectedLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/frontoffice/home")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-primary">My Orders</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="w-full grid grid-cols-2 max-w-md">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="saved-carts" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Saved Carts
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <OrdersTabContent
                orders={orders}
                loading={loading}
                error={error}
                language={language}
                getOrderStateInfo={getOrderStateInfo}
                onViewOrder={handleViewOrder}
                onRetry={loadOrders}
                navigate={navigate}
              />
            </TabsContent>

            {/* Saved Carts Tab */}
            <TabsContent value="saved-carts">
              <SavedCartsTabContent
                savedCarts={savedCarts}
                savedCartItemsMap={savedCartItemsMap}
                loadingCarts={loadingCarts}
                language={language}
                onViewCart={handleViewCart}
                onAddToActiveCart={handleAddToActiveCart}
                onDeleteCart={handleDeleteCart}
                navigate={navigate}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* Order Details Modal */}
        <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                {selectedOrder && (
                  <span>
                    Order #{selectedOrder.reference}
                    <span className="text-sm text-muted-foreground ml-2">
                      (ID: {selectedOrder.id})
                    </span>
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && language && (
              <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Order Details
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Order History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">{selectedOrder.payment}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Paid</span>
                        <span className="font-bold">
                          {getFormattedPrice(
                            selectedOrder.total_paid,
                            language.currency,
                            language.conversion_change,
                            language.locale
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={getOrderStateInfo(
                          typeof selectedOrder.current_state === 'object'
                            ? selectedOrder.current_state["#text"]
                            : selectedOrder.current_state
                        ).color}>
                          {getOrderStateInfo(
                            typeof selectedOrder.current_state === 'object'
                              ? selectedOrder.current_state["#text"]
                              : selectedOrder.current_state
                          ).name}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Details */}
                    <OrderDetailsComponent
                      orderId={selectedOrder.id}
                      language={language}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-auto mt-4">
                  <OrderHistoryComponent
                    orderId={selectedOrder.id}
                  />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Saved Cart Details Modal */}
        <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                {selectedCart && (
                  <span>
                    Saved Cart #{selectedCart.id}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({selectedCartItems.length} item
                      {selectedCartItems.length !== 1 ? "s" : ""})
                    </span>
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedCart && language && (
              <div className="flex-1 overflow-auto mt-4">
                {selectedCartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Empty Cart</p>
                    <p className="text-muted-foreground mb-4">
                      This cart has no items.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteCart(selectedCart.id);
                        setShowCartModal(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete This Cart
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cart ID</span>
                        <span className="font-medium">#{selectedCart.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Saved On</span>
                        <span className="font-medium">
                          {new Date(selectedCart.date_add).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Items
                        </span>
                        <span className="font-bold">
                          {selectedCartItems.reduce(
                            (sum, i) => sum + i.quantity,
                            0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimated Total
                        </span>
                        <span className="font-bold">
                          {getFormattedPrice(
                            selectedCartItems.reduce(
                              (sum, i) => sum + i.price * i.quantity,
                              0,
                            ),
                            language.currency,
                            language.conversion_change,
                            language.locale,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold">Cart Items</h3>
                      {selectedCartItems.map((item) => (
                        <div
                          key={`modal-${item.productId}-${item.combinationId ?? 0}`}
                          className="flex items-center gap-4 p-3 border rounded-lg"
                        >
                          {item.image && (
                            <img
                              src={`${item.image}?${API_QUERY}`}
                              alt={item.name}
                              className="w-16 h-16 rounded-md object-cover border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ref: {item.reference}
                              {item.combinationReference &&
                                ` (${item.combinationReference})`}
                            </p>
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
                            <p className="text-sm text-muted-foreground">
                              x{item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        onClick={() => {
                          handleAddToActiveCart(selectedCart);
                          setShowCartModal(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Use This Cart
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeleteCart(selectedCart.id);
                          setShowCartModal(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Cart
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FrontofficeProtectedLayout>
  );
}