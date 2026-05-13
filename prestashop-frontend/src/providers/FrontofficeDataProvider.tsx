// src/contexts/FrontofficeDataProvider.tsx
import { FrontofficeDataContext } from "@/contexts/FrontofficeDataContext";
import { type FrontofficeData, fetchInitialProducts, fetchProducts, initializeFrontofficeData } from "@/pages/frontoffice/home/services";
import type { SearchFilters } from "@/pages/frontoffice/home/types/search";
import { useState, useCallback, useEffect } from "react";

const PRODUCTS_PER_PAGE = 50;

export function FrontofficeDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<FrontofficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});

  const initialize = useCallback(async (searchFilters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      const store = await initializeFrontofficeData();
      await fetchInitialProducts(store, PRODUCTS_PER_PAGE, searchFilters);
      setData(store);
      setCurrentPage(1);
      setHasMore(store.products.length >= PRODUCTS_PER_PAGE);
    } catch (err) {
      setError('Failed to load store data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!data || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      const { products: newProducts } = await fetchProducts(
        nextPage,
        PRODUCTS_PER_PAGE,
        filters,
      );

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setData({
          ...data,
          products: [...data.products, ...newProducts],
        });
        setCurrentPage(nextPage);
        setHasMore(newProducts.length >= PRODUCTS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoading(false);
    }
  }, [data, currentPage, loading, filters]);

  const applyFilters = useCallback(async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    try {
      setLoading(true);
      setError(null);
      const store = await initializeFrontofficeData();
      await fetchInitialProducts(store, PRODUCTS_PER_PAGE, newFilters);
      setData(store);
      setCurrentPage(1);
      setHasMore(store.products.length >= PRODUCTS_PER_PAGE);
    } catch (err) {
      setError('Failed to apply filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await initialize();
    })();
  }, [initialize]);

  return (
    <FrontofficeDataContext.Provider
      value={{ 
        data, 
        loading, 
        error, 
        hasMore, 
        loadMore, 
        refresh: initialize,
        filters,
        setFilters,
        applyFilters,
      }}
    >
      {children}
    </FrontofficeDataContext.Provider>
  );
}