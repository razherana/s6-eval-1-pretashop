// src/pages/backoffice/dashboard/components/StockHistoryDialog.tsx
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getWithLanguage } from "@/utils/lang";
import { utc } from "@date-fns/utc";
import type { ProductStockRow, StockMovement } from "../services";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStockRow: ProductStockRow | null;
  stockMovements: StockMovement[];
  stockMovementsLoading: boolean;
  language: {
    currency: string;
    conversion_change: number;
    locale: string;
    language_id: number;
  };
  stockHistoryDate: Date | null;
}

/**
 * Compute the running stock level after each movement.
 * Sorted chronologically (oldest first), starting from the initial
 * stock level before the first movement, then applying each movement
 * to get the stock level at each point in time.
 */
function computeStockLevelChartData(
  currentStock: number,
  movements: StockMovement[],
): { date: string; stockLevel: number; fullDate: string }[] {
  if (movements.length === 0) return [];

  // Sort chronologically (oldest first)
  const sorted = [...movements].sort((a, b) =>
    a.date_add.localeCompare(b.date_add),
  );

  // Compute initial stock before any movements
  // currentStock = initialStock + sum(sign * physical_quantity)
  let initialStock = currentStock;
  for (const m of sorted) {
    initialStock -= m.sign * m.physical_quantity;
  }

  // Walk forward applying movements, recording stock after each
  let runningStock = initialStock;
  const result: { date: string; stockLevel: number; fullDate: string }[] = [];

  for (const m of sorted) {
    runningStock += m.sign * m.physical_quantity;
    result.push({
      date: format(parseISO(m.date_add.slice(0, 10), { in: utc }), "dd/MM", {
        in: utc,
      }),
      stockLevel: runningStock,
      fullDate: m.date_add.slice(0, 10),
    });
  }

  return result;
}

export function StockHistoryDialog({
  open,
  onOpenChange,
  selectedStockRow,
  stockMovements,
  stockMovementsLoading,
  language,
  stockHistoryDate,
}: StockHistoryDialogProps) {
  // Filter movements up to the selected date for the table
  const filteredMovements = useMemo(() => {
    if (!stockHistoryDate) return stockMovements;
    const cutoff = format(stockHistoryDate, "yyyy-MM-dd", { in: utc });
    return stockMovements.filter(
      (m) => m.date_add.slice(0, 10) <= cutoff,
    );
  }, [stockMovements, stockHistoryDate]);

  // Chart always uses ALL movements to show the full stock level history
  const stockLevelChartData = useMemo(
    () =>
      selectedStockRow
        ? computeStockLevelChartData(
          selectedStockRow.physicalQuantity,
          stockMovements.filter((m) => m.type === "physical"),
        )
        : [],
    [selectedStockRow, stockMovements],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Stock History</DialogTitle>
          <DialogDescription>
            {selectedStockRow
              ? `${getWithLanguage(selectedStockRow.productName, language.language_id)} — ${selectedStockRow.combinationName}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {stockMovementsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stock Level Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Physical Stock level over time
              </h3>
              {stockLevelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stockLevelChartData}>
                    <defs>
                      <linearGradient
                        id="colorStockLevel"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [value, "Stock level"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="stockLevel"
                      name="Stock level"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorStockLevel)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-52 text-muted-foreground">
                  <p>No movement data for this period</p>
                </div>
              )}
              {selectedStockRow && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>
                    Physical: <strong>{selectedStockRow.physicalQuantity}</strong>
                  </span>
                  <span className={selectedStockRow.virtualQuantity > 0 ? "text-amber-600" : ""}>
                    Reserved: <strong>{selectedStockRow.virtualQuantity}</strong>
                  </span>
                  <span>
                    Available: <strong>{selectedStockRow.quantity}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Movements Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Stock movements
                </h3>
                {stockHistoryDate && stockMovements.length > filteredMovements.length && (
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredMovements.length} of {stockMovements.length} movements
                  </p>
                )}
              </div>
              {filteredMovements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Sign</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {format(
                            parseISO(
                              movement.date_add.replace(" ", "T"),
                              { in: utc },
                            ),
                            "dd MMMM yyyy",
                            { locale: fr },
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "physical"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              movement.type === "reserved"
                                ? "text-amber-600 border-amber-300"
                                : ""
                            }
                          >
                            {movement.type === "physical"
                              ? "Physical"
                              : "Reserved"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              movement.sign >= 0 ? "default" : "destructive"
                            }
                          >
                            {movement.sign >= 0 ? "+" : "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {movement.physical_quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No stock movements recorded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
