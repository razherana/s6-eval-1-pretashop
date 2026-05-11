import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FolderTree } from "lucide-react";
import { type CategoryReadXML } from "../../types";
import { fetchCategories } from "../../services";
import { toast } from "sonner";
import type { DataItem } from "../ResetDataModalComponent";
import { getWithLanguage, useLanguage } from "@/utils/lang";

interface CategoriesTabProps {
  onDataLoaded: (data: DataItem[]) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function CategoriesTab({ onDataLoaded, selectedIds, onSelectionChange }: CategoriesTabProps) {
  const [categories, setCategories] = useState<CategoryReadXML[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories(100, 0);
        setCategories(data || []);
        console.log("Loaded categories:", data);
        onDataLoaded(data);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [onDataLoaded]);

  const allSelected = useMemo(
    () => categories.length > 0 && selectedIds.size === categories.length,
    [categories, selectedIds],
  );

  const handleSelectAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(categories.map((category) => category.id)));
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    onSelectionChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <FolderTree className="mb-2 h-8 w-8 opacity-50" />
        <p>No categories found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead className="w-24">Parent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelect(category.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(category.id)}
                  onCheckedChange={() => handleSelect(category.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{category.id}</TableCell>
              <TableCell className="font-medium">
                {getWithLanguage(category.name, language.language_id)}
              </TableCell>
              <TableCell className="text-muted-foreground">#{category.id_parent ? category.id_parent["#text"] : "None"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}