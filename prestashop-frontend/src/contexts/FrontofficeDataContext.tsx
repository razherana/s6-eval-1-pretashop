// src/contexts/FrontofficeDataContext.tsx
import { createContext } from 'react';
import type { FrontofficeData } from '@/pages/frontoffice/home/services';
import type { SearchFilters } from '@/pages/frontoffice/home/types/search';

interface FrontofficeDataContextType {
  data: FrontofficeData | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  applyFilters: (filters: SearchFilters) => Promise<void>;
}

export const FrontofficeDataContext = createContext<
  FrontofficeDataContextType | undefined
>(undefined);