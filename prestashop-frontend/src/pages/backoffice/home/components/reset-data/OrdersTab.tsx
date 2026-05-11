import { useEffect, useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import { type OrderReadXML, type OrderDetailReadXML } from "../../types";
import { fetchOrders, fetchOrderDetails } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";
import { getFormattedPrice, useLanguage } from "@/utils/lang";
import { OrderDetailsRow } from "./OrderDetailsRow";

interface OrdersTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function OrdersTab({ onDataLoaded, selectedIds, onSelectionChange }: OrdersTabProps) {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [orderDetails, setOrderDetails] = useState<Map<number, OrderDetailReadXML[]>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchOrders(100, 0);
        setOrders(data || []);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [onDataLoaded]);

  const toggleOrderDetails = useCallback(async (orderId: number) => {
    const newExpanded = new Set(expandedOrders);

    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
      setExpandedOrders(newExpanded);
    } else {
      newExpanded.add(orderId);
      setExpandedOrders(newExpanded);

      if (!orderDetails.has(orderId)) {
        setLoadingDetails(prev => new Set(prev).add(orderId));
        try {
          const details = await fetchOrderDetails(orderId);
          setOrderDetails(prev => new Map(prev).set(orderId, details));
        } catch (error) {
          console.error(`Error loading order details for ${orderId}:`, error);
          toast.error("Failed to load order details");
        } finally {
          setLoadingDetails(prev => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }
      }
    }
  }, [expandedOrders, orderDetails]);

  const allSelected = useMemo(() =>
    orders && orders.length > 0 && selectedIds.size === orders.length,
    [orders, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(orders.map(o => o.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id))
      newSelected.delete(id)
    else
      newSelected.add(id);

    onSelectionChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Order Reference</TableHead>
            <TableHead className="w-30">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders && orders.map((order) => (
            <>
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
                  toggleOrderDetails(order.id);
                }}
              >
                <TableCell key={`#${order.id}`} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(order.id)}
                    onCheckedChange={() => handleSelect(order.id)}
                  />
                </TableCell>
                <TableCell key={`toggle-${order.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOrderDetails(order.id);
                    }}
                  >
                    {expandedOrders.has(order.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell key={`id-${order.id}`} className="font-mono text-muted-foreground">#{order.id}</TableCell>
                <TableCell key={`reference-${order.id}`} className="font-medium">Order #{order.reference}</TableCell>
                <TableCell key={`total-${order.id}`} className="font-medium">
                  {getFormattedPrice(order.total_paid, language.currency, language.conversion_change, language.locale)}
                </TableCell>
              </TableRow>
              {expandedOrders.has(order.id) && (
                <OrderDetailsRow
                  orderId={order.id}
                  orderDetails={orderDetails}
                  loadingDetails={loadingDetails}
                />
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}