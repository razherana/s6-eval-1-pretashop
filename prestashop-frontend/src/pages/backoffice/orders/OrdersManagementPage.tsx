// src/pages/backoffice/orders/OrdersManagementPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
// Update imports
import {
  fetchAllOrdersWithCarts, // Changed from fetchAllOrders
  fetchAllOrderStates,
  fetchOrderDetailsById,
  fetchCartDetails, // New import
  processPayment,
  processDelivery,
  processCancel,
} from "./services/orderServices";
import { LanguageLoadingComponent } from "@/components/ui-manual/language-loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Search,
  MoreHorizontal,
  FileText,
  History,
  Loader2,
  RefreshCw,
  type LucideProps,
  CheckCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { getFormattedPrice, getWithLanguage } from "@/utils/lang";
import { toast } from "sonner";
import { type OrderReadXML, type OrderDetailReadXML, type OrderStateXML, ORDER_STATES } from "@/pages/backoffice/home/types";
import { SelectLanguageCurrency } from "@/components/ui-manual/select-lang";
import { updateOrderState } from "../home/import-services/customer-import";
import { format } from "date-fns";
import { utc } from "@date-fns/utc";

export function OrdersManagementPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [orderStates, setOrderStates] = useState<Map<number, OrderStateXML>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for processing
  const [_, setProcessingOrder] = useState(false);

  // Handler for Pay only (awaiting payment)
  const handlePay = async (order: OrderReadXML) => {
    setProcessingOrder(true);
    try {
      await processPayment(order, language);

      // Reload orders
      const ordersData = await fetchAllOrdersWithCarts(100);
      setOrders(ordersData);
      toast.success("Payment processed successfully");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessingOrder(false);
    }
  };

  // Handler for Deliver only (already paid)
  const handleDeliver = async (order: OrderReadXML) => {
    setProcessingOrder(true);
    try {
      await processDelivery(order);

      // Reload orders
      const ordersData = await fetchAllOrdersWithCarts(100);
      setOrders(ordersData);
      toast.success("Delivery processed successfully");
    } catch (error) {
      console.error("Error processing delivery:", error);
      toast.error("Failed to process delivery");
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleCancel = async (order: OrderReadXML) => {
    setProcessingOrder(true);
  
    try {
      await processCancel(order);

      // Reload orders
      const ordersData = await fetchAllOrdersWithCarts(100);
      setOrders(ordersData);
      toast.success("Cancelation processed successfully");
    } catch (error) {
      console.error("Error processing cancelation:", error);
      toast.error("Failed to process cancelation");
    } finally {
      setProcessingOrder(false);
    }
  };

  // Selected order for modal
  const [selectedOrder, setSelectedOrder] = useState<OrderReadXML | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailReadXML[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // State change
  const [showStateChangeModal, setShowStateChangeModal] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, statesData] = await Promise.all([
        fetchAllOrdersWithCarts(100), // Now includes carts as pseudo-orders
        fetchAllOrderStates(),
      ]);

      setOrders(ordersData);

      const statesMap = new Map<number, OrderStateXML>();
      statesData.forEach((state) => statesMap.set(state.id, state));
      setOrderStates(statesMap);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  const handleViewOrder = async (order: OrderReadXML) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setLoadingDetails(true);

    try {
      // Check if it's a cart (reference starts with "CART-")
      if (order.reference?.startsWith("CART-")) {
        const details = await fetchCartDetails(order.id);
        setOrderDetails(details);
      } else {
        const details = await fetchOrderDetailsById(order.id);
        setOrderDetails(Array.isArray(details) ? details : [details]);
      }
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStateChange = (order: OrderReadXML) => {
    setSelectedOrder(order);
    setSelectedStateId("");
    setShowStateChangeModal(true);
  };

  const handleUpdateState = async () => {
    if (!selectedOrder || !selectedStateId) {
      toast.error("Please select a state");
      return;
    }

    setUpdatingOrder(true);
    try {
      await updateOrderState(selectedOrder.id, parseInt(selectedStateId), format(new Date(), "yyyy-MM-dd HH:mm:ss", { in: utc }),);

      // Reload orders
      const ordersData = await fetchAllOrdersWithCarts(100);
      setOrders(ordersData);

      toast.success("Order state updated successfully");
      setShowStateChangeModal(false);
    } catch (error) {
      console.error("Error updating order state:", error);
      toast.error("Failed to update order state");
    } finally {
      setUpdatingOrder(false);
    }
  };

  const getStateInfo = useCallback((stateId: string | number) => {
    const id = typeof stateId === 'string' ? parseInt(stateId) : stateId;
    const state = orderStates.get(id);

    if (!state) {
      if (id !== 0)
        return {
          name: `State #${id}`,
          color: "text-gray-600 bg-gray-100",
          icon: AlertCircle
        };

      return {
        name: `In cart`,
        color: "text-gray-600 bg-gray-100",
        icon: ShoppingCart
      }
    }

    const stateName = language ? getWithLanguage(state.name, language.language_id) : `State #${id}`;

    const stateConfig: Record<number, { icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; color: string }> = {
      1: { icon: Clock, color: "text-yellow-600 bg-yellow-100 border-yellow-200" },
      2: { icon: CheckCircle2, color: "text-green-600 bg-green-100 border-green-200" },
      3: { icon: Package, color: "text-blue-600 bg-blue-100 border-blue-200" },
      4: { icon: Truck, color: "text-purple-600 bg-purple-100 border-purple-200" },
      5: { icon: CheckCircle2, color: "text-green-600 bg-green-100 border-green-200" },
      6: { icon: Ban, color: "text-red-600 bg-red-100 border-red-200" },
      7: { icon: AlertCircle, color: "text-red-600 bg-red-100 border-red-200" },
      13: { icon: Clock, color: "text-yellow-600 bg-yellow-100 border-yellow-200" },
    };

    const config = stateConfig[id] || { icon: AlertCircle, color: "text-gray-600 bg-gray-100 border-gray-200" };

    return { name: stateName, ...config };
  }, [orderStates, language]);

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.reference?.toLowerCase().includes(query) ||
      order.id.toString().includes(query) ||
      order.payment?.toLowerCase().includes(query)
    );
  });

  if (!language) {
    return <LanguageLoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/backoffice/home")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-primary">
                Orders Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <SelectLanguageCurrency />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg text-destructive mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, ID, or payment method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => {
                      const stateId = o.current_state["#text"];
                      return [1, 10, 13, 14].includes(stateId);
                    }).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => {
                      const stateId = o.current_state["#text"];
                      return [3].includes(stateId);
                    }).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => {
                      const stateId = o.current_state["#text"];
                      return [2, 5].includes(stateId);
                    }).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total Products</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={999} className="text-center py-8 text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const stateInfo = getStateInfo(
                        typeof order.current_state === 'object'
                          ? order.current_state["#text"]
                          : order.current_state
                      );
                      const StateIcon = stateInfo.icon;

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-muted-foreground">
                            #{order.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.reference}
                          </TableCell>
                          <TableCell>{order.payment}</TableCell>
                          <TableCell className="font-medium">
                            {getFormattedPrice(
                              order.total_products_wt,
                              language.currency,
                              language.conversion_change,
                              language.locale
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getFormattedPrice(
                              order.total_paid_tax_incl,
                              language.currency,
                              language.conversion_change,
                              language.locale
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={stateInfo.color} variant="outline">
                              <StateIcon className="h-3 w-3 mr-1" />
                              {stateInfo.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStateChange(order)}>
                                  <History className="mr-2 h-4 w-4" />
                                  Change State
                                </DropdownMenuItem>

                                {/* Show Pay for awaiting payment orders */}
                                {(() => {
                                  const stateId = order.current_state["#text"];

                                  if (([
                                    ORDER_STATES.AWAITING_CASH_ON_DELIVERY,
                                    ORDER_STATES.PAYMENT_ERROR,
                                  ] as number[]).includes(stateId)) {
                                    return (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handlePay(order)}
                                          className="text-green-600 focus:text-green-600"
                                        >
                                          <CheckCheck className="mr-2 h-4 w-4" />
                                          Pay
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() => handleCancel(order)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Cancel
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Show Deliver for paid orders */}
                                {(() => {
                                  const stateId = order.current_state["#text"];

                                  if (stateId === ORDER_STATES.PAYMENT_ACCEPTED) {
                                    return (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleDeliver(order)}
                                          className="text-blue-600 focus:text-blue-600"
                                        >
                                          <Truck className="mr-2 h-4 w-4" />
                                          Deliver
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() => handleCancel(order)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Cancel
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </main>

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              Order #{selectedOrder?.reference}
            </DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                {loadingDetails ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : orderDetails.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No products found</p>
                ) : (
                  <ScrollArea className="h-100">
                    <div className="space-y-4 pr-4">
                      {orderDetails.map((detail, index) => (
                        <div key={index}>
                          <div className="space-y-2">
                            <h4 className="font-medium">{detail.product_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              REF: {detail.product_reference}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="ml-2">{detail.product_quantity}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-2">
                                  {getFormattedPrice(
                                    parseFloat(detail.product_price.toString()),
                                    language.currency,
                                    language.conversion_change,
                                    language.locale
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <span className="ml-2 font-medium">
                                  {getFormattedPrice(
                                    parseFloat(detail.total_price_tax_incl.toString()),
                                    language.currency,
                                    language.conversion_change,
                                    language.locale
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          {index < orderDetails.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{selectedOrder.payment}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      {getFormattedPrice(
                        selectedOrder.total_paid,
                        language.currency,
                        language.conversion_change,
                        language.locale
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStateInfo(
                      typeof selectedOrder.current_state === 'object'
                        ? selectedOrder.current_state["#text"]
                        : selectedOrder.current_state
                    ).color}>
                      {getStateInfo(
                        typeof selectedOrder.current_state === 'object'
                          ? selectedOrder.current_state["#text"]
                          : selectedOrder.current_state
                      ).name}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Change State Modal */}
      <Dialog open={showStateChangeModal} onOpenChange={setShowStateChangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Order State</DialogTitle>
            <DialogDescription>
              Update the state for Order #{selectedOrder?.reference}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current State</Label>
              {selectedOrder && (
                <Badge className={getStateInfo(
                  typeof selectedOrder.current_state === 'object'
                    ? selectedOrder.current_state["#text"]
                    : selectedOrder.current_state
                ).color}>
                  {getStateInfo(
                    typeof selectedOrder.current_state === 'object'
                      ? selectedOrder.current_state["#text"]
                      : selectedOrder.current_state
                  ).name}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>New State</Label>
              <Select value={selectedStateId} onValueChange={setSelectedStateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new state" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(orderStates.values())
                    .filter(state => state.id !== 0) // Filter out placeholder states
                    .map((state) => {
                      const stateName = language
                        ? getWithLanguage(state.name, language.language_id)
                        : `State #${state.id}`;

                      return (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {stateName}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStateChangeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateState}
              disabled={!selectedStateId || updatingOrder}
            >
              {updatingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update State'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}