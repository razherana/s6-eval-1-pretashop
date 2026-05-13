// src/pages/frontoffice/home/components/ProductCardComponent.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { getWithLanguage, getFormattedPrice } from '@/utils/lang';
import { ProductCombinationSelectComponent } from './ProductCombinationSelectComponent';
import type { ProductReadXML } from '@/pages/backoffice/home/types';
import { API_QUERY } from '@/utils/url';

interface CombinationOption {
  id: number;
  reference: string;
  price: number;
  ean13?: string;
  upc?: string;
  minimal_quantity: number;
  attributeNames: string[];
  attributesByGroup: Map<string, string>;
}

interface ProductCardProps {
  product: ProductReadXML;
  languageId: number;
  currency: string;
  conversionRate: number;
  locale: string;
}

export function ProductCardComponent({
  product,
  languageId,
  currency,
  conversionRate,
  locale,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedCombination, setSelectedCombination] =
    useState<CombinationOption | null>(null);
  const [currentPrice, setCurrentPrice] = useState(
    product.price_ttc || product.price,
  );
  const { addToCart } = useCart();

  const imagesData = product.associations?.images?.image;
  const images = Array.isArray(imagesData)
    ? imagesData
    : imagesData
      ? [imagesData]
      : [];
  const productName = getWithLanguage(product.name, languageId);
  const combinationData = product.associations?.combinations?.combination;
  const combinationArray = Array.isArray(combinationData) ? combinationData : combinationData ? [combinationData] : [];
  const hasCombinations = combinationArray.length > 0;

  const formattedPrice = getFormattedPrice(
    currentPrice,
    currency,
    conversionRate,
    locale,
  );

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  const handleCombinationSelect = (
    combination: CombinationOption | null,
    price: number,
  ) => {
    setSelectedCombination(combination);
    setCurrentPrice(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasCombinations && !selectedCombination) {
      return;
    }

    addToCart({
      productId: product.id,
      combinationId: selectedCombination?.id,
      name: productName,
      price: currentPrice * conversionRate,
      image: images[currentImageIndex]?.['@_xlink:href'],
      reference: product.reference,
      combinationReference: selectedCombination?.reference,
    });
  };

  // Get display text for selected variant
  const getVariantDisplay = () => {
    if (!selectedCombination) return null;
    
    if (selectedCombination.attributesByGroup.size > 0) {
      return Array.from(selectedCombination.attributesByGroup.entries())
        .map(([group, value]) => `${group}: ${value}`)
        .join(', ');
    }
    
    if (selectedCombination.attributeNames.length > 0) {
      return selectedCombination.attributeNames.join(', ');
    }
    
    return null;
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image Carousel */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <img
              src={`${images[currentImageIndex]?.['@_xlink:href']}?${API_QUERY}`}
              alt={productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && isHovered && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md transition-colors hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md transition-colors hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 shadow-md transition-all hover:bg-white hover:scale-110"
            aria-label={
              isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
            }
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Quick Add to Cart Overlay */}
          {isHovered && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full transform transition-transform duration-300 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                className="w-full rounded-none bg-primary/90 hover:bg-primary"
                disabled={hasCombinations && !selectedCombination}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {hasCombinations && !selectedCombination
                  ? 'Select variant first'
                  : 'Add to Cart'}
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3 p-4">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-10">
              {productName}
            </h3>
          </div>

          {product.reference && (
            <p className="text-xs text-gray-500">
              REF: {selectedCombination?.reference || product.reference}
            </p>
          )}

          {/* Combination Select */}
          {hasCombinations && (
            <ProductCombinationSelectComponent
              productId={product.id}
              basePrice={product.price_ttc || product.price}
              onSelect={handleCombinationSelect}
            />
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                {formattedPrice}
              </span>
              {selectedCombination && getVariantDisplay() && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getVariantDisplay()}
                </p>
              )}
            </div>
            {product.id_tax_rules_group !== undefined &&
              product.id_tax_rules_group !== '' && (
                <Badge variant="secondary" className="text-xs">
                  Tax included
                </Badge>
              )}
          </div>

          {/* Mobile Add to Cart Button */}
          <div className="md:hidden pt-2">
            <Button
              onClick={handleAddToCart}
              className="w-full"
              disabled={hasCombinations && !selectedCombination}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {hasCombinations && !selectedCombination
                ? 'Select variant first'
                : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}