import { fetchFromPrestashopApi } from "@/utils/url";
import { parseCSV } from "@/utils/csv";
import type {
  ProductReadXML,
  OrderReadXML,
  CustomerReadXML,
  CategoryReadXML,
  OrderDetailReadXML,
  TaxReadXML,
  TaxRuleGroupReadXML,
  TaxRuleReadXML,
  OrderPaymentXML,
  OrderHistoryXML,
  OrderInvoiceXML,
} from "./types";
import { assureArray, PrestaShopXMLConverter } from "@/utils/xml";

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
  totalImages: number;
  successImages: number;
  failedImages: number;
}

export interface InputRefs {
  products: React.RefObject<HTMLInputElement>;
  variants: React.RefObject<HTMLInputElement>;
  customers: React.RefObject<HTMLInputElement>;
  zip: React.RefObject<HTMLInputElement>;
}

export type ImportMode = "all" | "products-variants" | "customers" | "images";

export async function parseCsvFile(
  file: File,
  delimiter: string,
): Promise<Record<string, string>[]> {
  const csv = await file.text();
  return parseCSV(csv, delimiter);
}

export function buildImportSummary(
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
    warnings: rows.filter((row) => row.warnings && row.warnings.length > 0)
      .length,
  };
}

export async function fetchCategories(
  limit: number = 100,
  offset: number = 0,
): Promise<CategoryReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/categories?${query.toString()}`,
      { method: "GET" },
    );

    if (response.categories.category) {
      return Array.isArray(response.categories.category)
        ? response.categories.category
        : [response.categories.category];
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// --- Others

export async function fetchProducts(
  limit: number,
  offset: number,
  extraParams: Record<string, string> = {},
): Promise<ProductReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
    ...extraParams,
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

    if (response.orders.order) {
      return Array.isArray(response.orders.order)
        ? response.orders.order
        : [response.orders.order];
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchOrderPayments(
  limit: number = 100,
  offset: number = 0,
): Promise<OrderPaymentXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/order_payments?${query.toString()}`,
      { method: "GET" },
    );

    if (response.order_payments.order_payment) {
      return Array.isArray(response.order_payments.order_payment)
        ? response.order_payments.order_payment
        : [response.order_payments.order_payment];
    }
    return [];
  } catch (error) {
    console.error("Error fetching order payments:", error);
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

export async function fetchOrderHistories(
  limit: number = 100,
  offset: number = 0,
): Promise<OrderHistoryXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      order_histories: {
        order_history: OrderHistoryXML[];
      };
    }>(`/order_histories?${query.toString()}`, { method: "GET" });

    if (response.order_histories.order_history) {
      return Array.isArray(response.order_histories.order_history)
        ? response.order_histories.order_history
        : [response.order_histories.order_history];
    }
    return [];
  } catch (error) {
    console.error("Error fetching order histories:", error);
    throw error;
  }
}

export async function fetchOrderInvoices(
  limit: number = 100,
  offset: number = 0,
): Promise<OrderInvoiceXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      order_invoices: {
        order_invoice: OrderInvoiceXML[];
      };
    }>(`/order_invoices?${query.toString()}`, { method: "GET" });

    if (response.order_invoices.order_invoice) {
      return Array.isArray(response.order_invoices.order_invoice)
        ? response.order_invoices.order_invoice
        : [response.order_invoices.order_invoice];
    }
    return [];
  } catch (error) {
    console.error("Error fetching order invoices:", error);
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

    if (response.customers.customer) {
      return Array.isArray(response.customers.customer)
        ? response.customers.customer
        : [response.customers.customer];
    }
    return [];
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

export async function resetOrderPayments(orderPaymentIds: number[]): Promise<{
  deletedOrderPaymentIds: number[];
  failedOrderPaymentIds: number[];
}> {
  const deletedOrderPaymentIds: number[] = [];
  const failedOrderPaymentIds: number[] = [];

  for (const id of orderPaymentIds) {
    try {
      await fetchFromPrestashopApi(`/order_payments/${id}`, {
        method: "DELETE",
      });
      console.log(`Deleted order payment with ID: ${id}`);
      deletedOrderPaymentIds.push(Number(id));
    } catch (error) {
      console.error("Error deleting order payment:", error);
      failedOrderPaymentIds.push(Number(id));
    }
  }

  return { deletedOrderPaymentIds, failedOrderPaymentIds };
}

export async function resetOrderHistories(orderHistoryIds: number[]): Promise<{
  deletedOrderHistoryIds: number[];
  failedOrderHistoryIds: number[];
}> {
  const deletedOrderHistoryIds: number[] = [];
  const failedOrderHistoryIds: number[] = [];

  for (const id of orderHistoryIds) {
    try {
      await fetchFromPrestashopApi(`/order_histories/${id}`, {
        method: "DELETE",
      });
      console.log(`Deleted order history with ID: ${id}`);
      deletedOrderHistoryIds.push(id);
    } catch (error) {
      console.error("Error deleting order history:", error);
      failedOrderHistoryIds.push(id);
    }
  }

  return { deletedOrderHistoryIds, failedOrderHistoryIds };
}

export async function resetOrderInvoices(orderInvoiceIds: number[]): Promise<{
  deletedOrderInvoiceIds: number[];
  failedOrderInvoiceIds: number[];
}> {
  const deletedOrderInvoiceIds: number[] = [];
  const failedOrderInvoiceIds: number[] = [];

  for (const id of orderInvoiceIds) {
    try {
      await fetchFromPrestashopApi(`/order_invoices/${id}`, {
        method: "DELETE",
      });
      console.log(`Deleted order invoice with ID: ${id}`);
      deletedOrderInvoiceIds.push(id);
    } catch (error) {
      console.error("Error deleting order invoice:", error);
      failedOrderInvoiceIds.push(id);
    }
  }

  return { deletedOrderInvoiceIds, failedOrderInvoiceIds };
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

export async function resetCategories(categoryIds: number[]): Promise<{
  deletedCategoryIds: number[];
  failedCategoryIds: number[];
}> {
  const deletedCategoryIds: number[] = [];
  const failedCategoryIds: number[] = [];

  for (const id of categoryIds) {
    try {
      await fetchFromPrestashopApi(`/categories/${id}`, { method: "DELETE" });
      console.log(`Deleted category with ID: ${id}`);
      deletedCategoryIds.push(id);
    } catch (error) {
      console.error("Error deleting category:", error);
      failedCategoryIds.push(id);
    }
  }

  return { deletedCategoryIds, failedCategoryIds };
}

export async function fetchTaxes(
  limit: number = 100,
  offset: number = 0,
): Promise<TaxReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/taxes?${query.toString()}`,
      { method: "GET" },
    );

    if (response.taxes.tax) {
      return Array.isArray(response.taxes.tax)
        ? response.taxes.tax
        : [response.taxes.tax];
    }
    return [];
  } catch (error) {
    console.error("Error fetching taxes:", error);
    throw error;
  }
}

export async function fetchTaxRuleGroups(
  limit: number = 100,
  offset: number = 0,
): Promise<TaxRuleGroupReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/tax_rule_groups?${query.toString()}`,
      { method: "GET" },
    );

    if (response.tax_rule_groups.tax_rule_group) {
      return Array.isArray(response.tax_rule_groups.tax_rule_group)
        ? response.tax_rule_groups.tax_rule_group
        : [response.tax_rule_groups.tax_rule_group];
    }
    return [];
  } catch (error) {
    console.error("Error fetching tax rule groups:", error);
    throw error;
  }
}

export async function fetchTaxRules(
  limit: number = 100,
  offset: number = 0,
): Promise<TaxRuleReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await fetchFromPrestashopApi<any>(
      `/tax_rules?${query.toString()}`,
      { method: "GET" },
    );

    if (response.tax_rules.tax_rule) {
      return Array.isArray(response.tax_rules.tax_rule)
        ? response.tax_rules.tax_rule
        : [response.tax_rules.tax_rule];
    }
    return [];
  } catch (error) {
    console.error("Error fetching tax rules:", error);
    throw error;
  }
}

export async function resetTaxes(taxIds: number[]): Promise<{
  deletedTaxIds: number[];
  failedTaxIds: number[];
}> {
  const deletedTaxIds: number[] = [];
  const failedTaxIds: number[] = [];

  for (const id of taxIds) {
    try {
      await fetchFromPrestashopApi(`/taxes/${id}`, { method: "DELETE" });
      console.log(`Deleted tax with ID: ${id}`);
      deletedTaxIds.push(id);
    } catch (error) {
      console.error("Error deleting tax:", error);
      failedTaxIds.push(id);
    }
  }

  return { deletedTaxIds, failedTaxIds };
}

export async function resetTaxRuleGroups(taxRuleGroupIds: number[]): Promise<{
  deletedTaxRuleGroupIds: number[];
  failedTaxRuleGroupIds: number[];
}> {
  const deletedTaxRuleGroupIds: number[] = [];
  const failedTaxRuleGroupIds: number[] = [];

  for (const id of taxRuleGroupIds) {
    try {
      await fetchFromPrestashopApi(`/tax_rule_groups/${id}`, {
        method: "DELETE",
      });
      console.log(`Deleted tax rule group with ID: ${id}`);
      deletedTaxRuleGroupIds.push(id);
    } catch (error) {
      console.error("Error deleting tax rule group:", error);
      failedTaxRuleGroupIds.push(id);
    }
  }

  return { deletedTaxRuleGroupIds, failedTaxRuleGroupIds };
}

export async function resetTaxRules(taxRuleIds: number[]): Promise<{
  deletedTaxRuleIds: number[];
  failedTaxRuleIds: number[];
}> {
  const deletedTaxRuleIds: number[] = [];
  const failedTaxRuleIds: number[] = [];

  for (const id of taxRuleIds) {
    try {
      await fetchFromPrestashopApi(`/tax_rules/${id}`, { method: "DELETE" });
      console.log(`Deleted tax rule with ID: ${id}`);
      deletedTaxRuleIds.push(id);
    } catch (error) {
      console.error("Error deleting tax rule:", error);
      failedTaxRuleIds.push(id);
    }
  }

  return { deletedTaxRuleIds, failedTaxRuleIds };
}

export async function resetCarts(): Promise<{
  deletedCartIds: number[];
  failedCartIds: number[];
}> {
  const deletedCartIds: number[] = [];
  const failedCartIds: number[] = [];

  try {
    const response = await fetchFromPrestashopApi<{
      carts: {
        cart?: { "@_id": number }[];
      };
    }>(`/carts?limit=1000`, { method: "GET" });

    console.log("Fetched carts for deletion:", response.carts.cart);

    if (!response.carts.cart) {
      return {
        deletedCartIds,
        failedCartIds,
      };
    }

    const carts = response.carts.cart;
    console.log(`Fetched ${carts.length} carts for deletion.`);

    for (const cart of carts) {
      try {
        await fetchFromPrestashopApi(`/carts/${cart["@_id"]}`, {
          method: "DELETE",
        });
        console.log(`Deleted cart with ID: ${cart["@_id"]}`);
        deletedCartIds.push(cart["@_id"]);
      } catch (error) {
        console.error("Error deleting cart:", error);
        failedCartIds.push(cart["@_id"]);
      }
    }
  } catch (error) {
    console.error("Error fetching carts:", error);
  }

  return { deletedCartIds, failedCartIds };
}

export async function resetApi(
  apiName: string,
  apiNamePlural: string,
  specialApiName: string = apiName,
  specialApiNamePlural: string = apiNamePlural
): Promise<{
  deletedApiIds: number[];
  failedApiIds: number[];
}> {
  const failedApiIds: number[] = [];
  const deletedApiIds: number[] = [];
  const response = await fetchFromPrestashopApi<{
    [key: string]:
      | {
          [key: string]: { "@_id": number }[];
        }
      | undefined;
  }>(`/${apiNamePlural}?limit=1000`, { method: "GET" });

  if (!response[specialApiNamePlural] || !response[specialApiNamePlural][specialApiName]) 
    return {
      deletedApiIds,
      failedApiIds,
    };

  for (const id of assureArray(response[specialApiNamePlural][specialApiName])) {
    try {
      await fetchFromPrestashopApi(`/${apiNamePlural}/${id["@_id"]}`, {
        method: "DELETE",
      });
      deletedApiIds.push(id["@_id"]);
    } catch (error) {
      failedApiIds.push(id["@_id"]);
    }
  }

  return {
    deletedApiIds,
    failedApiIds,
  };
}
