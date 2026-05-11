import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/hooks/useLanguage";
import { getFormattedPrice } from "@/utils/lang";
import type { OrderDetailReadXML } from "../../types";

export function OrderDetailsRow({ orderId, orderDetails, loadingDetails }: {
  orderId: number;
  orderDetails: Map<number, OrderDetailReadXML[]>;
  loadingDetails: Set<number>;
}) {
  let details = orderDetails.get(orderId);
  const isLoading = loadingDetails.has(orderId);
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <TableRow key={`loading-${orderId}`}>
        <TableCell colSpan={5}>
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (!details || details.length === 0) {
    return (
      <TableRow key={`no-details-${orderId}`}>
        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">
          No order details available
        </TableCell>
      </TableRow>
    );
  }

  if (details && !Array.isArray(details)) {
    details = [details];
  }

  return (
    <>
      {details.map((detail) => (
        <TableRow key={detail.id} className="bg-gray-50/50">
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell colSpan={3}>
            <div className="grid grid-cols-6 gap-4 p-2 text-sm">
              <div>
                <span className="text-muted-foreground">Product:</span>
                <p className="font-medium text-wrap">{detail.product_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ref:</span>
                <p className="font-mono">{detail.product_reference || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Qty:</span>
                <p>{detail.product_quantity}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unit Price:</span>
                <p>{getFormattedPrice(detail.product_price, language.currency, language.conversion_change, language.locale)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">TTC:</span>
                <p>{getFormattedPrice(detail.total_price_tax_incl, language.currency, language.conversion_change, language.locale)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Product ID:</span>
                <p className="font-mono">#{detail.product_id["#text"]}</p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}