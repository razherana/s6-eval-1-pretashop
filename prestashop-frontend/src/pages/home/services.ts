import { fetchFromPrestashopApi } from "@/utils/url";
import type { Product } from "./types";

export async function fetchProducts(limit: number, offset: number) : Promise<Product[]> {
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
