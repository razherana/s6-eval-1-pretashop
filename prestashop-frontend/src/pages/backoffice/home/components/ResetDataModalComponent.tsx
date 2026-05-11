import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Package, ShoppingCart, Users } from "lucide-react";
import { useState, useCallback } from "react";
import { type ProductReadXML, type OrderReadXML, type CustomerReadXML } from "../types";
import { resetProducts, resetOrders, resetCustomers } from "../services";
import { ProductsTab } from "./reset-data/ProductsTab";
import { OrdersTab } from "./reset-data/OrdersTab";
import { CustomersTab } from "./reset-data/CustomersTab";
import { DeleteStatusTable } from "./reset-data/DeleteStatusTable";
import { toast } from "sonner";
import { getItemName } from "./reset-data/utils";

interface ResetDataModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onResetComplete?: () => void;
}

export type ResetType = 'products' | 'orders' | 'customers';
export type DataItem = ProductReadXML | OrderReadXML | CustomerReadXML;

export interface DeleteStatus {
  id: number;
  name: string;
  status: 'pending' | 'deleting' | 'success' | 'failed';
  error?: string;
}

interface ResetOption {
  type: ResetType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const RESET_OPTIONS: ResetOption[] = [
  { type: 'products', label: 'Products', icon: <Package className="h-4 w-4" />, description: 'Delete selected products from your catalog' },
  { type: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" />, description: 'Delete selected orders from your store' },
  { type: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" />, description: 'Delete selected customer accounts' }
];

export function ResetDataModalComponent({ open, setOpen, onResetComplete }: ResetDataModalProps) {
  const [activeTab, setActiveTab] = useState<ResetType>('products');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteStatuses, setDeleteStatuses] = useState<DeleteStatus[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) {
      toast.error(`Please select at least one ${activeTab.slice(0, -1)} to delete`);
      return;
    }

    setIsDeleting(true);
    setDeleteComplete(false);

    const idsToDelete = Array.from(selectedIds);
    const initialStatuses: DeleteStatus[] = idsToDelete.map(id => ({
      id,
      name: getItemName(data.find(d => d.id === id)!, activeTab),
      status: 'pending' as const
    }));
    setDeleteStatuses(initialStatuses);

    try {
      const result = activeTab === 'products' ? await resetProducts(idsToDelete) :
        activeTab === 'orders' ? await resetOrders(idsToDelete) :
          await resetCustomers(idsToDelete);

      const deletedIds = 'deletedProductIds' in result ? result.deletedProductIds :
        'deletedOrderIds' in result ? result.deletedOrderIds :
          result.deletedCustomerIds;
      const failedIds = 'failedProductIds' in result ? result.failedProductIds :
        'failedOrderIds' in result ? result.failedOrderIds :
          result.failedCustomerIds;

      setDeleteStatuses(prev => prev.map(status => ({
        ...status,
        status: deletedIds.includes(status.id) ? 'success' : 'failed',
        error: failedIds.includes(status.id) ? 'Failed to delete' : undefined
      })));

      setDeleteComplete(true);

      if (deletedIds.length > 0 && failedIds.length === 0)
        toast.success(`Successfully deleted ${deletedIds.length} ${activeTab}`);
      else if (deletedIds.length > 0)
        toast.warning(`Deleted ${deletedIds.length}, ${failedIds.length} failed`);
      else
        toast.error(`Failed to delete all ${failedIds.length} ${activeTab}`);

      onResetComplete?.();
    } catch (error) {
      toast.error("Failed to delete items");
      setDeleteStatuses(prev => prev.map(s => ({ ...s, status: 'failed' as const, error: 'Unexpected error' })));
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, activeTab, data, onResetComplete]);

  const handleClose = () => {
    if (!isDeleting) {
      setOpen(false);
      setSelectedIds(new Set());
      setDeleteStatuses([]);
      setDeleteComplete(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ResetType);
    setSelectedIds(new Set());
    setDeleteStatuses([]);
    setDeleteComplete(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-200 max-h-[85vh] flex flex-col p-0">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reset Data
            </DialogTitle>
            <DialogDescription>
              Select the type of data you want to reset. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="w-full">
              {RESET_OPTIONS.map(option => (
                <TabsTrigger key={option.type} value={option.type} className="flex-1 gap-2">
                  {option.icon}
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {!isDeleting && !deleteComplete && data.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border mt-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {RESET_OPTIONS.find(o => o.type === activeTab)?.icon}
                  <span className="ml-2">{data.length} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {isDeleting || deleteComplete ? (
            <div className="py-4">
              <DeleteStatusTable statuses={deleteStatuses} />
            </div>
          ) : (
            <div className="py-4">
              {activeTab === 'products' && (
                <ProductsTab
                  onDataLoaded={setData}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersTab
                  onDataLoaded={setData}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
              {activeTab === 'customers' && (
                <CustomersTab
                  onDataLoaded={setData}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t bg-white px-6 py-4">
          {selectedIds.size > 0 && !isDeleting && !deleteComplete && (
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to delete <strong>{selectedIds.size} {activeTab.slice(0, -1)}{selectedIds.size > 1 ? 's' : ''}</strong>. This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
              {deleteComplete ? 'Close' : 'Cancel'}
            </Button>
            {!deleteComplete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={selectedIds.size === 0 || isDeleting}
              >
                {isDeleting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                ) : (
                  <><AlertTriangle className="mr-2 h-4 w-4" />
                    Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}