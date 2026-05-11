import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Layers } from "lucide-react";
import { type TaxRuleGroupReadXML } from "../../types";
import { fetchTaxRuleGroups } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";

interface TaxRuleGroupsTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function TaxRuleGroupsTab({ onDataLoaded, selectedIds, onSelectionChange }: TaxRuleGroupsTabProps) {
  const [taxRuleGroups, setTaxRuleGroups] = useState<TaxRuleGroupReadXML[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTaxRuleGroups = async () => {
      setLoading(true);
      try {
        const data = await fetchTaxRuleGroups(100, 0);
        setTaxRuleGroups(data);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading tax rule groups:", error);
        toast.error("Failed to load tax rule groups");
      } finally {
        setLoading(false);
      }
    };
    loadTaxRuleGroups();
  }, [onDataLoaded]);

  const allSelected = useMemo(() => 
    taxRuleGroups.length > 0 && selectedIds.size === taxRuleGroups.length,
    [taxRuleGroups, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(taxRuleGroups.map(t => t.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if(newSelected.has(id)) {
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

  if (taxRuleGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Layers className="h-8 w-8 mb-2 opacity-50" />
        <p>No tax rule groups found</p>
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
            <TableHead className="w-30">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxRuleGroups.map((group) => (
            <TableRow
              key={group.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(group.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(group.id)}
                  onCheckedChange={() => handleSelect(group.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{group.id}</TableCell>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>
                <Badge variant={group.active === '1' ? 'default' : 'secondary'}>
                  {group.active === '1' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}