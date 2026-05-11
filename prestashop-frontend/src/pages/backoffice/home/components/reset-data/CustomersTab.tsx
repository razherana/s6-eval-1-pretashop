import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from "lucide-react";
import { type CustomerReadXML } from "../../types";
import { fetchCustomers } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";

interface CustomersTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function CustomersTab({ onDataLoaded, selectedIds, onSelectionChange }: CustomersTabProps) {
  const [customers, setCustomers] = useState<CustomerReadXML[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const data = await fetchCustomers(100, 0);
        setCustomers(data || []);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [onDataLoaded]);

  const allSelected = useMemo(() =>
    customers.length > 0 && selectedIds.size === customers.length,
    [customers, selectedIds]
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(customers.map(c => c.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id))
      newSelected.delete(id)
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

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Users className="h-8 w-8 mb-2 opacity-50" />
        <p>No customers found</p>
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
            <TableHead className="w-60">Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(customer.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(customer.id)}
                  onCheckedChange={() => handleSelect(customer.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{customer.id}</TableCell>
              <TableCell className="font-medium">
                {`${customer.firstname} ${customer.lastname}`.trim() || 'Unnamed Customer'}
              </TableCell>
              <TableCell>{customer.email || 'No email'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}