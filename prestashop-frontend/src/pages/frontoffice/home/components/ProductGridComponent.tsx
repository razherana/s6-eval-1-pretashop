// src/pages/frontoffice/home/components/ProductGridComponent.tsx
import { useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardComponent } from './ProductCardComponent';
import { useFrontofficeData } from '@/hooks/useFrontofficeData';

interface ProductGridProps {
  languageId: number;
  currency: string;
  conversionRate: number;
  locale: string;
}

export function ProductGridComponent({
  languageId,
  currency,
  conversionRate,
  locale,
}: ProductGridProps) {
  const { data, loading, error, hasMore, loadMore, refresh } = useFrontofficeData();
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-destructive">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && (!data || data.products.length === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.products.map((product) => (
          <ProductCardComponent
            key={product.id}
            product={product}
            languageId={languageId}
            currency={currency}
            conversionRate={conversionRate}
            locale={locale}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && data && data.products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !loading && (
        <div ref={observerRef} className="h-10" />
      )}

      {/* End of products message */}
      {!hasMore && data && data.products.length > 0 && (
        <p className="text-center text-muted-foreground mt-8">
          You've seen all products
        </p>
      )}
    </div>
  );
}