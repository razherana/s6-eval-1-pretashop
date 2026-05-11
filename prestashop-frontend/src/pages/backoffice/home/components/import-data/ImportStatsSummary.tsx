import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TotalStats } from "../../services";

interface ImportStatsSummaryProps {
  progress: number;
  importComplete: boolean;
  totalStats: TotalStats;
}

export function ImportStatsSummary({
  progress,
  importComplete,
  totalStats,
}: ImportStatsSummaryProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Import Progress</h4>
          <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        {importComplete && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center border">
              <div className="text-xl font-bold text-emerald-600">
                {totalStats.successProducts}/{totalStats.totalProducts}
              </div>
              <div className="text-xs text-muted-foreground">Products</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border">
              <div className="text-xl font-bold text-blue-600">
                {totalStats.successVariants}/{totalStats.totalVariants}
              </div>
              <div className="text-xs text-muted-foreground">Variants</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border">
              <div className="text-xl font-bold text-purple-600">
                {totalStats.successCustomers}/{totalStats.totalCustomers}
              </div>
              <div className="text-xs text-muted-foreground">Customers</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}