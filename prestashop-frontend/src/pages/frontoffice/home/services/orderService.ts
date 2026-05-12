// src/pages/frontoffice/home/services/orderService.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { toast } from "sonner";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { orderSchema } from "@/schemas/order";
import { cartSchema } from "@/schemas/cart";
import { addressSchema } from "@/schemas/address";
import { customerSchema } from "@/schemas/customer";
import { orderHistorySchema } from "@/schemas/orderHistory";
import { orderPaymentSchema } from "@/schemas/orderPayment";
import type { CartItem } from "@/contexts/CartContext";

const COUNTRY_ID = 8;

// Order states
export const ORDER_STATES = {
  AWAITING_CASH_ON_DELIVERY: 13, // Awaiting Cash On Delivery validation
  SHIPPED: 4, // Shipped
  DELIVERED: 5, // Delivered
  PAYMENT_ACCEPTED: 2, // Payment accepted
} as const;

export interface GuestCustomer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface OrderResult {
  orderId: number;
  orderReference: string;
  totalAmount: number;
}

function generatePassword(_length: number = 12): string {
  return "H3r@n@m@n@0l1nux";
}

function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Step 1: Create a guest customer
export async function createGuestCustomer(
  firstname: string,
  lastname: string,
  email: string,
  languageId: number = 1,
): Promise<GuestCustomer> {
  const converter = new PrestaShopXMLConverter(customerSchema, "");

  const customerData: Record<string, string> = {
    firstname,
    lastname,
    email,
    passwd: generatePassword(),
    active: "1",
    newsletter: "0",
    optin: "0",
    groups: "1,2,3",
    id_default_group: "3",
    id_lang: languageId.toString(),
  };

  const xmlData = converter.convertRowToXML(customerData);
  console.log("Create Customer XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      customer: GuestCustomer;
    }>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    toast.success("Account created successfully");
    return response.customer;
  } catch (error) {
    console.error("Error creating guest customer:", error);
    toast.error("Failed to create account. Please try again.");
    throw error;
  }
}

// Step 2: Create an address
export async function createAddress(
  customerId: number,
  firstname: string,
  lastname: string,
  address1: string,
  city: string,
  phone: string,
  countryId: number = COUNTRY_ID,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(addressSchema, "");

  const addressData: Record<string, string> = {
    id_customer: customerId.toString(),
    firstname,
    lastname,
    address1,
    city,
    phone,
    phone_mobile: phone,
    id_country: countryId.toString(),
    alias: "Delivery Address",
    postcode: "101",
  };

  const xmlData = converter.convertRowToXML(addressData);
  console.log("Create Address XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      address: { id: number };
    }>("/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    return response.address.id;
  } catch (error) {
    console.error("Error creating address:", error);
    toast.error("Failed to create address");
    throw error;
  }
}

// Step 3: Create a cart with products
export async function createCart(
  cartItems: CartItem[],
  currencyId: number = 1,
  languageId: number = 1,
  customerId?: number,
  addressId?: number,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(cartSchema, "");

  const cartRowsString = cartItems
    .map((item) => {
      const productId = item.productId.toString();
      const attributeId = item.combinationId?.toString() || "";
      const quantity = item.quantity.toString();
      return `${productId},${attributeId},${quantity}`;
    })
    .join(";");

  const cartData: Record<string, string> = {
    id_currency: currencyId.toString(),
    id_lang: languageId.toString(),
    id_shop: "1",
    id_shop_group: "1",
    id_carrier: "0",
    delivery_option: "{}",
    allow_seperated_package: "0",
    ...(customerId && { id_customer: customerId.toString() }),
    ...(addressId && {
      id_address_delivery: addressId.toString(),
      id_address_invoice: addressId.toString(),
    }),
    cart_rows: cartRowsString,
  };

  const xmlData = converter.convertRowToXML(cartData);
  console.log("Create Cart XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      cart: { id: number };
    }>("/carts", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const cartId = response.cart.id;
    console.log("Cart created with ID:", cartId);
    return cartId;
  } catch (error) {
    console.error("Error creating cart:", error);
    toast.error("Failed to create cart");
    throw error;
  }
}

// Step 4: Get cart total (from products), handling combinations
export async function getCartTotal(cartId: number): Promise<{
  total_wt: number;
  total: number;
}> {
  try {
    const response = await fetchFromPrestashopApi<{
      cart: {
        associations: {
          cart_rows: {
            cart_row: Array<{
              id_product: string | { "#text": string };
              id_product_attribute?: string | { "#text": string };
              quantity: string | { "#text": string };
            }>;
          };
        };
      };
    }>(`/carts/${cartId}?display=full`, { method: "GET" });

    let totalWithTax = 0;
    let totalNoTax = 0;

    const cartRows = response.cart?.associations?.cart_rows?.cart_row;

    if (cartRows) {
      const rows = Array.isArray(cartRows) ? cartRows : [cartRows];

      for (const row of rows) {
        // Extract values (they could be strings or objects with #text)
        const productId =
          typeof row.id_product === "object"
            ? row.id_product["#text"]
            : row.id_product;

        const quantity =
          typeof row.quantity === "object"
            ? parseInt(row.quantity["#text"])
            : parseInt(row.quantity);

        const productAttributeId = row.id_product_attribute
          ? typeof row.id_product_attribute === "object"
            ? row.id_product_attribute["#text"]
            : row.id_product_attribute
          : undefined;

        // Fetch product price with proper combination handling
        try {
          const priceParams = new URLSearchParams({
            display: "full",
          });

          // If there's a product attribute (combination), include it
          if (productAttributeId && productAttributeId !== "0") {
            priceParams.append(
              "price[price_ttc][product_attribute]",
              productAttributeId,
            );
          } else {
            priceParams.append("price[price_ttc]", "1");
          }

          const productResponse = await fetchFromPrestashopApi<{
            product: {
              price: number;
              price_ttc: number;
            };
          }>(`/products/${productId}?${priceParams.toString()}`, {
            method: "GET",
          });

          const price = parseFloat(
            (
              productResponse.product?.price_ttc ||
              productResponse.product?.price ||
              0
            ).toString(),
          );

          let priceHt: number = parseFloat(
            (productResponse.product?.price || 0).toString(),
          );

          if (productAttributeId && productAttributeId !== "0") {
            // If there's a combination, we need the price impact
            const combinationResponse = await fetchFromPrestashopApi<{
              combination: {
                price: number;
              };
            }>(`/combinations/${productAttributeId}?display=[price]`, {
              method: "GET",
            });

            const priceImpact = parseFloat(
              combinationResponse.combination?.price.toString() || "0",
            );

            priceHt += priceImpact;
          }

          totalWithTax += price * quantity;
          totalNoTax += priceHt * quantity;

          console.log(
            `Product ${productId}${productAttributeId ? ` (attribute ${productAttributeId})` : ""}: ${price} x ${quantity} = ${price * quantity}`,
          );
        } catch (error) {
          console.warn(`Could not fetch price for product ${productId}`, error);
        }
      }
    }

    console.log("Cart total calculated:", totalWithTax);
    console.log("Cart total (excluding tax):", totalNoTax);

    return {
      total_wt: totalWithTax,
      total: totalNoTax,
    };
  } catch (error) {
    console.error("Error calculating cart total:", error);
    return { total_wt: 0, total: 0 };
  }
}

// Step 5: Get available carriers
export async function getAvailableCarriers(): Promise<
  Array<{ id: number; name: string }>
> {
  try {
    const response = await fetchFromPrestashopApi<{
      carriers: {
        carrier: Array<{ id: number; name: string }>;
      };
    }>(`/carriers?display=full&filter[active]=1&filter[deleted]=0`, {
      method: "GET",
    });

    const carriers = response.carriers?.carrier || [];
    return Array.isArray(carriers) ? carriers : [carriers];
  } catch (error) {
    console.error("Error fetching carriers:", error);
    return [{ id: 1, name: "Default Carrier" }];
  }
}

// Step 6: Create the order with "Awaiting Cash On Delivery" state
export async function createOrder(
  cartId: number,
  customerId: number,
  addressId: number,
  currencyId: number,
  languageId: number,
  totalAmount: number,
  totalAmountWt: number,
  paymentMethod: string = "Paiement à la livraison",
  carrierId: number = 0,
): Promise<{ id: number; reference: string }> {
  const converter = new PrestaShopXMLConverter(orderSchema, "");

  const orderData: Record<string, string> = {
    id_address_delivery: addressId.toString(),
    id_address_invoice: addressId.toString(),
    id_cart: cartId.toString(),
    id_currency: currencyId.toString(),
    id_lang: languageId.toString(),
    id_customer: customerId.toString(),
    id_carrier: carrierId.toString(),
    current_state: ORDER_STATES.AWAITING_CASH_ON_DELIVERY.toString(),
    module: "ps_cashondelivery",
    payment: paymentMethod,
    total_paid: "0",
    total_paid_tax_incl: "0",
    total_paid_tax_excl: "0",
    total_paid_real: "0", // Not paid yet
    total_products: totalAmount.toFixed(6),
    total_products_wt: totalAmountWt.toFixed(6),
    total_shipping: "0",
    total_shipping_tax_incl: "0",
    total_shipping_tax_excl: "0",
    conversion_rate: "1",
    valid: "1",
    id_shop: "1",
    id_shop_group: "1",
  };

  const xmlData = converter.convertRowToXML(orderData);
  console.log("Create Order XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      order: { id: number; reference: string };
    }>("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    toast.success("Order created successfully!");
    return {
      id: response.order.id,
      reference: response.order.reference,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    toast.error("Failed to create order. Please try again.");
    throw error;
  }
}

// Step 7: Update order state (add order history)
export async function updateOrderState(
  orderId: number,
  orderStateId: number,
): Promise<void> {
  const converter = new PrestaShopXMLConverter(orderHistorySchema, "");

  const historyData: Record<string, string> = {
    id_order: orderId.toString(),
    id_order_state: orderStateId.toString(),
  };

  const xmlData = converter.convertRowToXML(historyData);
  console.log(
    `Update Order #${orderId} to State #${orderStateId} XML:`,
    xmlData,
  );

  try {
    await fetchFromPrestashopApi("/order_histories", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const stateNames: Record<number, string> = {
      [ORDER_STATES.AWAITING_CASH_ON_DELIVERY]: "Awaiting Cash On Delivery",
      [ORDER_STATES.SHIPPED]: "Shipped",
      [ORDER_STATES.DELIVERED]: "Delivered",
      [ORDER_STATES.PAYMENT_ACCEPTED]: "Payment Accepted",
    };

    toast.success(
      `Order ${stateNames[orderStateId] || "Updated"} successfully`,
    );
  } catch (error) {
    console.error(`Error updating order state to ${orderStateId}:`, error);
    toast.error("Failed to update order status");
    throw error;
  }
}

// Step 8: Add payment to order
export async function addOrderPayment(
  orderReference: string,
  currencyId: number,
  amount: number,
  paymentMethod: string = "Cash On Delivery",
): Promise<void> {
  const converter = new PrestaShopXMLConverter(orderPaymentSchema, "");

  const paymentData: Record<string, string> = {
    order_reference: orderReference,
    id_currency: currencyId.toString(),
    amount: amount.toFixed(2),
    payment_method: paymentMethod,
    conversion_rate: "1",
    transaction_id: generateTransactionId(),
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

    toast.success("Payment recorded successfully");
  } catch (error) {
    console.error("Error adding payment:", error);
    toast.error("Failed to record payment");
    throw error;
  }
}

// src/pages/frontoffice/home/services/orderService.ts
// Keep only processCheckout that creates order without auto-completing

export async function processCheckout(
  cartItems: CartItem[],
  customerInfo: {
    firstname: string;
    lastname: string;
    email: string;
    address: string;
    city: string;
    phone: string;
  },
  languageId: number = 1,
  currencyId: number = 1,
  existingCustomerId?: number,
): Promise<OrderResult> {
  try {
    let customer: GuestCustomer;

    if (existingCustomerId) {
      toast.info("Using your account...");
      customer = {
        id: existingCustomerId,
        firstname: customerInfo.firstname,
        lastname: customerInfo.lastname,
        email: customerInfo.email,
      };
    } else {
      toast.info("Creating your account...");
      customer = await createGuestCustomer(
        customerInfo.firstname,
        customerInfo.lastname,
        customerInfo.email,
        languageId,
      );
    }

    toast.info("Saving your address...");
    const addressId = await createAddress(
      customer.id,
      customerInfo.firstname,
      customerInfo.lastname,
      customerInfo.address,
      customerInfo.city,
      customerInfo.phone,
      COUNTRY_ID,
    );

    toast.info("Creating your cart...");
    const cartId = await createCart(
      cartItems,
      currencyId,
      languageId,
      customer.id,
      addressId,
    );

    const cartTotal = await getCartTotal(cartId);
    console.log("Cart Total:", cartTotal);

    toast.info("Placing your order...");
    const order = await createOrder(
      cartId,
      customer.id,
      addressId,
      currencyId,
      languageId,
      cartTotal.total,
      cartTotal.total_wt,
      "Paiement à la livraison",
    );

    // Update the state to "Awaiting Cash On Delivery" (state ID 13)
    await updateOrderState(order.id, ORDER_STATES.AWAITING_CASH_ON_DELIVERY);

    return {
      orderId: order.id,
      orderReference: order.reference,
      totalAmount: cartTotal.total_wt,
    };
  } catch (error) {
    console.error("Checkout failed:", error);
    toast.error("Order process failed. Please try again.");
    throw error;
  }
}
