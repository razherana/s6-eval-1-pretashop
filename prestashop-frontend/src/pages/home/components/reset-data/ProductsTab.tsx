import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Package } from "lucide-react";
import { type ProductReadXML } from "../../types";
import { fetchProducts } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";
import { getFormattedPrice, getWithLanguage, useLanguage } from "@/utils/lang";

interface ProductsTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function ProductsTab({ onDataLoaded, selectedIds, onSelectionChange }: ProductsTabProps) {
  const [products, setProducts] = useState<ProductReadXML[]>([]);
  const [loading, setLoading] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(100, 0);
        setProducts(data);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [onDataLoaded]);

  const allSelected = useMemo(() =>
    products.length > 0 && selectedIds.size === products.length,
    [products, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(products.map(p => p.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id))
      newSelected.delete(id);
    else
      newSelected.add(id);
    onSelectionChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Package className="h-8 w-8 mb-2 opacity-50" />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="w-30">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(product.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(product.id)}
                  onCheckedChange={() => handleSelect(product.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{product.id}</TableCell>
              <TableCell className="font-medium">
                {getWithLanguage(product.name, language.language_id)}
              </TableCell>
              <TableCell>{getFormattedPrice(product.price, language.currency, language.conversion_change, language.locale)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}