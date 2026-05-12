// src/pages/frontoffice/orders/OrdersPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFrontofficeAuth } from "@/hooks/useFrontofficeAuth";
import { useFrontofficeData } from "@/hooks/useFrontofficeData";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchCustomerOrders } from "@/pages/frontoffice/orders/services";
import { LanguageLoadingComponent } from "@/components/ui-manual/language-loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  type LucideProps
} from "lucide-react";
import { getFormattedPrice, getWithLanguage } from "@/utils/lang";
import type { OrderReadXML } from "@/pages/backoffice/home/types";
import { OrderDetailsComponent } from "./components/OrderDetailsComponent";
import { OrderHistoryComponent } from "./components/OrderHistoryComponent";
import { FrontofficeProtectedLayout } from "@/components/layout/FrontofficeProtectedLayout";
import { FrontofficeDataLoadingComponent } from "@/components/ui-manual/frontofficedata-loading-state";

export function OrdersPage() {
  const navigate = useNavigate();
  const { authData } = useFrontofficeAuth();
  const { data } = useFrontofficeData();
  const { language } = useLanguage();

  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderReadXML | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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
  }, [authData.user.id]);

  useEffect(() => {
    if (!authData.isAuthenticated) {
      navigate("/frontoffice/login");
      return;
    }

    (async () => {
      await loadOrders();
    })();
  }, [authData, loadOrders, navigate]);

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
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg text-destructive mb-4">{error}</p>
              <Button onClick={loadOrders}>Try Again</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping!
              </p>
              <Button onClick={() => navigate("/frontoffice/home")}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const stateInfo = getOrderStateInfo(
                  typeof order.current_state === 'object' 
                    ? order.current_state["#text"] 
                    : order.current_state
                );
                const StateIcon = stateInfo.icon;

                return (
                  <Card 
                    key={order.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            Order #{order.reference}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Order ID: {order.id}
                          </p>
                        </div>
                        <Badge className={stateInfo.color}>
                          <StateIcon className="h-3 w-3 mr-1" />
                          {stateInfo.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Payment: </span>
                            {order.payment}
                          </p>
                          <p className="text-lg font-bold">
                            {getFormattedPrice(
                              order.total_paid,
                              language.currency,
                              language.conversion_change,
                              language.locale
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
      </div>
    </FrontofficeProtectedLayout>
  );
}