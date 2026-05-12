import { fetchFromPrestashopApi } from "@/utils/url";
import type { 
  OrderReadXML, 
  OrderDetailReadXML, 
  OrderStateXML,
} from "../../home/types";
import { PrestaShopXMLConverter } from "@/utils/xml";

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

// Update order state
export async function updateOrderState(
  orderId: number,
  orderStateId: number,
): Promise<void> {
  const converter = new PrestaShopXMLConverter(
    {
      data: {
        rootTag: "order_history",
        fields: {
          id_order: {
            xmlTag: "id_order",
            type: "simple",
            attributes: { required: "true" },
          },
          id_order_state: {
            xmlTag: "id_order_state",
            type: "simple",
            attributes: { required: "true" },
          },
        },
        multiLangFields: {},
        associations: {},
      },
      transforms: {},
    },
    "",
  );

  const historyData: Record<string, string> = {
    id_order: orderId.toString(),
    id_order_state: orderStateId.toString(),
  };

  const xmlData = converter.convertRowToXML(historyData);

  try {
    await fetchFromPrestashopApi("/order_histories", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
  } catch (error) {
    console.error(`Error updating order state for order ${orderId}:`, error);
    throw error;
  }
}