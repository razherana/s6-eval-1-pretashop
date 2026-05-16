// src/pages/backoffice/home/components/FastResetModalComponent.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Zap, Package, ShoppingCart, Users, FolderTree, Percent, Layers, Ruler, ClipboardList, CreditCard, History, FileText, Box, ClipboardCheck, Pin } from "lucide-react";
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
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const updateStep = (index: number, updates: Partial<ResetStep>) => {
    setSteps(prev => prev.map((step, i) => i === index ? { ...step, ...updates } : step));
  };

  const handleFastReset = async () => {
    setIsRunning(true);
    setCompleted(false);
    setCurrentStepIndex(-1);

    try {
      // Step 1: Tax Rules (delete first - depend on tax rule groups)
      setCurrentStepIndex(0);
      updateStep(0, { status: 'running' });
      const taxRules = await fetchTaxRules(1000, 0);
      updateStep(0, { total: taxRules.length });
      const taxRuleIds = taxRules.map(t => t.id);
      const taxRuleResult = await resetTaxRules(taxRuleIds);
      updateStep(0, {
        status: taxRuleResult.failedTaxRuleIds.length === 0 ? 'success' : 'failed',
        deleted: taxRuleResult.deletedTaxRuleIds.length,
        failed: taxRuleResult.failedTaxRuleIds.length
      });

      // Step 2: Tax Rule Groups (depend on taxes)
      setCurrentStepIndex(1);
      updateStep(1, { status: 'running' });
      const taxRuleGroups = await fetchTaxRuleGroups(1000, 0);
      updateStep(1, { total: taxRuleGroups.length });
      const taxRuleGroupIds = taxRuleGroups.map(t => t.id);
      const taxRuleGroupResult = await resetTaxRuleGroups(taxRuleGroupIds);
      updateStep(1, {
        status: taxRuleGroupResult.failedTaxRuleGroupIds.length === 0 ? 'success' : 'failed',
        deleted: taxRuleGroupResult.deletedTaxRuleGroupIds.length,
        failed: taxRuleGroupResult.failedTaxRuleGroupIds.length
      });

      // Step 3: Taxes (depend on products but we delete products later anyway)
      setCurrentStepIndex(2);
      updateStep(2, { status: 'running' });
      const taxes = await fetchTaxes(1000, 0);
      updateStep(2, { total: taxes.length });
      const taxIds = taxes.map(t => t.id);
      const taxResult = await resetTaxes(taxIds);
      updateStep(2, {
        status: taxResult.failedTaxIds.length === 0 ? 'success' : 'failed',
        deleted: taxResult.deletedTaxIds.length,
        failed: taxResult.failedTaxIds.length
      });

      // Step 4: Order Payments (depend on orders, so delete first)
      setCurrentStepIndex(3);
      updateStep(3, { status: 'running' });
      const orderPayments = await fetchOrderPayments(1000, 0);
      updateStep(3, { total: orderPayments.length });
      const orderPaymentIds = orderPayments.map(op => op.id);
      const orderPaymentResult = await resetOrderPayments(orderPaymentIds);
      updateStep(3, {
        status: orderPaymentResult.failedOrderPaymentIds.length === 0 ? 'success' : 'failed',
        deleted: orderPaymentResult.deletedOrderPaymentIds.length,
        failed: orderPaymentResult.failedOrderPaymentIds.length
      });

      // Step 5: Order Histories (depend on orders, so delete first)
      setCurrentStepIndex(4);
      updateStep(4, { status: 'running' });
      const orderHistories = await fetchOrderHistories(1000, 0);
      updateStep(4, { total: orderHistories.length });
      const orderHistoryIds = orderHistories.map(oh => oh.id);
      const orderHistoryResult = await resetOrderHistories(orderHistoryIds);
      updateStep(4, {
        status: orderHistoryResult.failedOrderHistoryIds.length === 0 ? 'success' : 'failed',
        deleted: orderHistoryResult.deletedOrderHistoryIds.length,
        failed: orderHistoryResult.failedOrderHistoryIds.length
      });

      // Step 6: Order Invoices (depend on orders, so delete first)
      setCurrentStepIndex(5);
      updateStep(5, { status: 'running' });
      const orderInvoices = await fetchOrderInvoices(1000, 0);
      updateStep(5, { total: orderInvoices.length });
      const orderInvoiceIds = orderInvoices.map(oi => oi.id);
      const orderInvoiceResult = await resetOrderInvoices(orderInvoiceIds);
      updateStep(5, {
        status: orderInvoiceResult.failedOrderInvoiceIds.length === 0 ? 'success' : 'failed',
        deleted: orderInvoiceResult.deletedOrderInvoiceIds.length,
        failed: orderInvoiceResult.failedOrderInvoiceIds.length
      });

      // Step 7: Orders
      setCurrentStepIndex(6);
      updateStep(6, { status: 'running' });
      const orders = await fetchOrders(1000, 0);
      updateStep(6, { total: orders.length });
      const orderIds = orders.map(o => o.id);
      const orderResult = await resetOrders(orderIds);
      updateStep(6, {
        status: orderResult.failedOrderIds.length === 0 ? 'success' : 'failed',
        deleted: orderResult.deletedOrderIds.length,
        failed: orderResult.failedOrderIds.length
      });

      // Step 8: Carts
      setCurrentStepIndex(7);
      updateStep(7, { status: 'running' });
      const cartResult = await resetCarts();
      updateStep(7, {
        status: cartResult.failedCartIds.length === 0 ? 'success' : 'failed',
        deleted: cartResult.deletedCartIds.length,
        failed: cartResult.failedCartIds.length
      });

      // Step 9: Customers
      setCurrentStepIndex(8);
      updateStep(8, { status: 'running' });
      const customers = await fetchCustomers(1000, 0);
      updateStep(8, { total: customers.length });
      const customerIds = customers.map(c => c.id);
      const customerResult = await resetCustomers(customerIds);
      updateStep(8, {
        status: customerResult.failedCustomerIds.length === 0 ? 'success' : 'failed',
        deleted: customerResult.deletedCustomerIds.length,
        failed: customerResult.failedCustomerIds.length
      });

      // Step 10: Products
      setCurrentStepIndex(9);
      updateStep(9, { status: 'running' });
      const products = await fetchProducts(1000, 0);
      updateStep(9, { total: products.length });
      const productIds = products.map(p => p.id);
      const productResult = await resetProducts(productIds);
      updateStep(9, {
        status: productResult.failedProductIds.length === 0 ? 'success' : 'failed',
        deleted: productResult.deletedProductIds.length,
        failed: productResult.failedProductIds.length
      });

      // Step 11: Categories (except id 1 and 2)
      setCurrentStepIndex(10);
      updateStep(10, { status: 'running' });
      const categories = await fetchCategories(1000, 0);
      const categoryIds = categories
        .filter(c => c.id !== 1 && c.id !== 2)
        .map(c => c.id);
      updateStep(10, { total: categoryIds.length });
      const categoryResult = await resetCategories(categoryIds);
      updateStep(10, {
        status: categoryResult.failedCategoryIds.length === 0 ? 'success' : 'failed',
        deleted: categoryResult.deletedCategoryIds.length,
        failed: categoryResult.failedCategoryIds.length
      });

      // Step 12: Stocks
      setCurrentStepIndex(11);
      updateStep(11, { status: "running" });
      const stockResult = await resetApi('stock', 'stocks');
      updateStep(11, {
        status: stockResult.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: stockResult.deletedApiIds.length,
        failed: stockResult.failedApiIds.length
      });

      // Step 13: Stock movements
      setCurrentStepIndex(12);
      updateStep(12, { status: "running" });
      const stockMovementReasonsResult = await resetApi('stock_movement', 'stock_movements', 'stock_mvt', 'stock_mvts');
      updateStep(12, {
        status: stockMovementReasonsResult.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: stockMovementReasonsResult.deletedApiIds.length,
        failed: stockMovementReasonsResult.failedApiIds.length
      });

      // Step 14: Addresses
      setCurrentStepIndex(13);
      updateStep(13, { status: "running" });
      const addressesResult = await resetApi('address', 'addresses');
      updateStep(13, {
        status: addressesResult.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: addressesResult.deletedApiIds.length,
        failed: addressesResult.failedApiIds.length
      });

      // Step 15: Stock movements reasons
      setCurrentStepIndex(14);
      updateStep(14, { status: "running" });
      const stockMovementReasons = await resetApi('stock_movement_reason', 'stock_movement_reasons');
      updateStep(14, {
        status: stockMovementReasons.failedApiIds.length === 0 ? 'success' : 'failed',
        deleted: stockMovementReasons.deletedApiIds.length,
        failed: stockMovementReasons.failedApiIds.length
      });


      setCompleted(true);

      // Calculate totals after all steps are done
      const finalSteps = steps;
      const totalDeleted = finalSteps.reduce((sum, s) => sum + s.deleted, 0);
      const totalFailed = finalSteps.reduce((sum, s) => sum + s.failed, 0);

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
        setCompleted(false);
        setCurrentStepIndex(-1);
      }
    }
  };

  const totalProgress = steps.length > 0
    ? Math.round((steps.filter(s => s.status === 'success' || s.status === 'failed').length / steps.length) * 100)
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
            This will delete all data in the correct dependency order.
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

        {/* Steps List */}
        <ScrollArea className="max-h-80">
          <div className="space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${step.status === 'running' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' :
                  step.status === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' :
                    step.status === 'failed' ? 'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800' :
                      'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
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
        {!isRunning && !completed && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently delete <strong>all</strong> tax rules, tax rule groups, taxes, order payments, order histories, order invoices, orders, carts, customers, products, and categories. This action cannot be undone.
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
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting... ({currentStepIndex + 1}/{steps.length})
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Fast Reset All Data
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}