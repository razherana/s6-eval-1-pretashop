// src/pages/frontoffice/home/services/orderQueries.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import type { 
  OrderReadXML, 
  OrderDetailReadXML, 
  OrderHistoryXML,
} from "@/pages/backoffice/home/types";

// Fetch orders for a specific customer
export async function fetchCustomerOrders(
  customerId: number,
  limit: number = 100,
  offset: number = 0,
): Promise<OrderReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
    "filter[id_customer]": customerId.toString(),
    sort: "id_DESC",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order?: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    const orders = response.orders?.order || [];
    return Array.isArray(orders) ? orders : [orders];
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
}

// Fetch order details for a specific order
export async function fetchOrderDetailsById(
  orderId: number,
): Promise<OrderDetailReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    "filter[id_order]": orderId.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      order_details: {
        order_detail?: OrderDetailReadXML | OrderDetailReadXML[];
      };
    }>(`/order_details?${query.toString()}`, { method: "GET" });

    const details = response.order_details?.order_detail || [];
    return Array.isArray(details) ? details : [details];
  } catch (error) {
    console.error(`Error fetching order details for order ${orderId}:`, error);
    throw error;
  }
}

// Fetch order history (state changes) for a specific order
export async function fetchOrderHistory(
  orderId: number,
): Promise<OrderHistoryXML[]> {
  const query = new URLSearchParams({
    display: "full",
    "filter[id_order]": orderId.toString(),
    // sort: "date_add_ASC",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      order_histories: {
        order_history?: OrderHistoryXML | OrderHistoryXML[];
      };
    }>(`/order_histories?${query.toString()}`, { method: "GET" });

    const history = response.order_histories?.order_history || [];
    return Array.isArray(history) ? history : [history];
  } catch (error) {
    console.error(`Error fetching order history for order ${orderId}:`, error);
    throw error;
  }
}