import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Percent } from "lucide-react";
import { type TaxReadXML } from "../../types";
import { fetchTaxes } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";
import { Badge } from "@/components/ui/badge";

interface TaxesTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function TaxesTab({ onDataLoaded, selectedIds, onSelectionChange }: TaxesTabProps) {
  const [taxes, setTaxes] = useState<TaxReadXML[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTaxes = async () => {
      setLoading(true);
      try {
        const data = await fetchTaxes(100, 0);
        setTaxes(data);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading taxes:", error);
        toast.error("Failed to load taxes");
      } finally {
        setLoading(false);
      }
    };
    loadTaxes();
  }, [onDataLoaded]);

  const allSelected = useMemo(() =>
    taxes.length > 0 && selectedIds.size === taxes.length,
    [taxes, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(taxes.map(t => t.id)));
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

  if (taxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Percent className="h-8 w-8 mb-2 opacity-50" />
        <p>No taxes found</p>
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
            <TableHead>Name</TableHead>
            <TableHead className="w-30">Rate</TableHead>
            <TableHead className="w-30">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.map((tax) => (
            <TableRow
              key={tax.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(tax.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(tax.id)}
                  onCheckedChange={() => handleSelect(tax.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{tax.id}</TableCell>
              <TableCell className="font-medium">
                {tax.name?.language?.[0]?.['#text'] || `Tax ${tax.id}`}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{tax.rate}%</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={tax.active === '1' ? 'default' : 'secondary'}>
                  {tax.active === '1' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}