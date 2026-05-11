import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Ruler } from "lucide-react";
import { type TaxRuleReadXML } from "../../types";
import { fetchTaxRules } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";

interface TaxRulesTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function TaxRulesTab({ onDataLoaded, selectedIds, onSelectionChange }: TaxRulesTabProps) {
  const [taxRules, setTaxRules] = useState<TaxRuleReadXML[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTaxRules = async () => {
      setLoading(true);
      try {
        const data = await fetchTaxRules(100, 0);
        setTaxRules(data);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading tax rules:", error);
        toast.error("Failed to load tax rules");
      } finally {
        setLoading(false);
      }
    };
    loadTaxRules();
  }, [onDataLoaded]);

  const allSelected = useMemo(() =>
    taxRules.length > 0 && selectedIds.size === taxRules.length,
    [taxRules, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(taxRules.map(t => t.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (taxRules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Ruler className="h-8 w-8 mb-2 opacity-50" />
        <p>No tax rules found</p>
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
            <TableHead>Tax Rule Group</TableHead>
            <TableHead className="w-30">Country ID</TableHead>
            <TableHead className="w-30">Tax ID</TableHead>
            <TableHead className="w-30">Behavior</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxRules.map((rule) => (
            <TableRow
              key={rule.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(rule.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(rule.id)}
                  onCheckedChange={() => handleSelect(rule.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{rule.id}</TableCell>
              <TableCell className="font-medium">Group #{rule.id_tax_rules_group}</TableCell>
              <TableCell>#{rule.id_country}</TableCell>
              <TableCell>#{rule.id_tax}</TableCell>
              <TableCell>
                <Badge variant="outline">{rule.behavior}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}