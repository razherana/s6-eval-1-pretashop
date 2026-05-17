// src/pages/backoffice/home/components/FastResetModalComponent.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Zap, Package, ShoppingCart, Users, FolderTree, Percent, Layers, Ruler, ClipboardList, CreditCard, History, FileText, Box, ClipboardCheck, Pin, Database } from "lucide-react";
import { fetchProducts, fetchOrders, fetchCustomers, fetchCategories, fetchTaxes, fetchTaxRuleGroups, fetchTaxRules, fetchOrderPayments, fetchOrderHistories, fetchOrderInvoices, resetProducts, resetOrders, resetCustomers, resetCategories, resetTaxes, resetTaxRuleGroups, resetTaxRules, resetCarts, resetOrderPayments, resetOrderHistories, resetOrderInvoices, resetApi } from "../services";
import { toast } from "sonner";

interface FastResetModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onResetComplete?: () => void;
}

interface ResetStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed';
  total: number;
  deleted: number;
  failed: number;
}

// Order matters: delete dependencies first, then parents
const STEPS = [
  { id: 'tax_rules', label: 'Tax Rules', icon: <Ruler className="h-4 w-4" /> },
  { id: 'tax_rule_groups', label: 'Tax Rule Groups', icon: <Layers className="h-4 w-4" /> },
  { id: 'taxes', label: 'Taxes', icon: <Percent className="h-4 w-4" /> },
  { id: 'order_payments', label: 'Order Payments', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'order_histories', label: 'Order Histories', icon: <History className="h-4 w-4" /> },
  { id: 'order_invoices', label: 'Order Invoices', icon: <FileText className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'carts', label: 'Carts', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { id: 'stock_availables', label: 'Stock Availables', icon: <Database className="h-4 w-4" /> },
  { id: 'categories', label: 'Categories', icon: <FolderTree className="h-4 w-4" /> },
  { id: 'stocks', label: 'Stocks', icon: <Box className="h-4 w-4" /> },
  { id: 'stock_movements', label: 'Stock Movements', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'addresses', label: 'Addresses', icon: <Pin className="h-4 w-4" /> },
  { id: 'stock_movement_reasons', label: 'Stock Movements Reasons', icon: <ClipboardCheck className="h-4 w-4" /> },
];

export function FastResetModalComponent({ open, setOpen, onResetComplete }: FastResetModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [steps, setSteps] = useState<ResetStep[]>(
    STEPS.map(s => ({ ...s, status: 'pending' as const, total: 0, deleted: 0, failed: 0 }))
  );
  const [selectedSteps, setSelectedSteps] = useState<Set<number>>(
    new Set(STEPS.map((_, i) => i))
  );

  const updateStep = (index: number, updates: Partial<ResetStep>) => {
    setSteps(prev => prev.map((step, i) => i === index ? { ...step, ...updates } : step));
  };

  const toggleStep = (index: number) => {
    setSelectedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAllSteps = () => {
    setSelectedSteps(new Set(STEPS.map((_, i) => i)));
  };

  const deselectAllSteps = () => {
    setSelectedSteps(new Set());
  };

  const stepExecutors: Record<number, () => Promise<void>> = {
    0: async () => {
      const taxRules = await fetchTaxRules(1000, 0);
      updateStep(0, { total: taxRules.length });
      const taxRuleIds = taxRules.map(t => t.id);
      const result = await resetTaxRules(taxRuleIds);
      updateStep(0, {
        status: result.failedTaxRuleIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedTaxRuleIds.length,
        failed: result.failedTaxRuleIds.length
      });
    },
    1: async () => {
      const taxRuleGroups = await fetchTaxRuleGroups(1000, 0);
      updateStep(1, { total: taxRuleGroups.length });
      const ids = taxRuleGroups.map(t => t.id);
      const result = await resetTaxRuleGroups(ids);
      updateStep(1, {
        status: result.failedTaxRuleGroupIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedTaxRuleGroupIds.length,
        failed: result.failedTaxRuleGroupIds.length
      });
    },
    2: async () => {
      const taxes = await fetchTaxes(1000, 0);
      updateStep(2, { total: taxes.length });
      const ids = taxes.map(t => t.id);
      const result = await resetTaxes(ids);
      updateStep(2, {
        status: result.failedTaxIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedTaxIds.length,
        failed: result.failedTaxIds.length
      });
    },
    3: async () => {
      const orderPayments = await fetchOrderPayments(1000, 0);
      updateStep(3, { total: orderPayments.length });
      const ids = orderPayments.map(op => op.id);
      const result = await resetOrderPayments(ids);
      updateStep(3, {
        status: result.failedOrderPaymentIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedOrderPaymentIds.length,
        failed: result.failedOrderPaymentIds.length
      });
    },
    4: async () => {
      const orderHistories = await fetchOrderHistories(1000, 0);
      updateStep(4, { total: orderHistories.length });
      const ids = orderHistories.map(oh => oh.id);
      const result = await resetOrderHistories(ids);
      updateStep(4, {
        status: result.failedOrderHistoryIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedOrderHistoryIds.length,
        failed: result.failedOrderHistoryIds.length
      });
    },
    5: async () => {
      const orderInvoices = await fetchOrderInvoices(1000, 0);
      updateStep(5, { total: orderInvoices.length });
      const ids = orderInvoices.map(oi => oi.id);
      const result = await resetOrderInvoices(ids);
      updateStep(5, {
        status: result.failedOrderInvoiceIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedOrderInvoiceIds.length,
        failed: result.failedOrderInvoiceIds.length
      });
    },
    6: async () => {
      const orders = await fetchOrders(1000, 0);
      updateStep(6, { total: orders.length });
      const ids = orders.map(o => o.id);
      const result = await resetOrders(ids);
      updateStep(6, {
        status: result.failedOrderIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedOrderIds.length,
        failed: result.failedOrderIds.length
      });
    },
    7: async () => {
      const result = await resetCarts();
      updateStep(7, {
        status: result.failedCartIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedCartIds.length,
        failed: result.failedCartIds.length
      });
    },
    8: async () => {
      const customers = await fetchCustomers(1000, 0);
      updateStep(8, { total: customers.length });
      const ids = customers.map(c => c.id);
      const result = await resetCustomers(ids);
      updateStep(8, {
        status: result.failedCustomerIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedCustomerIds.length,
        failed: result.failedCustomerIds.length
      });
    },
    9: async () => {
      const products = await fetchProducts(1000, 0);
      updateStep(9, { total: products.length });
      const ids = products.map(p => p.id);
      const result = await resetProducts(ids);
      updateStep(9, {
        status: result.failedProductIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedProductIds.length,
        failed: result.failedProductIds.length
      });
    },
    10: async () => {
      const result = await resetApi('stock_available', 'stock_availables');
      updateStep(10, {
        status: result.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedApiIds.length,
        failed: result.failedApiIds.length
      });
    },
    11: async () => {
      const categories = await fetchCategories(1000, 0);
      const categoryIds = categories
        .filter(c => c.id !== 1 && c.id !== 2)
        .map(c => c.id);
      updateStep(11, { total: categoryIds.length });
      const result = await resetCategories(categoryIds);
      updateStep(11, {
        status: result.failedCategoryIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedCategoryIds.length,
        failed: result.failedCategoryIds.length
      });
    },
    12: async () => {
      const result = await resetApi('stock', 'stocks');
      updateStep(12, {
        status: result.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedApiIds.length,
        failed: result.failedApiIds.length
      });
    },
    13: async () => {
      const result = await resetApi('stock_movement', 'stock_movements', 'stock_mvt', 'stock_mvts');
      updateStep(13, {
        status: result.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedApiIds.length,
        failed: result.failedApiIds.length
      });
    },
    14: async () => {
      const result = await resetApi('address', 'addresses');
      updateStep(14, {
        status: result.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedApiIds.length,
        failed: result.failedApiIds.length
      });
    },
    15: async () => {
      const result = await resetApi('stock_movement_reason', 'stock_movement_reasons');
      updateStep(15, {
        status: result.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: result.deletedApiIds.length,
        failed: result.failedApiIds.length
      });
    },
  };

  const handleFastReset = async () => {
    setIsRunning(true);
    setCompleted(false);

    try {
      const selectedIndices = Array.from(selectedSteps).sort((a, b) => a - b);

      for (const index of selectedIndices) {
        updateStep(index, { status: 'running' });
        await stepExecutors[index]();
      }

      setCompleted(true);

      const totalDeleted = steps.reduce((sum, s) => sum + s.deleted, 0);
      const totalFailed = steps.reduce((sum, s) => sum + s.failed, 0);

      if (totalFailed === 0) {
        toast.success(`Fast reset complete! Deleted ${totalDeleted} items`);
      } else {
        toast.warning(`Fast reset complete with ${totalFailed} failures. ${totalDeleted} items deleted.`);
      }

      onResetComplete?.();
    } catch (error) {
      console.error("Fast reset error:", error);
      toast.error("Fast reset failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    if (!isRunning) {
      setOpen(false);
      if (completed) {
        setSteps(STEPS.map(s => ({ ...s, status: 'pending' as const, total: 0, deleted: 0, failed: 0 })));
        setSelectedSteps(new Set(STEPS.map((_, i) => i)));
        setCompleted(false);
      }
    }
  };

  const selectedCount = selectedSteps.size;
  const completedSelectedCount = steps.filter(
    (s, i) => selectedSteps.has(i) && (s.status === 'success' || s.status === 'failed')
  ).length;
  const totalProgress = selectedCount > 0
    ? Math.round((completedSelectedCount / selectedCount) * 100)
    : 0;

  const totalDeleted = steps.reduce((sum, s) => sum + s.deleted, 0);
  const totalFailed = steps.reduce((sum, s) => sum + s.failed, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Fast Reset
          </DialogTitle>
          <DialogDescription>
            Select the steps you want to execute. They will run in the correct dependency order.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {(isRunning || completed) && (
          <div className="space-y-2">
            <Progress value={totalProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalProgress}% complete</span>
              <span>
                {totalDeleted} deleted, {totalFailed} failed
              </span>
            </div>
          </div>
        )}

        {/* Select / Deselect All (only when not running) */}
        {!isRunning && !completed && (
          <div className="flex items-center gap-2 px-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllSteps}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAllSteps}>
              Deselect All
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedCount}/{STEPS.length} selected
            </span>
          </div>
        )}

        {/* Steps List */}
        <ScrollArea className="max-h-80">
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${step.status === 'running' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' :
                  step.status === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' :
                    step.status === 'failed' ? 'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800' :
                      'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox for selection (only when not running) */}
                  {!isRunning && !completed && (
                    <Checkbox
                      id={`step-${step.id}`}
                      checked={selectedSteps.has(index)}
                      onCheckedChange={() => toggleStep(index)}
                      className="shrink-0"
                    />
                  )}
                  <Label
                    htmlFor={!isRunning && !completed ? `step-${step.id}` : undefined}
                    className="flex items-center gap-3 cursor-pointer font-normal"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {step.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.label}</p>
                      {(step.total > 0 || step.status === 'running') && (
                        <p className="text-xs text-muted-foreground">
                          {step.status === 'running' ? (
                            <span className="text-blue-500">Deleting...</span>
                          ) : (
                            <>
                              {step.deleted}/{step.total} deleted
                              {step.failed > 0 && (
                                <span className="text-rose-500 ml-1">({step.failed} failed)</span>
                              )}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </Label>
                </div>
                <div>
                  {step.status === 'pending' && (
                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                  )}
                  {step.status === 'running' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {step.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {step.status === 'failed' && (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Warning */}
        {!isRunning && !completed && selectedCount === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select at least one step to execute.
            </AlertDescription>
          </Alert>
        )}
        {!isRunning && !completed && selectedCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently delete <strong>{selectedCount} selected data type(s)</strong>. This action cannot be undone.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRunning}
          >
            {completed ? 'Close' : 'Cancel'}
          </Button>
          {!completed && (
            <Button
              variant="destructive"
              onClick={handleFastReset}
              disabled={isRunning || selectedCount === 0}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting... ({completedSelectedCount}/{selectedCount})
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Selected ({selectedCount})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}