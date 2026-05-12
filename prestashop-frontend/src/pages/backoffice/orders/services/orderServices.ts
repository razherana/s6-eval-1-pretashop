import { fetchFromPrestashopApi } from "@/utils/url";
import type {
  OrderReadXML,
  OrderDetailReadXML,
  OrderStateXML,
} from "../../home/types";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { toast } from "sonner";

// Order states
export const ORDER_STATES = {
  AWAITING_CASH_ON_DELIVERY: 13,
  SHIPPED: 4,
  DELIVERED: 5,
  PAYMENT_ACCEPTED: 2,
} as const;

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

// Add payment to order
export async function addOrderPayment(
  orderReference: string,
  currencyId: number,
  amount: number,
  paymentMethod: string = "Cash On Delivery",
): Promise<void> {
  const converter = new PrestaShopXMLConverter(
    {
      data: {
        rootTag: "order_payment",
        fields: {
          order_reference: {
            xmlTag: "order_reference",
            type: "simple",
            attributes: {},
          },
          id_currency: {
            xmlTag: "id_currency",
            type: "simple",
            attributes: { required: "true" },
          },
          amount: {
            xmlTag: "amount",
            type: "simple",
            attributes: { required: "true" },
          },
          payment_method: {
            xmlTag: "payment_method",
            type: "simple",
            attributes: {},
          },
          conversion_rate: {
            xmlTag: "conversion_rate",
            type: "simple",
            attributes: {},
          },
          transaction_id: {
            xmlTag: "transaction_id",
            type: "simple",
            attributes: {},
          },
          date_add: {
            xmlTag: "date_add",
            type: "simple",
            attributes: {},
          },
        },
        multiLangFields: {},
        associations: {},
      },
      transforms: {},
    },
    "",
  );

  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const paymentData: Record<string, string> = {
    order_reference: orderReference,
    id_currency: currencyId.toString(),
    amount: amount.toFixed(2),
    payment_method: paymentMethod,
    conversion_rate: "1",
    transaction_id: transactionId,
    date_add: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const xmlData = converter.convertRowToXML(paymentData);
  console.log("Add Payment XML:", xmlData);

  try {
    await fetchFromPrestashopApi("/order_payments", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
}

// Process delivery and payment for an order
export async function processDeliveryAndPayment(
  order: OrderReadXML,
): Promise<void> {
  try {
    const orderId = order.id;
    const orderReference = order.reference;

    // Get currency ID from order
    const currencyId = order.id_currency["#text"];

    const totalAmount = parseFloat(order.total_paid?.toString() || "0");

    // Step 1: Update to Shipped
    toast.info("Setting as shipped...");
    await updateOrderState(orderId, ORDER_STATES.SHIPPED);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 2: Update to Delivered
    toast.info("Setting as delivered...");
    await updateOrderState(orderId, ORDER_STATES.DELIVERED);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 3: Add payment
    toast.info("Processing payment...");
    await addOrderPayment(
      orderReference,
      parseInt(currencyId.toString()),
      totalAmount,
      "Cash On Delivery",
    );

    // Step 4: Update to Payment Accepted
    toast.info("Payment accepted...");
    await updateOrderState(orderId, ORDER_STATES.PAYMENT_ACCEPTED);

    toast.success(`Order #${orderReference} fully processed!`);
  } catch (error) {
    console.error("Error processing delivery and payment:", error);
    toast.error("Failed to process delivery and payment");
    throw error;
  }
}
