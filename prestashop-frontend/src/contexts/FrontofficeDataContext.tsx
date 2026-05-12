import { createContext } from 'react';
import {
  type FrontofficeData,
} from '@/pages/frontoffice/home/services';

interface FrontofficeDataContextType {
  data: FrontofficeData | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const FrontofficeDataContext = createContext<
  FrontofficeDataContextType | undefined
>(undefined);