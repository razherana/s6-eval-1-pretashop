import { fetchFromPrestashopApi } from "@/utils/url";
import {
  type OrderReadXML,
  type OrderDetailReadXML,
  type OrderStateXML,
} from "../../home/types";
import {
  processCompleteOrderFlow,
} from "../../home/import-services/customer-import";

// Fetch all orders with pagination
export async function fetchAllOrders(
  limit: number = 100,
  offset: number = 0,
  filters?: Record<string, string>,
): Promise<OrderReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: limit.toString(),
    offset: offset.toString(),
    sort: "id_DESC",
    ...filters,
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
    console.error("Error fetching orders:", error);
    throw error;
  }
}

// Fetch order details
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

// Fetch all order states
export async function fetchAllOrderStates(): Promise<OrderStateXML[]> {
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

// Process delivery and payment for an order
export async function processDeliveryAndPayment(
  order: OrderReadXML,
): Promise<void> {
  await processCompleteOrderFlow(order.id, order.reference, order.total_paid_tax_incl, new Date().toISOString().slice(0, 19).replace("T", " "), true);
}
