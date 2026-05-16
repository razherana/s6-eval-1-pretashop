// src/pages/backoffice/home/components/StockManagementModalComponent.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Boxes,
  Loader2,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { fetchProductStock, updateStockQuantity, type ProductStockInfo } from "../services/stockServices";
import { fetchProductCombinations } from "@/pages/frontoffice/home/services";
import { useFrontofficeData } from "@/hooks/useFrontofficeData";
import { useLanguage } from "@/hooks/useLanguage";
import { getWithLanguage } from "@/utils/lang";
import { toast } from "sonner";
import type { ProductReadXML } from "../types";
import { assureArray } from "@/utils/xml";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface StockManagementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: ProductReadXML | null;
}

interface CombinationOption {
  id: number;
  reference: string;
  name: string;
}

const formatMovementDate = (value: string): string => {
  if (!value) return new Date().toISOString().slice(0, 19).replace("T", " ");
  const isoDate = value.length === 16 ? `${value}:00` : value;
  return isoDate.replace("T", " ");
};

export function StockManagementModalComponent({
  open,
  setOpen,
  product,
}: StockManagementModalProps) {
  const { data } = useFrontofficeData();
  const { language } = useLanguage();

  const [stockInfo, setStockInfo] = useState<ProductStockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [combinations, setCombinations] = useState<CombinationOption[]>([]);
  const [selectedCombinationId, setSelectedCombinationId] = useState<string>("");
  const [editStockId, setEditStockId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [movementDateTime, setMovementDateTime] = useState<string>("");

  // Is movement mode (set directly the quantity or make a movement)
  const [isMovement, setIsMovement] = useState(false);

  const loadStock = useCallback(async () => {
    if (!product) return;

    try {
      setLoading(true);
      const stock = await fetchProductStock(product.id);
      setStockInfo(stock);
    } catch (error) {
      console.error("Error loading stock:", error);
    } finally {
      setLoading(false);
    }
  }, [product]);

  const loadCombinations = useCallback(async () => {
    if (!product) return;

    try {
      const combinationData = assureArray(
        product.associations.combinations.combination,
      );

      if (combinationData.length > 0) {
        const combinationDetails = await fetchProductCombinations(
          product.id,
          data?.combinationsCache,
        );

        const options: CombinationOption[] = combinationDetails.map((comb) => {
          let name = comb.reference || `Variant #${comb.id}`;

          // Build combination name from option values
          if (comb.associations?.product_option_values?.product_option_value) {
            const ovs = assureArray(
              comb.associations.product_option_values.product_option_value,
            );
            const names = ovs
              .map((ov) => {
                const ovDetail = data?.productOptionValues.get(ov.id);
                if (ovDetail && language) {
                  return getWithLanguage(ovDetail.name, language.language_id);
                }
                return null;
              })
              .filter(Boolean);
            if (names.length > 0) {
              name = names.join(", ");
            }
          }

          return {
            id: comb.id,
            reference: comb.reference,
            name,
          };
        });

        setCombinations(options);
      }
    } catch (error) {
      console.error("Error loading combinations:", error);
    }
  }, [product, data, language]);

  useEffect(() => {
    (async () => {
      if (open && product) {
        await loadStock();
        await loadCombinations();
      } else {
        setStockInfo(null);
        setCombinations([]);
        setSelectedCombinationId("");
        setEditStockId(null);
        setEditQuantity("");
        setMovementDateTime("");
      }
    })();
  }, [open, product, loadStock, loadCombinations]);

  const handleEditStock = (stockId: number, currentQuantity: number) => {
    setEditStockId(stockId);
    setEditQuantity(currentQuantity.toString());
    if (!movementDateTime) {
      setMovementDateTime(new Date().toISOString().slice(0, 16));
    }
  };

  const handleSaveStock = async () => {
    if (!product || editStockId === null || !editQuantity) return;

    const quantity = parseInt(editQuantity);
    if (isNaN(quantity) || (quantity < 0 && !isMovement)) {
      toast.error("Please enter a valid quantity. You are not in movement mode");
      return;
    }

    setSaving(true);
    try {
      await updateStockQuantity(
        editStockId,
        currentStock ? currentStock.quantity : 0,
        quantity,
        language,
        isMovement,
        "Manual adjustment",
        formatMovementDate(movementDateTime),
      );
      setEditStockId(null);
      setEditQuantity("");
      setMovementDateTime("");
      await loadStock();
    } catch (error) {
      console.error("Error saving stock:", error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStock = (): {
    stockId: number;
    quantity: number;
  } | null => {
    if (!stockInfo) return null;

    if (selectedCombinationId && selectedCombinationId !== "0") {
      const combId = parseInt(selectedCombinationId);
      const stock = stockInfo.stocks.get(combId);
      if (stock) {
        return {
          stockId: stock.id,
          quantity: stock.quantity,
        };
      }
    } else if (stockInfo.defaultStock && stockInfo.stocks.size === 0) {
      return {
        stockId: stockInfo.defaultStock.id,
        quantity: stockInfo.defaultStock.quantity,
      };
    }
    return null;
  };

  const currentStock = getCurrentStock();
  const hasCombinations = combinations.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            Stock Management
          </DialogTitle>
          <DialogDescription>
            {product?.name && language
              ? getWithLanguage(product.name, language.language_id)
              : "Product"}{" "}
            - REF: {product?.reference || "N/A"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Combination Select */}
            {hasCombinations && (
              <div className="space-y-2">
                <Label>Select Variant</Label>
                <Select
                  value={selectedCombinationId}
                  onValueChange={(value) => {
                    setSelectedCombinationId(value);
                    setEditStockId(null);
                    setEditQuantity("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinations.map((comb) => (
                      <SelectItem key={comb.id} value={comb.id.toString()}>
                        {comb.name}
                        {comb.reference && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({comb.reference})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Current Stock Display */}
            {currentStock && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Current Stock:
                    </span>
                  </div>
                  <Badge
                    variant={
                      currentStock.quantity > 10
                        ? "default"
                        : currentStock.quantity > 0
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-lg px-3"
                  >
                    {currentStock.quantity}
                  </Badge>
                </div>
                {currentStock.quantity === 0 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Out of stock</span>
                  </div>
                )}
              </div>
            )}

            {/* Edit Stock */}
            {currentStock && (
              <div className="space-y-3 border rounded-lg p-4">
                <Label className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Stock Or Make a Stock Movement
                </Label>
                {editStockId !== null ? (
                  <div className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="update-movement">Movement Mode</Label>
                          <Switch id="update-movement" onCheckedChange={(isChecked) => {
                            setIsMovement(isChecked);
                          }} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align="start">
                        <p>If <b>disabled</b>, this will update the current quantity but if <b>enabled</b> it will remove or add the quantity to the current stock.</p>
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="New quantity"
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveStock();
                          if (e.key === "Escape") {
                            setEditStockId(null);
                            setEditQuantity("");
                            setMovementDateTime("");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveStock}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditStockId(null);
                          setEditQuantity("");
                          setMovementDateTime("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement-datetime">Movement date</Label>
                      <Input
                        id="movement-datetime"
                        type="datetime-local"
                        value={movementDateTime}
                        onChange={(e) => setMovementDateTime(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleEditStock(
                        currentStock.stockId,
                        currentStock.quantity,
                      )
                    }
                  >
                    Edit Quantity or Make a Movement
                  </Button>
                )}
              </div>
            )}

            {/* All Variants Stock (table for products with combinations) */}
            {hasCombinations && stockInfo && stockInfo.stocks.size > 0 && (
              <div className="space-y-2">
                <Label>All Variants Stock</Label>
                <ScrollArea className="h-40">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(stockInfo.stocks.entries()).map(
                        ([attrId, stock]) => {
                          const combination = combinations.find(
                            (c) => c.id === attrId,
                          );
                          const quantity = stock.quantity;

                          return (
                            <TableRow key={attrId}>
                              <TableCell className="text-sm">
                                {combination?.name || `Variant #${attrId}`}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    quantity > 10
                                      ? "default"
                                      : quantity > 0
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {quantity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}