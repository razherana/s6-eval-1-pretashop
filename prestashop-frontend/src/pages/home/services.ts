import { fetchFromPrestashopApi } from "@/utils/url";
import type {
  ProductReadXML,
  OrderReadXML,
  CustomerReadXML,
  OrderDetailReadXML,
} from "./types";
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
