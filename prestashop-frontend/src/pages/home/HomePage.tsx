import { useEffect, useState } from 'react';
import { API_QUERY } from '@/utils/url';
import { type Product, LANGUAGE_ID } from './types';
import { fetchProducts } from './services';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Package, AlertCircle } from 'lucide-react';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = fetchProducts(10, 0);
        setProducts(await data);
      } catch (error) {
        console.error("Error loading products:", error);
        setError("Failed to load products. Please try again later.");
        toast.error("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Prestashop
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover our latest products
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Package className="mr-2 h-4 w-4" />
            {loading ? '...' : `${products.length} Products`}
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.associations.images.image.length > 0 ? (
                    <img
                      src={`${product.associations.images.image[0]['@_xlink:href']}?${API_QUERY}`}
                      alt={product.name.language[LANGUAGE_ID]['#text']}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-2 right-2 bg-white/90 text-gray-900 hover:bg-white dark:bg-gray-900/90 dark:text-white"
                    variant="secondary"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {product.name.language[LANGUAGE_ID]['#text']}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </CardContent>

                <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      In Stock
                    </span>
                    {product.associations.images.image.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.associations.images.image.length - 1} images
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}