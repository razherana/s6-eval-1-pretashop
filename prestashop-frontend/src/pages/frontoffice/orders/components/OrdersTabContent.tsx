// src/pages/frontoffice/orders/components/OrdersTabContent.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, AlertCircle, type LucideProps } from "lucide-react";
import { getFormattedPrice } from "@/utils/lang";
import type { OrderReadXML } from "@/pages/backoffice/home/types";
import type { NavigateFunction } from "react-router-dom";

interface OrdersTabContentProps {
  orders: OrderReadXML[];
  loading: boolean;
  error: string | null;
  language: {
    currency: string;
    conversion_change: number;
    locale: string;
    language_id: number;
  };
  getOrderStateInfo: (
    stateId: string | number,
  ) => {
    name: string;
    color: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  };
  onViewOrder: (order: OrderReadXML) => void;
  onRetry: () => void;
  navigate: NavigateFunction;
}

export function OrdersTabContent({
  orders,
  loading,
  error,
  language,
  getOrderStateInfo,
  onViewOrder,
  onRetry,
  navigate,
}: OrdersTabContentProps) {
  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const stateInfo = getOrderStateInfo(
          typeof order.current_state === "object"
            ? order.current_state["#text"]
            : order.current_state,
        );
        const StateIcon = stateInfo.icon;

        return (
          <Card
            key={order.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewOrder(order)}
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
                      language.locale,
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order);
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
  );
}
