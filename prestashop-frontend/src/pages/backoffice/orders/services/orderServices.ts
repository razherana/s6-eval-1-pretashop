// src/pages/backoffice/orders/services/orderServices.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import {
  type OrderReadXML,
  type OrderDetailReadXML,
  type OrderStateXML,
} from "../../home/types";
import { processCompleteOrderFlow } from "../../home/import-services/customer-import";
import { assureArray } from "@/utils/xml";
import { toast } from "sonner";
import { getCartTotal } from "@/pages/frontoffice/home/services/orderService";
import type { LanguageData } from "@/utils/lang";

export interface UserCart {
  id: number;
  id_customer: { "#text": string };
  date_add: string;
  associations?: {
    cart_rows?: {
      cart_row?: Array<{
        id_product: { "#text": number };
        id_product_attribute: { "#text": number };
        quantity: number;
      }>;
    };
  };
}

// Fetch all carts
export async function fetchAllCarts(): Promise<UserCart[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: "1000",
    sort: "id_DESC",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      carts: {
        cart: UserCart | UserCart[];
      };
    }>(`/carts?${query.toString()}`, { method: "GET" });

    return assureArray(response.carts.cart);
  } catch (error) {
    console.error("Error fetching carts:", error);
    return [];
  }
}

// Get all cart IDs that are already converted to orders
export async function getOrderedCartIds(): Promise<Set<number>> {
  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order: Array<{
          id_cart: { "#text": number };
        }>;
      };
    }>("/orders?display=[id_cart]&limit=1000", { method: "GET" });

    const orders = assureArray(response.orders.order);

    const cartIds = new Set<number>();
    for (const order of orders) {
      const cartId = order.id_cart?.["#text"];
      cartIds.add(cartId);
    }

    console.log("Ordered cart IDs:", cartIds);

    return cartIds;
  } catch (error) {
    console.error("Error fetching ordered cart IDs:", error);
    return new Set();
  }
}

// Get carts without orders
export async function getCartsWithoutOrders(): Promise<UserCart[]> {
  const [carts, orderedCartIds] = await Promise.all([
    fetchAllCarts(),
    getOrderedCartIds(),
  ]);

  return carts.filter((cart) => !orderedCartIds.has(cart.id));
}

// Convert cart to pseudo-order for display
export async function cartToOrderDisplay(
  cart: UserCart,
  currencyId: number,
): Promise<OrderReadXML> {
  const prices = await getCartTotal(cart.id);

  return {
    id: cart.id,
    reference: `CART-${cart.id}`,
    total_paid: 0,
    total_paid_tax_incl: 0,
    payment: "In Cart",
    current_state: { "#text": 0 }, // Special state 0 = "In Cart"
    id_currency: { "#text": currencyId },
    id_customer: {
      "#text": parseInt(cart.id_customer["#text"]),
    },
    date_add: cart.date_add,
    total_products_wt: prices.total_wt,
    total_products: prices.total,
  };
}

// Fetch all orders with carts combined
export async function fetchAllOrdersWithCarts(
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
        order: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    const orders = assureArray(response.orders.order);

    // Get carts without orders and convert them
    const cartsWithoutOrders = await getCartsWithoutOrders();
    const cartOrders = await Promise.all(
      cartsWithoutOrders.map(async (cart) => {
        return await cartToOrderDisplay(
          cart,
          orders[0]?.id_currency?.["#text"] || 1,
        );
      }),
    );

    // Combine and sort by ID descending
    return [...orders, ...cartOrders].sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error fetching orders with carts:", error);
    throw error;
  }
}

// Fetch all orders (original, without carts)
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
        order: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    return assureArray(response.orders?.order);
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
        order_detail: OrderDetailReadXML | OrderDetailReadXML[];
      };
    }>(`/order_details?${query.toString()}`, { method: "GET" });

    return assureArray(response.order_details?.order_detail);
  } catch (error) {
    console.error(`Error fetching order details for order ${orderId}:`, error);
    throw error;
  }
}

// Fetch cart details (convert to order details format)
export async function fetchCartDetails(
  cartId: number,
): Promise<OrderDetailReadXML[]> {
  try {
    const response = await fetchFromPrestashopApi<{
      cart: {
        associations: {
          cart_rows: {
            cart_row: Array<{
              id_product: { "#text": number };
              id_product_attribute: { "#text": number };
              quantity: number;
            }>;
          };
        };
      };
    }>(`/carts/${cartId}?display=full`, { method: "GET" });

    const rows = assureArray(response.cart.associations.cart_rows.cart_row);
    const details: OrderDetailReadXML[] = [];

    for (const row of rows) {
      const productId = row.id_product["#text"];
      const quantity = row.quantity;
      const combinationId = row.id_product_attribute?.["#text"];

      let productName = `Product #${productId}`;
      let productPrice = 0;
      let productReference = "";

      try {
        const productResponse = await fetchFromPrestashopApi<{
          product: {
            name: { language: Array<{ "@_id": number; "#text": string }> };
            price: string;
            reference: string;
          };
        }>(`/products/${productId}?display=[name,price,reference]`, {
          method: "GET",
        });

        const product = productResponse.product;
        if (product?.name?.language?.[0]) {
          productName = product.name.language[0]["#text"];
        }
        productPrice = parseFloat(product?.price || "0");
        productReference = product?.reference || "";
      } catch {
        console.warn(`Could not fetch product ${productId}`);
      }

      details.push({
        id: 0,
        id_order: cartId,
        product_id: { "#text": productId },
        product_attribute_id: { "#text": combinationId || 0 },
        product_name: productName,
        product_quantity: quantity,
        product_price: productPrice,
        total_price_tax_incl: productPrice * quantity,
        product_reference: productReference,
      });
    }

    return details;
  } catch (error) {
    console.error(`Error fetching cart details for cart ${cartId}:`, error);
    return [];
  }
}

// Fetch all order states
export async function fetchAllOrderStates(): Promise<OrderStateXML[]> {
  const query = new URLSearchParams({ display: "full" });

  try {
    const response = await fetchFromPrestashopApi<{
      order_states: {
        order_state: OrderStateXML | OrderStateXML[];
      };
    }>(`/order_states?${query.toString()}`, { method: "GET" });

    return assureArray(response.order_states?.order_state);
  } catch (error) {
    console.error("Error fetching order states:", error);
    return [];
  }
}

// Process delivery and payment for an order
export async function processDeliveryAndPayment(
  order: OrderReadXML,
  languageData: LanguageData,
): Promise<void> {
  // Don't allow processing carts
  if (order.reference?.startsWith("CART-")) {
    toast.error("Cannot process a cart. Create an order first.");
    return;
  }

  await processCompleteOrderFlow(
    order.id,
    order.reference,
    order.total_paid_tax_incl,
    new Date().toISOString().slice(0, 19).replace("T", " "),
    languageData,
    true
  );
}
