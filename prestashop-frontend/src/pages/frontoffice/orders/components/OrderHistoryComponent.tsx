// src/pages/frontoffice/orders/components/OrderHistoryComponent.tsx
import { useEffect, useState } from "react";
import { fetchOrderHistory } from "../services";
import { useFrontofficeData } from "@/hooks/useFrontofficeData";
import { useLanguage } from "@/hooks/useLanguage";
import { getWithLanguage } from "@/utils/lang";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  Ban,
  AlertCircle,
  type LucideProps
} from "lucide-react";
import type { OrderHistoryXML } from "@/pages/backoffice/home/types";

interface OrderHistoryProps {
  orderId: number;
}

export function OrderHistoryComponent({ orderId }: OrderHistoryProps) {
  const [history, setHistory] = useState<OrderHistoryXML[]>([]);
  const [loading, setLoading] = useState(true);
  const { data } = useFrontofficeData();
  const { language } = useLanguage();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const orderHistory = await fetchOrderHistory(orderId);
        setHistory(Array.isArray(orderHistory) ? orderHistory : [orderHistory]);
      } catch (error) {
        console.error("Error loading order history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [orderId]);

  const getStateInfo = (stateId: string | number) => {
    const id = typeof stateId === 'string' ? parseInt(stateId) : stateId;
    const state = data?.orderStates.get(id);

    const stateConfig: Record<number, { icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; color: string; label: string }> = {
      1: { icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Awaiting Payment" },
      2: { icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200", label: "Payment Accepted" },
      3: { icon: Package, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Processing" },
      4: { icon: Truck, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Shipped" },
      5: { icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200", label: "Delivered" },
      6: { icon: Ban, color: "bg-red-100 text-red-700 border-red-200", label: "Canceled" },
      7: { icon: AlertCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Refunded" },
      13: { icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Awaiting COD" },
    };

    const config = stateConfig[id] || {
      icon: Clock,
      color: "bg-gray-100 text-gray-700 border-gray-200",
      label: `State #${id}`
    };

    const stateName = state && language
      ? getWithLanguage(state.name, language.language_id)
      : config.label;

    return { ...config, name: stateName };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2" />
        <p>No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const stateId = typeof entry.id_order_state === 'object'
          ? entry.id_order_state["#text"]
          : entry.id_order_state;

        const stateInfo = getStateInfo(stateId);
        const StateIcon = stateInfo.icon;
        const date = new Date(entry.date_add);

        return (
          <div key={entry.id || index} className="relative">
            {/* Timeline connector */}
            {index < history.length - 1 && (
              <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-border" />
            )}

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full border-2 ${stateInfo.color}`}>
                <StateIcon className="h-4 w-4" />
              </div>

              <div className="flex-1 space-y-1">
                <Badge className={stateInfo.color}>
                  {stateInfo.name}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {date.toLocaleDateString(language?.locale || 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}