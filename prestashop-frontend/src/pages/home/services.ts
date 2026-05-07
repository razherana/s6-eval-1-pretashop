import { fetchFromPrestashopApi } from "@/utils/url";
import type { Product } from "./types";

export async function fetchProducts(
  limit: number,
  offset: number,
): Promise<Product[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/products?${query.toString()}`,
      {
        method: "GET",
      },
    );

    return response.products.product;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

const REQUIRED_FIELDS = ["price", "name;"];

export function verifyProductData(
  productData: Record<string, string>,
  headers: string[],
): boolean {
  for (const field of REQUIRED_FIELDS) {
    if (!headers.includes(field)) {
      console.warn(
        `Missing required header: ${field} in CSV headers:`,
        headers,
      );
      return false;
    }

    if (field.endsWith(";")) {
      // Verify if any header starts with the baseField (e.g., "name;") to account for variations like "name;language_id=1", "name;language_id=2", etc.
      const hasVariation = headers.some((header) => header.startsWith(field));
      if (!hasVariation) {
        console.warn(
          `Missing required header variation: ${field} in CSV headers:`,
          headers,
        );
        return false;
      }
    } else if (!productData[field] || productData[field].trim() === "") {
      console.warn(
        `Missing required field: ${field} for product data:`,
        productData,
      );
      return false;
    }
  }

  return true;
}
