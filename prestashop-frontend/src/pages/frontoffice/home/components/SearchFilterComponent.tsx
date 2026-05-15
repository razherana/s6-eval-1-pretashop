// src/pages/frontoffice/home/components/SearchFilterComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFrontofficeData } from '@/hooks/useFrontofficeData';
import { useLanguage } from '@/hooks/useLanguage';
import { getWithLanguage } from '@/utils/lang';
import {
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SearchFilters } from '../types/search';

export function SearchFilterComponent() {
  const { filters, applyFilters, data } = useFrontofficeData();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [_searchInCombinations, setSearchInCombinations] = useState(false);

  const handleApply = () => {
    applyFilters(localFilters);
    setIsOpen(false);

    const activeFilters = Object.entries(localFilters)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== 0)
      .length;

    if (activeFilters > 0) {
      toast.success(`${activeFilters} filter(s) applied`);
    } else {
      toast.success('Filters cleared');
    }
  };

  const handleReset = () => {
    const emptyFilters: SearchFilters = {};
    setLocalFilters(emptyFilters);
    setSearchInCombinations(false);
    applyFilters(emptyFilters);
    setIsOpen(false);
    toast.success('Filters reset');
  };

  const activeFilterCount = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== '' && value !== 0)
    .length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Search & Filter Products
          </DialogTitle>
          <DialogDescription>
            Filter products by name, category, price range. Prices include combinations (variants).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-4 pt-2 px-2">
          {/* Name Search */}
          <div className="space-y-2">
            <Label htmlFor="search-name">Product Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-name"
                placeholder="Search by product name..."
                className="pl-10"
                value={localFilters.name || ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    name: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Searches in product names
            </p>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={localFilters.categoryId?.toString() || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  categoryId: value === 'all' ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {data?.categories
                  .filter((c) => c.id !== 1 && c.id !== 2)
                  .map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {language
                        ? getWithLanguage(category.name, language.language_id)
                        : `Category #${category.id}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Price Range</Label>
              <span className="text-xs text-muted-foreground">
                Includes variant prices
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Min (€)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={localFilters.priceMin || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceMin: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max (€)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  min="0"
                  step="0.01"
                  value={localFilters.priceMax || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceMax: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Filters products where base price OR any variant price is in range
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApply} className="gap-2 flex-1">
            <Search className="h-4 w-4" />
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}