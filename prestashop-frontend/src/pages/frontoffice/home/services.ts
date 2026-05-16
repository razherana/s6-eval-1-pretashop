// src/pages/frontoffice/home/services.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import type {
  ProductReadXML,
  CategoryReadXML,
  CombinationDetailXML,
  ProductOptionXML,
  ProductOptionValueDetail,
  OrderStateXML,
} from "@/pages/backoffice/home/types";
import { toast } from "sonner";
import type { SearchFilters } from "./types/search";
import { assureArray } from "@/utils/xml";

export interface FrontofficeData {
  products: ProductReadXML[];
  categories: CategoryReadXML[];
  productOptions: Map<number, ProductOptionXML>;
  productOptionValues: Map<number, ProductOptionValueDetail>;
  orderStates: Map<number, OrderStateXML>;
  combinationsCache: Map<number, CombinationDetailXML[]>;
}

export async function fetchFilteredProducts(
  page: number = 1,
  limit: number = 50,
  filters?: SearchFilters,
): Promise<{
  products: ProductReadXML[];
  totalCount: number;
}> {
  const offset = (page - 1) * limit;
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
    "price[price_ttc][use_tax]": "1",
  });

  // Apply name and category filters via API
  if (filters?.name) {
    query.append("filter[name]", `%[${filters.name}]%`);
  }

  if (filters?.categoryId) {
    query.append("filter[id_category_default]", `[${filters.categoryId}]`);
  }

  // Only show active products
  query.append("filter[active]", "[1]");

  // Sort by id descending for consistent results
  query.append("sort", "[id_DESC]");

  try {
    const response = await fetchFromPrestashopApi<{
      products: {
        product?: ProductReadXML | ProductReadXML[];
      };
    }>(`/products?${query.toString()}`, { method: "GET" });

    const products = response.products?.product || [];
    let productArray: ProductReadXML[] = Array.isArray(products)
      ? products
      : [products];

    // Normalize product data
    productArray = productArray.map((product) => ({
      ...product,
      associations: {
        ...product.associations,
        combinations: {
          ...product.associations.combinations,
          combination: assureArray(
            product.associations.combinations?.combination,
          ), // Ensure it's always an array
        },
      },
    }));

    // If price filter is active, apply combination-aware price filtering
    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      productArray = await filterProductsByCombinationPrice(
        productArray,
        filters,
      );
    }

    return {
      products: productArray,
      totalCount: productArray.length,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Filter products by price, checking combinations for accurate pricing
async function filterProductsByCombinationPrice(
  products: ProductReadXML[],
  filters: SearchFilters,
): Promise<ProductReadXML[]> {
  const priceMin = filters.priceMin ?? 0;
  const priceMax = filters.priceMax ?? Number.MAX_SAFE_INTEGER;

  // Separate products with and without combinations
  const productsWithCombinations = products.filter(
    (p) => p.associations.combinations?.combination?.length > 0,
  );
  const productsWithoutCombinations = products.filter(
    (p) => !p.associations.combinations?.combination?.length,
  );

  // Products without combinations: check base price
  const filteredNoCombinations = productsWithoutCombinations.filter(
    (product) => {
      const price = product.price_ttc || product.price;
      return price >= priceMin && price <= priceMax;
    },
  );

  // Products with combinations: fetch combinations and check prices
  const filteredWithCombinations = await filterWithCombinations(
    productsWithCombinations,
    priceMin,
    priceMax,
  );

  return [...filteredNoCombinations, ...filteredWithCombinations];
}

// Check if any combination of a product falls within the price range
async function filterWithCombinations(
  products: ProductReadXML[],
  priceMin: number,
  priceMax: number,
): Promise<ProductReadXML[]> {
  if (products.length === 0) return [];

  // Fetch all combinations for these products in parallel
  const combinationChecks = products.map(async (product) => {
    try {
      const combinationIds = product.associations.combinations.combination.map(
        (c) => c.id,
      );

      if (combinationIds.length === 0) {
        // No combinations, just check base price
        const basePrice = product.price_ttc || product.price;
        if (basePrice >= priceMin && basePrice <= priceMax) {
          return product;
        }
        return null;
      }

      // Get product base price with tax
      const basePrice = product.price_ttc || product.price;

      // Check if base price is in range
      if (basePrice >= priceMin && basePrice <= priceMax) {
        return product;
      }

      // Fetch price with tax for each combination individually
      // This is N+1 but necessary to get accurate tax-included prices
      const priceParams = new URLSearchParams({
        display: "full",
      });

      for (const combinationId of combinationIds) {
        priceParams.append(
          `price[price_ttc_${combinationId}][product_attribute]`,
          combinationId.toString(),
        );
      }

      try {
        const productResponse = await fetchFromPrestashopApi<{
          product: {
            price: number;
            // For price_ttc_{combinationId}, we use an index signature since we don't know the exact keys at compile time
            [key: string]: number;
          };
        }>(`/products/${product.id}?${priceParams.toString()}`, {
          method: "GET",
        });

        for (const combinationId of combinationIds) {
          const combinationPriceTtc =
            productResponse.product?.[`price_ttc_${combinationId}`] ||
            productResponse.product?.price ||
            0;

          if (
            combinationPriceTtc >= priceMin &&
            combinationPriceTtc <= priceMax
          ) {
            return product;
          }
        }
      } catch (combError) {
        console.error(
          `Could not fetch price for combinations of product ${product.id}`,
          combError,
        );
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching combinations for product ${product.id}:`,
        error,
      );
      // If we can't fetch combinations, fall back to base price check
      const price = product.price_ttc || product.price;
      if (price >= priceMin && price <= priceMax) {
        return product;
      }
      return null;
    }
  });

  const results = await Promise.all(combinationChecks);
  return results.filter((p): p is ProductReadXML => p !== null);
}

// Update fetchProducts to use the new filtering
export async function fetchProducts(
  page: number = 1,
  limit: number = 50,
  filters?: SearchFilters,
): Promise<{
  products: ProductReadXML[];
  totalCount: number;
}> {
  return fetchFilteredProducts(page, limit, filters);
}

// Update fetchInitialProducts to use filters
export async function fetchInitialProducts(
  data: FrontofficeData,
  limit: number = 50,
  filters?: SearchFilters,
): Promise<void> {
  const { products } = await fetchProducts(1, limit, filters);
  data.products = products;
}

// Fetch all product options (like Size, Color) - rarely changes
export async function fetchAllProductOptions(): Promise<ProductOptionXML[]> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      product_options: {
        product_option?: ProductOptionXML | ProductOptionXML[];
      };
    }>(`/product_options?${query.toString()}`, { method: "GET" });

    const options = response.product_options?.product_option || [];
    return Array.isArray(options) ? options : [options];
  } catch (error) {
    console.error("Error fetching product options:", error);
    return [];
  }
}

// Fetch all product option values (like Blue, Large, Cotton) - rarely changes
export async function fetchAllProductOptionValues(): Promise<
  ProductOptionValueDetail[]
> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      product_option_values: {
        product_option_value?:
          | ProductOptionValueDetail
          | ProductOptionValueDetail[];
      };
    }>(`/product_option_values?${query.toString()}`, { method: "GET" });

    const values = response.product_option_values?.product_option_value || [];
    return Array.isArray(values) ? values : [values];
  } catch (error) {
    console.error("Error fetching product option values:", error);
    return [];
  }
}

// Fetch categories - rarely changes
async function fetchAllCategories(): Promise<CategoryReadXML[]> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      categories: { category?: CategoryReadXML | CategoryReadXML[] };
    }>(`/categories?${query.toString()}`, { method: "GET" });

    const categories = response.categories?.category || [];
    return Array.isArray(categories) ? categories : [categories];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch combinations for a specific product with prices including tax
export async function fetchProductCombinations(
  productId: number,
  cache?: Map<number, CombinationDetailXML[]>,
): Promise<CombinationDetailXML[]> {
  // Check cache first
  if (cache?.has(productId)) {
    return cache.get(productId)!;
  }

  const query = new URLSearchParams({
    display: "full",
    "filter[id_product]": productId.toString(),
    "price[combination][use_tax]": "1",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      combinations: {
        combination: CombinationDetailXML | CombinationDetailXML[];
      };
    }>(`/combinations?${query.toString()}`, { method: "GET" });

    const combinationsArray = assureArray(response.combinations.combination);

    // Cache the result
    if (cache) {
      cache.set(productId, combinationsArray);
    }

    return combinationsArray;
  } catch (error) {
    console.error(
      `Error fetching combinations for product ${productId}:`,
      error,
    );
    return [];
  }
}

// Add to the static data fetching
async function fetchAllOrderStates(): Promise<OrderStateXML[]> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      order_states: {
        order_state?: OrderStateXML | OrderStateXML[];
      };
    }>(`/order_states?${query.toString()}`, { method: "GET" });

    const states = response.order_states?.order_state || [];
    return Array.isArray(states) ? states : [states];
  } catch (error) {
    console.error("Error fetching order states:", error);
    return [];
  }
}

// Update initializeFrontofficeData
export async function initializeFrontofficeData(): Promise<FrontofficeData> {
  const [categories, productOptions, optionValues, orderStates] =
    await Promise.all([
      fetchAllCategories(),
      fetchAllProductOptions(),
      fetchAllProductOptionValues(),
      fetchAllOrderStates(),
    ]);

  const productOptionsMap = new Map<number, ProductOptionXML>();
  productOptions.forEach((option) => {
    productOptionsMap.set(option.id, option);
  });

  const productOptionValuesMap = new Map<number, ProductOptionValueDetail>();
  optionValues.forEach((value) => {
    productOptionValuesMap.set(value.id, value);
  });

  const orderStatesMap = new Map<number, OrderStateXML>();
  orderStates.forEach((state) => {
    orderStatesMap.set(state.id, state);
  });

  return {
    products: [],
    categories,
    productOptions: productOptionsMap,
    productOptionValues: productOptionValuesMap,
    orderStates: orderStatesMap,
    combinationsCache: new Map(),
  };
}

export async function fetchProductCombinationPrice(
  combinationId: number,
  productId: number,
): Promise<number> {
  const query = new URLSearchParams({
    display: `[price_ttc]`,
    [`price[price_ttc][product_attribute]`]: combinationId.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      product?: {
        price_ttc: number;
      };
    }>(`/products/${productId}?${query.toString()}`, { method: "GET" });

    const product = response.product;
    return product?.price_ttc || 0;
  } catch (error) {
    console.error(
      `Error fetching price for combination ${combinationId}:`,
      error,
    );
    toast.error(
      "Failed to fetch price for selected combination. Please try again.",
    );
    return 0;
  }
}
