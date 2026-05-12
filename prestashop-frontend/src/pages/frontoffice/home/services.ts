// src/pages/frontoffice/home/services.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import type {
  ProductReadXML,
  CategoryReadXML,
  CombinationDetailXML,
  ProductOptionXML,
  ProductOptionValueDetail,
} from "@/pages/backoffice/home/types";

export interface FrontofficeData {
  products: ProductReadXML[];
  categories: CategoryReadXML[];
  productOptions: Map<number, ProductOptionXML>;
  productOptionValues: Map<number, ProductOptionValueDetail>;
  // Cache for combinations - loaded on demand per product
  combinationsCache: Map<number, CombinationDetailXML[]>;
}

// Fetch products with pagination support
export async function fetchProducts(
  page: number = 1,
  limit: number = 50,
): Promise<{
  products: ProductReadXML[];
  totalCount: number;
}> {
  const offset = (page - 1) * limit;
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
    "price[product][use_tax]": "1",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      products: { 
        product?: ProductReadXML | ProductReadXML[];
      };
    }>(`/products?${query.toString()}`, { method: "GET" });

    const products = response.products?.product || [];
    const productArray : ProductReadXML[] = (Array.isArray(products) ? products : [products]).map((product) => ({
      ...product,
      associations: {
        ...product.associations,
        images: {
          ...product.associations.images,
          image: !Array.isArray(product.associations.images.image) &&
            product.associations.images.image
            ? [product.associations.images.image]
            : product.associations.images.image || [],
        },
        combinations: {
          ...product.associations.combinations,
          combination: Array.isArray(
            product.associations.combinations?.combination,
          )
            ? product.associations.combinations.combination
            : product.associations.combinations?.combination
              ? [product.associations.combinations.combination]
              : [],
        },
      },
    }));

    return {
      products: productArray,
      totalCount: productArray.length,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Fetch all product options (like Size, Color) - rarely changes
async function fetchAllProductOptions(): Promise<ProductOptionXML[]> {
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
async function fetchAllProductOptionValues(): Promise<ProductOptionValueDetail[]> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      product_option_values: {
        product_option_value?: ProductOptionValueDetail | ProductOptionValueDetail[];
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
        combination?: CombinationDetailXML | CombinationDetailXML[];
      };
    }>(`/combinations?${query.toString()}`, { method: "GET" });

    const combinations = response.combinations?.combination || [];
    const combinationsArray = Array.isArray(combinations) ? combinations : [combinations];

    // Cache the result
    if (cache) {
      cache.set(productId, combinationsArray);
    }

    return combinationsArray;
  } catch (error) {
    console.error(`Error fetching combinations for product ${productId}:`, error);
    return [];
  }
}

// Initialize the frontoffice data store
export async function initializeFrontofficeData(): Promise<FrontofficeData> {
  const [categories, productOptions, optionValues] = await Promise.all([
    fetchAllCategories(),
    fetchAllProductOptions(),
    fetchAllProductOptionValues(),
  ]);

  // Build Maps for O(1) lookups
  const productOptionsMap = new Map<number, ProductOptionXML>();
  productOptions.forEach((option) => {
    productOptionsMap.set(option.id, option);
  });

  const productOptionValuesMap = new Map<number, ProductOptionValueDetail>();
  optionValues.forEach((value) => {
    productOptionValuesMap.set(value.id, value);
  });

  return {
    products: [],
    categories,
    productOptions: productOptionsMap,
    productOptionValues: productOptionValuesMap,
    combinationsCache: new Map(),
  };
}

// Fetch initial products
export async function fetchInitialProducts(
  data: FrontofficeData,
  limit: number = 50,
): Promise<void> {
  const { products } = await fetchProducts(1, limit);
  data.products = products;
}