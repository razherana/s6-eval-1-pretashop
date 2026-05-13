import { useEffect, useState } from 'react';
import { type ProductReadXML } from './types';
import { fetchProducts } from './services';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, AlertCircle, Zap, ClipboardList } from 'lucide-react';
import { ImportProductsModalComponent } from './components/ImportProductsModalComponent';
import { ResetDataModalComponent } from './components/ResetDataModalComponent';
import { getFormattedPrice, getWithLanguage, useLanguage } from '@/utils/lang';
import { SelectLanguageCurrency } from '@/components/ui-manual/select-lang';
import { ProductImageCarouselComponent } from './components/ProductImageCarouselComponent';
import { useBackofficeAuth } from '@/hooks/useBackofficeAuth';
import { FastResetModalComponent } from './components/FastResetModalComponent';
import { LanguageLoadingComponent } from '@/components/ui-manual/language-loading-state';
import { Link } from 'react-router-dom';

export function BackofficeHomePage() {
  const { logout } = useBackofficeAuth();
  const [products, setProducts] = useState<ProductReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();

  const [isResetOpen, setResetOpen] = useState(false);
  const [importProductsOpen, setImportProductsOpen] = useState(false);
  const [isFastResetOpen, setFastResetOpen] = useState(false);

  const normalizeImages = (images: {
    id: number;
  } | [{id:number;}]) => {
    return Array.isArray(images) ? images : images ? [images] : [];
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = fetchProducts(100, 0);
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

  if (!language) {
    return (
      <LanguageLoadingComponent />
    )
  }

  const handleResetComplete = () => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = fetchProducts(100, 0);
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
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ImportProductsModalComponent open={importProductsOpen} setOpen={setImportProductsOpen} />

      <ResetDataModalComponent
        open={isResetOpen}
        setOpen={setResetOpen}
        onResetComplete={handleResetComplete}
      />

      <FastResetModalComponent
        open={isFastResetOpen}
        setOpen={setFastResetOpen}
        onResetComplete={handleResetComplete}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Prestashop
              </h1>
            </Link>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover our latest products
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant="secondary">
              <Package className="mr-2 h-4 w-4" />
              {loading ? '...' : `${products.length} Products`}
            </Badge>
            <Button variant="outline" onClick={() => setImportProductsOpen(true)}>
              Import Products
            </Button>
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              Reset all data
            </Button>
            <Button
              variant="destructive"
              onClick={() => setFastResetOpen(true)}
              className="gap-1.5"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Fast Reset</span>
            </Button>
            <Button variant="outline" onClick={() => {
              async function loadProducts() {
                try {
                  setLoading(true);
                  setError(null);
                  const data = fetchProducts(100, 0);
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
            }}>
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link to="/backoffice/orders">
                <ClipboardList className="mr-2 h-4 w-4" />
                Orders
              </Link>
            </Button>
            <Button onClick={logout}>Log out</Button>
            <SelectLanguageCurrency />
          </div>
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
                  {(() => {
                    const images = product.associations.images.image;
                    const normalizedImages = Array.isArray(images) ? images : images ? [images] : [];
                    return normalizedImages.length > 0 ? (
                      <ProductImageCarouselComponent
                        images={normalizedImages}
                        productName={product.name}
                        languageId={language.language_id}
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    );
                  })()}
                  <Badge
                    className="absolute top-2 right-2 z-10 bg-white/90 text-gray-900 hover:bg-white dark:bg-gray-900/90 dark:text-white"
                    variant="secondary"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {getWithLanguage(product.name, language.language_id)}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {getFormattedPrice(product.price, language.currency, language.conversion_change, language.locale)}
                  </p>
                </CardContent>

                <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      In Stock
                    </span>
                    {(() => {
                      const normalizedImages = normalizeImages(product.associations.images.image);
                      return normalizedImages.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          +{normalizedImages.length - 1} images
                        </Badge>
                      );
                    })()}
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