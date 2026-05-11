import { fetchFromPrestashopApi } from "@/utils/url";
import { parseCSV } from "@/utils/csv";
import type {
  ProductReadXML,
  OrderReadXML,
  CustomerReadXML,
  OrderDetailReadXML,
} from "./types";
import { PrestaShopXMLConverter } from "@/utils/xml";
import productSchema from "@/schemas/product";

export interface ImportedRow {
  index: number;
  data: Record<string, string>;
  success: boolean;
  error?: string;
  warnings?: string[];
}

export interface ImportSummary {
  step: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  warnings: number;
}

export interface ImportResult {
  summary: ImportSummary;
  rows: ImportedRow[];
}
export interface ImportStep {
  id: string;
  label: string;
  icon: "package" | "file-spreadsheet" | "file-text" | "archive";
  acceptedFiles: string;
  required: boolean;
  description: string;
}

export interface FileStates {
  products: File | null;
  variants: File | null;
  customers: File | null;
  zip: File | null;
}

export interface TotalStats {
  totalProducts: number;
  successProducts: number;
  failedProducts: number;
  totalVariants: number;
  successVariants: number;
  failedVariants: number;
  totalCustomers: number;
  successCustomers: number;
  failedCustomers: number;
}

export interface InputRefs {
  products: React.RefObject<HTMLInputElement>;
  variants: React.RefObject<HTMLInputElement>;
  customers: React.RefObject<HTMLInputElement>;
  zip: React.RefObject<HTMLInputElement>;
}

async function parseCsvFile(file: File, delimiter: string): Promise<Record<string, string>[]> {
  const csv = await file.text();
  return parseCSV(csv, delimiter);
}

function buildImportSummary(
  step: string,
  fileName: string,
  rows: ImportedRow[],
): ImportSummary {
  return {
    step,
    fileName,
    totalRows: rows.length,
    successCount: rows.filter((row) => row.success).length,
    failedCount: rows.filter((row) => !row.success).length,
    warnings: rows.filter((row) => row.warnings && row.warnings.length > 0).length,
  };
}

function validateRequiredFields(
  row: Record<string, string>,
  requiredFields: string[],
): string | true {
  for (const field of requiredFields) {
    const value = row[field];

    if (field.endsWith(";")) {
      const hasMatchingHeader = Object.keys(row).some((header) =>
        header.startsWith(field),
      );

      if (!hasMatchingHeader) {
        return field;
      }

      continue;
    }

    if (!value || value.trim() === "") {
      return field;
    }
  }

  return true;
}

export async function importProductsFromFile(file: File, delimiter: string): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);
  const converter = new PrestaShopXMLConverter(productSchema, "");

  const rows: ImportedRow[] = [];

  for (const [index, row] of parsedRows.entries()) {
    const headers = Object.keys(row);
    const validation = verifyProductData(row, headers);

    if (validation !== true) {
      rows.push({
        index: index + 1,
        data: row,
        success: false,
        error: `Missing required field: ${validation}`,
      });
      continue;
    }

    try {
      await createProduct(row, converter);
      rows.push({
        index: index + 1,
        data: row,
        success: true,
      });
    } catch (error) {
      rows.push({
        index: index + 1,
        data: row,
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product",
      });
    }
  }

  return {
    summary: buildImportSummary("Products", file.name, rows),
    rows,
  };
}

export async function importVariantsFromFile(file: File, delimiter: string): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);
  const requiredFields = [
    "reference",
    "specificité",
    "karazany",
    "stock_initial",
    "prix_vente_ttc",
  ];

  const rows: ImportedRow[] = parsedRows.map((row, index) => {
    const validation = validateRequiredFields(row, requiredFields);

    if (validation !== true) {
      return {
        index: index + 1,
        data: row,
        success: false,
        error: `Missing required field: ${validation}`,
      };
    }

    return {
      index: index + 1,
      data: row,
      success: true,
    };
  });

  return {
    summary: buildImportSummary("Variants", file.name, rows),
    rows,
  };
}

export async function importCustomersFromFile(file: File, delimiter: string): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);
  const requiredFields = ["date", "nom", "email", "pwd", "adresse", "achat", "etat"];

  const rows: ImportedRow[] = parsedRows.map((row, index) => {
    const validation = validateRequiredFields(row, requiredFields);

    if (validation !== true) {
      return {
        index: index + 1,
        data: row,
        success: false,
        error: `Missing required field: ${validation}`,
      };
    }

    return {
      index: index + 1,
      data: row,
      success: true,
    };
  });

  return {
    summary: buildImportSummary("Customers", file.name, rows),
    rows,
  };
}

export async function summarizeZipArchive(file: File): Promise<ImportSummary> {
  return {
    step: "Images Archive",
    fileName: file.name,
    totalRows: 1,
    successCount: 1,
    failedCount: 0,
    warnings: 0,
  };
}

// --- Others

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
      { method: "GET" },
    );

    return ((response.products.product as ProductReadXML[]) || []).map(
      (product) => ({
        ...product,
        associations: {
          ...product.associations,
          images: {
            ...product.associations.images,
            image:
              !Array.isArray(product.associations.images.image) &&
              product.associations.images.image
                ? [product.associations.images.image]
                : product.associations.images.image,
          },
        },
      }),
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function fetchOrders(
  limit: number = 100,
  offset: number = 0,
): Promise<OrderReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/orders?${query.toString()}`,
      { method: "GET" },
    );

    return response.orders.order;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchOrderDetails(
  orderId: number,
): Promise<OrderDetailReadXML[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/order_details?display=full&filter[id_order]=${orderId}`,
      { method: "GET" },
    );

    // Parse the xml data into the correct object format
    const orderDetails = response.order_details.order_detail;
    console.log(`Fetched order details for order ID ${orderId}:`, orderDetails);

    return response.order_details.order_detail;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

export async function fetchCustomers(
  limit: number = 100,
  offset: number = 0,
): Promise<CustomerReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/customers?${query.toString()}`,
      { method: "GET" },
    );

    return response.customers.customer;
  } catch (error) {
    console.error("Error fetching customers:", error);
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
      const hasVariation = headers.some((header) => header.startsWith(field));
      if (!hasVariation) {
        console.warn(
          `Missing required header variation: ${field} in CSV headers:`,
          headers,
        );
        return field;
      }

      for (const header of headers)
        if (
          header.startsWith(field) &&
          productData[header] &&
          productData[header].trim() !== ""
        )
          continue;
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
  console.log("Creating product with data:", product);
  const xmlData = converter.convertRowToXML(product);
  console.log("Converted XML data:", xmlData);

  try {
    const response = await fetchFromPrestashopApi("/products", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    console.log("Product insert API response:", response);
    return response;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function resetProducts(productIds: number[]): Promise<{
  deletedProductIds: number[];
  failedProductIds: number[];
}> {
  const deletedProductIds: number[] = [];
  const failedProductIds: number[] = [];

  for (const id of productIds) {
    try {
      await fetchFromPrestashopApi(`/products/${id}`, { method: "DELETE" });
      console.log(`Deleted product with ID: ${id}`);
      deletedProductIds.push(id);
    } catch (error) {
      console.error("Error deleting product:", error);
      failedProductIds.push(id);
    }
  }

  return { deletedProductIds, failedProductIds };
}

export async function resetOrders(orderIds: number[]): Promise<{
  deletedOrderIds: number[];
  failedOrderIds: number[];
}> {
  const deletedOrderIds: number[] = [];
  const failedOrderIds: number[] = [];

  for (const id of orderIds) {
    try {
      await fetchFromPrestashopApi(`/orders/${id}`, { method: "DELETE" });
      console.log(`Deleted order with ID: ${id}`);
      deletedOrderIds.push(id);
    } catch (error) {
      console.error("Error deleting order:", error);
      failedOrderIds.push(id);
    }
  }

  return { deletedOrderIds, failedOrderIds };
}

export async function resetCustomers(customerIds: number[]): Promise<{
  deletedCustomerIds: number[];
  failedCustomerIds: number[];
}> {
  const deletedCustomerIds: number[] = [];
  const failedCustomerIds: number[] = [];

  for (const id of customerIds) {
    try {
      await fetchFromPrestashopApi(`/customers/${id}`, { method: "DELETE" });
      console.log(`Deleted customer with ID: ${id}`);
      deletedCustomerIds.push(id);
    } catch (error) {
      console.error("Error deleting customer:", error);
      failedCustomerIds.push(id);
    }
  }

  return { deletedCustomerIds, failedCustomerIds };
}

