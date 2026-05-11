import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { type TotalStats } from "../../services";

interface ResultsHeaderProps {
  totalStats: TotalStats;
}

export function ResultsHeader({ totalStats }: ResultsHeaderProps) {
  return (
    <div className="px-6 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Import Results</h3>
          <p className="text-xs text-muted-foreground">
            Detailed breakdown of all imported data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            {totalStats.successProducts} products
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileSpreadsheet className="h-3 w-3" />
            {totalStats.successVariants} variants
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {totalStats.successCustomers} customers
          </Badge>
          {totalStats.totalImages > 0 && (
            <Badge variant="secondary" className="gap-1">
              <ImageIcon className="h-3 w-3" />
              {totalStats.successImages} images
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}