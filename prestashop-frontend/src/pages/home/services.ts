import { fetchFromPrestashopApi } from "@/utils/url";
import type { ProductReadXML } from "./types";
import { PrestaShopXMLConverter } from "@/utils/xml";

export async function fetchProducts(
  limit: number,
  offset: number,
): Promise<ProductReadXML[]> {
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

const PRODUCT_REQUIRED_FIELDS = ["price", "name;"];

export function verifyProductData(
  productData: Record<string, string>,
  headers: string[],
): string | true {
  for (const field of PRODUCT_REQUIRED_FIELDS) {
    if (!headers.includes(field) && !field.endsWith(";")) {
      console.warn(
        `Missing required header: ${field} in CSV headers:`,
        headers,
      );
      return field;
    }

    if (field.endsWith(";")) {
      // Verify if any header starts with the baseField (e.g., "name;") to account for variations like "name;language_id=1", "name;language_id=2", etc.
      const hasVariation = headers.some((header) => header.startsWith(field));
      if (!hasVariation) {
        console.warn(
          `Missing required header variation: ${field} in CSV headers:`,
          headers,
        );
        return field;
      }

      // If the field is a variation (ends with ";"), we should check if at least one of the variations has a non-empty value in the product data
      for (const header of headers)
        if (
          header.startsWith(field) &&
          productData[header] &&
          productData[header].trim() !== ""
        )
          continue; // Found a valid variation, we can consider this field as valid
    } else if (!productData[field] || productData[field].trim() === "") {
      console.warn(
        `Missing required field: ${field} for product data:`,
        productData,
      );
      return field;
    }
  }

  return true;
}

export async function createProduct(
  product: Record<string, string>,
  converter: PrestaShopXMLConverter,
) {
  // Translate the product data from string, string to XML format

  console.log("Creating product with data:", product);
  const xmlData = converter.convertRowToXML(product);

  console.log("Converted XML data:", xmlData);

  try {
    const response = await fetchFromPrestashopApi("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: xmlData,
    });

    console.log("Product insert API response:", response);
    return response;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}
