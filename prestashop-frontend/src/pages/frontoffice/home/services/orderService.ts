// src/pages/frontoffice/home/services/orderService.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { toast } from "sonner";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { addressSchema } from "@/schemas/address";
import { customerSchema } from "@/schemas/customer";
import type { CartItem } from "@/contexts/CartContext";
import { ORDER_STATES, type OrderReadXML } from "@/pages/backoffice/home/types";
import { createCart } from "@/pages/backoffice/home/import-services/customer-import";
import { createOrder as createOrderOriginal } from "@/pages/backoffice/home/import-services/customer-import";
import type { LanguageData } from "@/contexts/LanguageContext";

const COUNTRY_ID = 8;
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
  date_add? : string
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
    date_add: date_add || new Date().toISOString().slice(0, 19).replace("T", " "),
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
              id_product: { "#text": number };
              id_product_attribute: { "#text": number };
              quantity: number;
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
        const productId = row.id_product["#text"];

        const quantity = row.quantity;

        const productAttributeId = row.id_product_attribute["#text"];

        // Fetch product price with proper combination handling
        try {
          const priceParams = new URLSearchParams({
            display: "full",
          });

          // If there's a product attribute (combination), include it
          if (productAttributeId && productAttributeId !== 0) {
            priceParams.append(
              "price[price_ttc][product_attribute]",
              productAttributeId.toString(),
            );
          } else {
            priceParams.append("price[price_ttc][use_tax]", "1");
          }

          const productResponse = await fetchFromPrestashopApi<{
            product: {
              price: number;
              price_ttc: number;
            };
          }>(`/products/${productId}?${priceParams.toString()}`, {
            method: "GET",
          });

          console.log(`Fetched product ${productId} price:`, productResponse);

          const price =
            productResponse.product.price_ttc || productResponse.product.price;

          console.log(
            `Fetched price for product ${productId}${productAttributeId ? ` (attribute ${productAttributeId})` : ""}: ${price}`,
          );

          let priceHt: number = productResponse.product.price;

          if (productAttributeId && productAttributeId !== 0) {
            // If there's a combination, we need the price impact
            const combinationResponse = await fetchFromPrestashopApi<{
              combination: {
                price: number;
              };
            }>(`/combinations/${productAttributeId}?display=[price]`, {
              method: "GET",
            });

            const priceImpact = combinationResponse.combination.price;

            priceHt += priceImpact;
          }

          totalWithTax += price * quantity;
          totalNoTax += priceHt * quantity;

          console.log(
            `Product ${productId}${productAttributeId ? ` (attribute ${productAttributeId})` : ""}: ${price} x ${quantity} = ${price * quantity}`,
          );
        } catch (error) {
          console.error(
            `Could not fetch price for product ${productId}`,
            error,
          );
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
  savedCartId?: number,
): Promise<OrderResult> {
  const date_add_to_use = new Date().toISOString().slice(0, 19).replace("T", " ");
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

    let cartId: number;

    if (savedCartId) {
      // Use existing saved cart
      toast.info("Using your saved cart...");
      cartId = savedCartId;
    } else {
      // Create a new cart with items
      toast.info("Creating your cart...");
      cartId = await createCart(
        cartItems,
        customer.id,
        addressId,
        date_add_to_use
      );
    }

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
      date_add_to_use
    );

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

async function createOrder(
  cartId: number,
  customerId: number,
  addressId: number,
  currencyId: number,
  languageId: number,
  total: number,
  total_wt: number,
  paymentMethod: string,
  date_add: string
): Promise<OrderReadXML> {
  return await createOrderOriginal(
    cartId,
    customerId,
    addressId,
    total,
    total_wt,
    paymentMethod,
    {
      currency_id: currencyId,
      language_id: languageId,
      conversion_change: 1,
    } as unknown as LanguageData,
    date_add,
    ORDER_STATES.AWAITING_CASH_ON_DELIVERY
  );
}
