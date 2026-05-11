import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, FileSpreadsheet, FileText } from "lucide-react";
import { type ImportedRow } from "../../services";
import { ResultsTable } from "./ResultsTable";

interface ResultsTabsProps {
  activeResultTab: string;
  setActiveResultTab: (tab: string) => void;
  productsCount: number;
  variantsCount: number;
  customersCount: number;
  headers: string[];
  rows: ImportedRow[];
}

export function ResultsTabs({
  activeResultTab,
  setActiveResultTab,
  productsCount,
  variantsCount,
  customersCount,
  headers,
  rows,
}: ResultsTabsProps) {
  return (
    <Tabs value={activeResultTab} onValueChange={setActiveResultTab} className="flex-1 flex flex-col">
      <div className="px-6 pt-4 border-b">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {productsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="variants" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Variants
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {variantsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <FileText className="h-4 w-4" />
            Customers
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {customersCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {["products", "variants", "customers"].map((tab) => (
        <TabsContent key={tab} value={tab} className="flex-1 m-0 overflow-auto">
          <div className="p-6">
            <ResultsTable headers={headers} rows={rows} />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}