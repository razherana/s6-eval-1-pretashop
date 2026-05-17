// src/pages/backoffice/home/import-services/customer-import.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { assureArray, PrestaShopXMLConverter } from "@/utils/xml";
import {
  type ImportResult,
  type ImportedRow,
  buildImportSummary,
  parseCsvFile,
} from "../services";
import { customerSchema } from "@/schemas/customer";
import { cartSchema } from "@/schemas/cart";
import { orderSchema } from "@/schemas/order";
import { addressSchema } from "@/schemas/address";
import { orderHistorySchema } from "@/schemas/orderHistory";
import { orderPaymentSchema } from "@/schemas/orderPayment";
import { updateStockQuantity } from "../services/stockServices";
import { toast } from "sonner";
import {
  ORDER_STATES,
  type LanguageField,
  type OrderHistoryXML,
  type OrderInvoiceXML,
  type OrderPaymentXML,
  type OrderReadXML,
} from "../types";
import { parse } from "date-fns";
import { utc } from "@date-fns/utc";
import type { LanguageData } from "@/contexts/LanguageContext";
import { orderInvoiceSchema } from "@/schemas/orderInvoice";

const USER_GROUP_ACCESS = [1, 2, 3];
const COUNTRY_ID = 8;
const DEFAULT_LANGUAGE_ID = 1;
const DEFAULT_CURRENCY_ID = 2;

interface CustomerEmailMap {
  [email: string]: number;
}

interface ProductReferenceMap {
  [reference: string]: {
    id: number;
    price: number;
    price_ttc: number;
    combinations?: {
      [optionValue: string]: {
        id: number;
        price: number;
        name: string;
      };
    };
  };
}

// Fetch all existing customers
async function fetchAllCustomers(): Promise<CustomerEmailMap> {
  try {
    const response = await fetchFromPrestashopApi<{
      customers: {
        customer: Array<{
          id: string;
          email: string;
        }>;
      };
    }>("/customers?display=[id,email]", { method: "GET" });

    const customers = Array.isArray(response.customers.customer)
      ? response.customers.customer
      : response.customers.customer
        ? [response.customers.customer]
        : [];

    const map: CustomerEmailMap = {};
    for (const customer of customers)
      if (customer.email) map[customer.email] = parseInt(customer.id);

    return map;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

// Create a new customer
async function createCustomer(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  default_group_id: number = 3,
  groups: number[] = USER_GROUP_ACCESS,
  otherFields: Record<string, string> = {},
): Promise<number> {
  const converter = new PrestaShopXMLConverter(customerSchema, "");

  const xmlData = converter.convertRowToXML({
    firstname: firstName,
    lastname: lastName,
    email: email,
    passwd: password,
    id_lang: "1",
    active: "1",
    newsletter: "0",
    optin: "0",
    id_default_group: default_group_id.toString(),
    groups: groups.join(","),
    ...otherFields,
  });

  console.log("Create Customer XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      customer: { id: string };
    }>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    return parseInt(response.customer.id);
  } catch (error) {
    console.error(`Error creating customer "${email}":`, error);
    throw error;
  }
}

// Create address for customer
async function createCustomerAddress(
  customerId: number,
  firstname: string,
  lastname: string,
  address1: string,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(addressSchema, "");

  const addressData: Record<string, string> = {
    id_customer: customerId.toString(),
    firstname,
    lastname,
    address1: address1 || "Address",
    city: "Antananarivo",
    phone: "0320000000",
    phone_mobile: "0320000000",
    id_country: COUNTRY_ID.toString(),
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
    throw error;
  }
}

// Fetch all products with their references and combinations
async function fetchProductReferences(): Promise<ProductReferenceMap> {
  try {
    const urlQuery = new URLSearchParams({
      display: "full",
      "price[price_ttc][use_tax]": "1",
    });

    // Fetch all products with references
    const productsResponse = await fetchFromPrestashopApi<{
      products: {
        product: Array<{
          id: number;
          reference: string;
          price: number;
          price_ttc: number;
          associations?: {
            combinations?: {
              combination?: Array<{ id: number }>;
            };
          };
        }>;
      };
    }>("/products?" + urlQuery.toString(), { method: "GET" });

    const products = Array.isArray(productsResponse.products?.product)
      ? productsResponse.products.product
      : [productsResponse.products?.product].filter(Boolean);

    const map: ProductReferenceMap = {};

    interface Combination {
      id: number;
      price: number;
      associations?: {
        product_option_values?: {
          product_option_value?: Array<{ id: string }> | { id: string };
        };
      };
    }

    // Fetch all combinations, product_option_values, product_options into a map to minimize API calls
    const combinationMap = new Map<number, Combination>();
    const optionValueMap = new Map<
      string,
      { id_attribute_group: string; name: string }
    >(); // id -> {id_attribute_group, name}
    const optionMap = new Map<string, string>(); // id -> name

    {
      const combinationsResponse = await fetchFromPrestashopApi<{
        combinations: {
          combination: Array<Combination>;
        };
      }>("/combinations?display=full", { method: "GET" });

      const combinations = Array.isArray(
        combinationsResponse.combinations?.combination,
      )
        ? combinationsResponse.combinations.combination
        : [combinationsResponse.combinations?.combination].filter(Boolean);

      for (const comb of combinations) combinationMap.set(comb.id, comb);

      const optionValuesResponse = await fetchFromPrestashopApi<{
        product_option_values: {
          product_option_value: Array<{
            id: string;
            name: LanguageField;
            id_attribute_group: {
              "#text": string;
            };
          }>;
        };
      }>("/product_option_values?display=full", { method: "GET" });

      const optionValues = Array.isArray(
        optionValuesResponse.product_option_values?.product_option_value,
      )
        ? optionValuesResponse.product_option_values.product_option_value
        : [
            optionValuesResponse.product_option_values?.product_option_value,
          ].filter(Boolean);

      for (const ov of optionValues) {
        const nameObj = ov.name.language[0];
        const name = nameObj?.["#text"] || "";
        optionValueMap.set(ov.id, {
          id_attribute_group: ov.id_attribute_group["#text"],
          name,
        });
      }

      const optionsResponse = await fetchFromPrestashopApi<{
        product_options: {
          product_option: Array<{
            id: string;
            name: LanguageField;
          }>;
        };
      }>("/product_options?display=full", { method: "GET" });

      const options = Array.isArray(
        optionsResponse.product_options?.product_option,
      )
        ? optionsResponse.product_options.product_option
        : [optionsResponse.product_options?.product_option].filter(Boolean);

      for (const opt of options) {
        const nameObj = opt.name.language[0];
        const name = nameObj?.["#text"] || "";
        optionMap.set(opt.id, name);
      }
    }

    for (const product of products) {
      if (!product.reference) continue;

      const productId = product.id;
      const basePrice = product.price;

      // Get product with tax
      const productEntry: ProductReferenceMap[string] = {
        id: productId,
        price: basePrice,
        price_ttc: product.price_ttc,
        combinations: {},
      };

      // Fetch combinations if product has any
      const combIds = product.associations?.combinations?.combination;
      if (combIds && combIds.length > 0) {
        for (const comb of combIds) {
          const combination = combinationMap.get(comb.id);

          if (combination) {
            // Get the option value name
            const optionValues =
              combination.associations?.product_option_values
                ?.product_option_value;

            if (optionValues) {
              const ovArray = Array.isArray(optionValues)
                ? optionValues
                : [optionValues];

              for (const ov of ovArray) {
                const ovData = optionValueMap.get(ov.id);

                if (ovData) {
                  // Get name
                  const optionName =
                    optionMap.get(ovData.id_attribute_group) || "";

                  if (ovData.name && optionName) {
                    productEntry.combinations![ovData.name.toLowerCase()] = {
                      id: combination.id,
                      price: combination.price,
                      name: optionName + ": " + ovData.name,
                    };
                  }
                }
              }
            }
          }
        }
      }

      map[product.reference] = productEntry;
    }

    return map;
  } catch (error) {
    console.error("Error fetching product references:", error);
    return {};
  }
}

// Create cart with products
export async function createCart(
  items: Array<{ productId: number; combinationId?: number; quantity: number }>,
  customerId: number,
  addressId: number,
  date_add_to_use: string,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(cartSchema, "");

  const cartRowsString = items
    .map((item) => {
      const productId = item.productId.toString();
      const attributeId = item.combinationId?.toString() || "";
      const quantity = item.quantity.toString();
      return `${productId},${attributeId},${quantity}`;
    })
    .join(";");

  const cartData: Record<string, string> = {
    id_currency: DEFAULT_CURRENCY_ID.toString(),
    id_lang: DEFAULT_LANGUAGE_ID.toString(),
    id_shop: "1",
    id_shop_group: "1",
    id_carrier: "0",
    id_customer: customerId.toString(),
    id_address_delivery: addressId.toString(),
    id_address_invoice: addressId.toString(),
    delivery_option: "{}",
    allow_seperated_package: "0",
    cart_rows: cartRowsString,
    date_add: date_add_to_use,
  };

  const xmlData = converter.convertRowToXML(cartData);

  try {
    const response = await fetchFromPrestashopApi<{
      cart: { id: number };
    }>("/carts", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const id = response.cart.id;

    // Update date_add and date_upd to match the original date if provided (PrestaShop API doesn't allow setting these on creation)
    if (date_add_to_use) {
      const updateData = converter.convertRowToXML({
        id: id.toString(),
        date_add: date_add_to_use,
        date_upd: date_add_to_use,
      });

      await fetchFromPrestashopApi(`/carts/${id}?ps_method=PATCH`, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: updateData,
      });
    }

    return id;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
}

// Create order
export async function createOrder(
  cartId: number,
  customerId: number,
  addressId: number,
  totalAmount: number,
  totalAmountWt: number,
  paymentMethod: string,
  languageData: LanguageData,
  date_add_to_use: string,
  initialStateId: (typeof ORDER_STATES)[keyof typeof ORDER_STATES] = ORDER_STATES.AWAITING_CASH_ON_DELIVERY,
): Promise<OrderReadXML> {
  const converter = new PrestaShopXMLConverter(orderSchema, "");

  const orderData: Record<string, string> = {
    id_address_delivery: addressId.toString(),
    id_address_invoice: addressId.toString(),
    id_cart: cartId.toString(),
    id_currency: languageData.currency_id.toString(),
    id_lang: languageData.language_id.toString(),
    id_customer: customerId.toString(),
    id_carrier: "0",
    current_state: initialStateId.toString(),
    module: "ps_cashondelivery",
    payment: paymentMethod,
    total_paid: "0",
    total_paid_real: "0",
    total_products: totalAmount.toFixed(6),
    total_products_wt: totalAmountWt.toFixed(6),
    conversion_rate: languageData.conversion_change.toString(),
    valid: "1",
    id_shop: "1",
    id_shop_group: "1",
    date_add: date_add_to_use,
  };

  const xmlData = converter.convertRowToXML(orderData);

  try {
    const response = await fetchFromPrestashopApi<{
      order: OrderReadXML;
    }>("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const orderId = response.order.id;

    // Get the order reference (PrestaShop generates it after order creation)
    const orderData = (
      await fetchFromPrestashopApi<{
        order: OrderReadXML;
      }>(`/orders/${orderId}?display=full`, {
        method: "GET",
      })
    ).order;

    console.log(
      "Created order with new data:",
      orderData,
      "Reference:",
      orderData.reference,
    );

    // Delete original payment and original state for the order as we will create them manually later to set the correct dates
    const idOrderHistory = await fetchFromPrestashopApi<{
      order_histories: {
        order_history: {
          id: number;
        };
      };
    }>(`/order_histories?filter[id_order]=${orderData.id}&display=[id]`, {
      method: "GET",
    });

    await fetchFromPrestashopApi(
      `/order_histories/${idOrderHistory.order_histories.order_history.id}`,
      {
        method: "DELETE",
      },
    );

    // Delete payment
    const idOrderPayment = await fetchFromPrestashopApi<{
      order_payments: {
        order_payment: {
          id: number;
        };
      };
    }>(
      `/order_payments?filter[order_reference]=${orderData.reference}&display=[id]`,
      { method: "GET" },
    );

    await fetchFromPrestashopApi(
      `/order_payments/${idOrderPayment.order_payments.order_payment.id}`,
      {
        method: "DELETE",
      },
    );

    // Add initial state back
    await updateOrderState(orderData.id, initialStateId, date_add_to_use);

    // Update order date_add and date_upd to match the original date (PrestaShop API doesn't allow setting these on creation)
    const updateOrderData = converter.convertRowToXML({
      id: orderData.id.toString(),
      date_add: date_add_to_use,
    });

    await fetchFromPrestashopApi(`/orders/${orderData.id}?ps_method=PATCH`, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: updateOrderData,
    });

    return orderData;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Update order state
export async function updateOrderState(
  orderId: number,
  orderStateId: number,
  date_add: string,
  additional_data: Record<string, string> = {},
): Promise<OrderHistoryXML> {
  const converter = new PrestaShopXMLConverter(orderHistorySchema, "");

  const historyData: Record<string, string> = {
    id_order: orderId.toString(),
    id_order_state: orderStateId.toString(),
    date_add,
    ...additional_data,
  };

  const xmlData = converter.convertRowToXML(historyData);

  try {
    const response = await fetchFromPrestashopApi<{
      order_history: OrderHistoryXML;
    }>("/order_histories", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const orderHistory = response.order_history;

    // Update date_add if provided
    if (date_add) {
      const updateData = converter.convertRowToXML({
        id: orderHistory.id.toString(),
        date_add: date_add,
      });

      await fetchFromPrestashopApi(
        `/order_histories/${orderHistory.id}?ps_method=PATCH`,
        {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: updateData,
        },
      );

      orderHistory.date_add = date_add;
    }

    return orderHistory;
  } catch (error) {
    console.error(`Error updating order state to ${orderStateId}:`, error);
    throw error;
  }
}

// Add payment to order
export async function addOrderPayment(
  orderId: number,
  orderReference: string,
  amount: number,
  date_add?: string,
  paymentMethod: string = "Cash On Delivery",
  currencyId: number = DEFAULT_CURRENCY_ID,
): Promise<OrderPaymentXML> {
  const converter = new PrestaShopXMLConverter(orderPaymentSchema, "");

  const transactionId = `IMP-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const paymentData: Record<string, string> = {
    order_reference: orderReference,
    id_currency: currencyId.toString(),
    amount: amount.toFixed(2),
    payment_method: paymentMethod,
    conversion_rate: "1",
    transaction_id: transactionId,
  };

  const xmlData = converter.convertRowToXML(paymentData);

  try {
    const response = await fetchFromPrestashopApi<{
      order_payment: OrderPaymentXML;
    }>("/order_payments", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    const orderPayment = response.order_payment;

    // Update date_add if provided
    if (date_add) {
      const updateData = converter.convertRowToXML({
        id: orderPayment.id.toString(),
        date_add: date_add,
      });

      await fetchFromPrestashopApi(
        `/order_payments/${orderPayment.id}?ps_method=PATCH`,
        {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: updateData,
        },
      );

      orderPayment.date_add = date_add;

      // Also update order_invoice date_add
      const converterInvoice = new PrestaShopXMLConverter(
        orderInvoiceSchema,
        "",
      );

      // Fetch invoice ID for the order
      const invoiceResponse = await fetchFromPrestashopApi<{
        order_invoices: {
          order_invoice: OrderInvoiceXML;
        };
      }>(`/order_invoices?filter[id_order]=${orderId}&display=[id]`, {
        method: "GET",
        headers: { "Content-Type": "application/xml" },
      });

      if (
        invoiceResponse.order_invoices &&
        invoiceResponse.order_invoices.order_invoice
      ) {
        const updateInvoiceData = converterInvoice.convertRowToXML({
          id: invoiceResponse.order_invoices.order_invoice.id.toString(),
          date_add: date_add,
        });

        await fetchFromPrestashopApi(
          `/order_invoices/${invoiceResponse.order_invoices.order_invoice.id}?ps_method=PATCH`,
          {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: updateInvoiceData,
          },
        );
      }
    }

    return orderPayment;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
}

// Parse the "achat" column
function parseAchatColumn(
  achat: string,
): Array<{ reference: string; quantity: number; attribute: string }> {
  if (!achat || !achat.trim()) {
    return [];
  }

  const items: Array<{
    reference: string;
    quantity: number;
    attribute: string;
  }> = [];

  try {
    // Remove outer brackets and split by "),("
    const cleanStr = achat.replace(/^\[|\]$/g, "");
    const itemStrings = cleanStr.split(/\),\(/);

    for (const itemStr of itemStrings) {
      // Clean up the string and split by semicolon
      const cleanItem = itemStr.replace(/[()""]/g, "").trim();
      const parts = cleanItem.split(";").map((p) => p.trim());

      if (parts.length >= 2) {
        items.push({
          reference: parts[0],
          quantity: parseInt(parts[1]) || 1,
          attribute: parts[2] || "",
        });
      }
    }
  } catch (error) {
    console.warn("Error parsing achat column:", achat, error);
  }

  return items;
}

// Map status string to order state and determine flow
function getOrderFlow(status: string): {
  stateId: number;
} {
  const statusLower = status.toLowerCase().trim();

  if (
    statusLower === "paiement accepté" ||
    statusLower === "paiement effectué"
  ) {
    return {
      stateId: ORDER_STATES.PAYMENT_ACCEPTED,
    };
  }

  if (statusLower === "annulé") {
    return {
      stateId: ORDER_STATES.CANCELED,
    };
  }

  if (statusLower === "erreur de paiement") {
    return {
      stateId: ORDER_STATES.PAYMENT_ERROR,
    };
  }

  // Default: awaiting payment
  return {
    stateId: ORDER_STATES.AWAITING_CASH_ON_DELIVERY,
  };
}

// Process complete order flow (shipped -> delivered -> payment)
export async function processCompleteOrderFlow(
  orderId: number,
  orderReference: string,
  totalAmount: number,
  date_add: string,
  languageData: LanguageData,
  deleteGeneratedPayments: boolean = true,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  await updateOrderState(orderId, ORDER_STATES.SHIPPED, date_add);

  await new Promise((resolve) => setTimeout(resolve, 300));
  await updateOrderState(orderId, ORDER_STATES.DELIVERED, date_add);

  // Remove from stock
  await removeStock(orderId, languageData, date_add);

  await new Promise((resolve) => setTimeout(resolve, 300));
  const orderPayment = await addOrderPayment(
    orderId,
    orderReference,
    totalAmount,
    date_add,
    "Cash On Delivery",
  );

  // This will create 2 order payments, so we need to delete those two and keep only one with the correct date
  await updateOrderState(orderId, ORDER_STATES.PAYMENT_ACCEPTED, date_add);

  if (deleteGeneratedPayments) {
    // Get all payments id for the order and filter idOrderPayment.id !== orderPayment.id
    const paymentsResponse = await fetchFromPrestashopApi<{
      order_payments: {
        order_payment: OrderPaymentXML[] | OrderPaymentXML;
      };
    }>(
      `/order_payments?filter[order_reference]=${orderReference}&display=[id]`,
      {
        method: "GET",
      },
    );

    const payments = assureArray(paymentsResponse.order_payments.order_payment);

    for (const payment of payments)
      if (payment.id !== orderPayment.id)
        await fetchFromPrestashopApi(`/order_payments/${payment.id}`, {
          method: "DELETE",
        });
  }
}

// Main import function
export async function importCustomersFromFile(
  file: File,
  delimiter: string,
  _decimalSeparator: string,
  _languageIds: number[] = [1, 2, 3],
  languageData: LanguageData,
  dateFormat: string,
): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);

  try {
    // Step 1: Fetch existing customers and products
    toast.info("Loading existing data...");
    const existingCustomers = await fetchAllCustomers();
    const productReferences = await fetchProductReferences();

    console.log("Existing customers:", Object.keys(existingCustomers).length);
    console.log("Product references:", productReferences);

    // Step 1.5: Create the guest customer if it doesn't exist (for orders without customer email)
    const guestEmail =
      import.meta.env.VITE_PRESTASHOP_API_GUEST_EMAIL || "guest@guest.com";
    if (!existingCustomers[guestEmail]) {
      const guestCustomerId = await createCustomer(
        "Guest",
        "User",
        guestEmail,
        "guestpassword",
        1, // Default group for guests
        [], // No additional groups
        {
          is_guest: "1",
        },
      );
      existingCustomers[guestEmail] = guestCustomerId;
    }

    // Step 2: Process each row
    const rows: ImportedRow[] = [];
    const combinationPriceCache = new Map<string, number>();

    for (const [index, row] of parsedRows.entries()) {
      const nom = row.nom;
      const email = row.email;
      const password = row.pwd;
      const adresse = row.adresse;
      const achat = row.achat;
      const etat = row.etat;
      const date = row.date;

      // Validate required fields
      if (!nom) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing name (nom)",
        });
        continue;
      }

      if (!email) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing email",
        });
        continue;
      }

      if (!password) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing password (pwd)",
        });
        continue;
      }

      try {
        const warnings: string[] = [];

        // Split name
        const nameParts = nom.trim().split(/\s+/);
        const firstName = nameParts[0] || nom;
        const lastName = nameParts.slice(1).join(" ") || nom;

        // Create or get customer
        let customerId: number;
        const existingCustomerId = existingCustomers[email];

        if (existingCustomerId) {
          customerId = existingCustomerId;
          console.log(`Using existing customer "${email}" (ID: ${customerId})`);
        } else {
          toast.info(`Creating customer: ${email}`);
          customerId = await createCustomer(
            firstName,
            lastName,
            email,
            password,
          );
          existingCustomers[email] = customerId;
          console.log(`Created customer "${email}" (ID: ${customerId})`);
        }

        // Create address
        const addressId = await createCustomerAddress(
          customerId,
          firstName,
          lastName,
          adresse || "Address",
        );

        // Process purchases
        if (achat) {
          const parsedItems = parseAchatColumn(achat);

          if (parsedItems.length > 0) {
            console.log(
              `Processing ${parsedItems.length} items for customer ${customerId}`,
            );

            // Resolve product references to IDs
            const cartItems: Array<{
              productId: number;
              combinationId?: number;
              quantity: number;
              price: number;
              price_ttc: number;
            }> = [];

            for (const item of parsedItems) {
              const product = productReferences[item.reference];

              if (!product) {
                warnings.push(
                  `Product reference "${item.reference}" not found`,
                );
                continue;
              }

              const cartItem: (typeof cartItems)[0] = {
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                price_ttc: product.price_ttc,
              };

              // Check if there's a combination (attribute)
              if (item.attribute && product.combinations) {
                const attrLower = item.attribute.toLowerCase();
                const combination = product.combinations[attrLower];

                if (combination) {
                  cartItem.combinationId = combination.id;

                  // Add combination price impact
                  cartItem.price += combination.price;

                  console.log(
                    `Product ${item.reference} has combination "${item.attribute}" with price impact ${combination.price}`,
                  );

                  // Check if in cache
                  if (combinationPriceCache.has(combination.id.toString())) {
                    cartItem.price_ttc = combinationPriceCache.get(
                      combination.id.toString(),
                    )!;

                    console.log(
                      `Using cached price_ttc for combination ${combination.id}: ${cartItem.price_ttc}`,
                    );
                  } else {
                    try {
                      const priceResponse = await fetchFromPrestashopApi<{
                        product: { price_ttc: number };
                      }>(
                        `/products/${product.id}?price[price_ttc][product_attribute]=${combination.id}&display=[price_ttc]`,
                        { method: "GET" },
                      );

                      console.log(
                        `Fetched price_ttc for combination ${combination.id}:`,
                        priceResponse.product.price_ttc,
                      );

                      const priceTtc = priceResponse.product.price_ttc;

                      cartItem.price_ttc = priceTtc;

                      combinationPriceCache.set(
                        combination.id.toString(),
                        priceTtc,
                      );
                    } catch {
                      console.warn(
                        `Could not fetch tax price for combination ${combination.id}`,
                      );
                      cartItem.price_ttc += combination.price; // Fallback to just adding the price impact
                    }
                  }
                } else {
                  warnings.push(
                    `Attribute "${item.attribute}" not found for product "${item.reference}". Available: ${Object.keys(product.combinations).join(", ")}`,
                  );
                }
              }

              cartItems.push(cartItem);
            }

            if (cartItems.length > 0) {
              // Calculate totals
              const totalAmount = cartItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              const totalAmountWt = cartItems.reduce(
                (sum, item) => sum + item.price_ttc * item.quantity,
                0,
              );

              const date_add = parse(date, dateFormat, new Date(), {
                in: utc,
              });
              date_add.setHours(0, 0, 0); // Set to 00:00 for consistency

              const date_add_str = date_add
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

              // Create cart
              const cartId = await createCart(
                cartItems.map((i) => ({
                  productId: i.productId,
                  combinationId: i.combinationId,
                  quantity: i.quantity,
                })),
                customerId,
                addressId,
                date_add_str,
              );

              if (etat === "") {
                // If no status then we don't create an order but keep it as a cart
                rows.push({
                  index: index + 1,
                  data: row,
                  success: true,
                  warnings: warnings.length > 0 ? warnings : undefined,
                });
                toast.success(
                  `Processed (cart created): ${cartId} for ${email}`,
                );
                continue;
              }

              // Determine order flow based on etat
              const { stateId } = getOrderFlow(etat);

              // Create order with appropriate initial state
              const order = await createOrder(
                cartId,
                customerId,
                addressId,
                totalAmount,
                totalAmountWt,
                "Paiement à la livraison",
                languageData,
                date_add_str,
              );

              console.log(
                `Created order #${order.reference} with state ${stateId}`,
              );

              // Handle order flow based on status
              switch (stateId) {
                case ORDER_STATES.CANCELED:
                  await updateOrderState(
                    order.id,
                    ORDER_STATES.CANCELED,
                    date_add_str,
                  );
                  console.log(`Order #${order.reference} canceled`);
                  break;

                case ORDER_STATES.PAYMENT_ACCEPTED:
                  await processCompleteOrderFlow(
                    order.id,
                    order.reference,
                    totalAmountWt,
                    date_add_str,
                    languageData,
                  );
                  console.log(
                    `Order #${order.reference} completed with payment`,
                  );
                  break;

                case ORDER_STATES.PAYMENT_ERROR:
                  await updateOrderState(
                    order.id,
                    ORDER_STATES.PAYMENT_ERROR,
                    date_add_str,
                  );
                  console.log(`Order #${order.reference} set to payment error`);
                  break;

                case ORDER_STATES.AWAITING_CASH_ON_DELIVERY:
                default:
                  // For awaiting payment, we ignore as the order is already created with this state and we don't want to change it
                  console.log(
                    `Order #${order.reference} created with awaiting payment state`,
                  );
                  break;
              }

              console.log(
                `Successfully processed order for customer ${customerId}`,
              );
            } else {
              warnings.push("No valid products found in achat column");
            }
          }
        }

        rows.push({
          index: index + 1,
          data: row,
          success: true,
          warnings: warnings.length > 0 ? warnings : undefined,
        });

        toast.success(`Processed: ${email}`);
      } catch (error) {
        console.error(`Error importing customer at row ${index + 1}:`, error);
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to process customer",
        });
        toast.error(`Failed: ${email}`);
      }
    }

    toast.success("Customer import completed!");

    return {
      summary: buildImportSummary("Customers", file.name, rows),
      rows,
    };
  } catch (error) {
    console.error("Error in customer import:", error);
    toast.error("Customer import failed");
    return {
      summary: {
        step: "Customers",
        fileName: file.name,
        totalRows: parsedRows.length,
        successCount: 0,
        failedCount: parsedRows.length,
        warnings: 0,
      },
      rows: parsedRows.map((row, index) => ({
        index: index + 1,
        data: row,
        success: false,
        error:
          "Failed to process customers: " +
          (error instanceof Error ? error.message : String(error)),
      })),
    };
  }
}
// Decrease stock quantities for all products in an order
async function removeStock(
  orderId: number,
  languageData: LanguageData,
  dateAdd: string,
): Promise<void> {
  // 1. Fetch order details
  const detailsResponse = await fetchFromPrestashopApi<{
    order_details: {
      order_detail?: Array<{
        id: number;
        product_id: { "#text": number };
        product_attribute_id: { "#text": number };
        product_quantity: number;
      }>;
    };
  }>(
    `/order_details?filter[id_order]=${orderId}&display=[id,product_id,product_attribute_id,product_quantity]`,
    { method: "GET" },
  );

  const details = assureArray(
    detailsResponse.order_details?.order_detail,
  ) as Array<{
    id: number;
    product_id: { "#text": number };
    product_attribute_id: { "#text": number };
    product_quantity: number;
  }>;

  if (details.length === 0) {
    console.log(
      `No order details found for order ${orderId}, skipping stock removal`,
    );
    return;
  }

  // 2. For each product in the order, find and update stock
  for (const detail of details) {
    const productId = detail.product_id["#text"];
    const attributeId = detail.product_attribute_id["#text"];
    const orderQuantity = detail.product_quantity;

    // Fetch stock_available for this product
    const stockQuery = new URLSearchParams({
      display: "[id,quantity]",
      "filter[id_product]": productId.toString(),
    });

    // If there's a specific attribute, filter by it; otherwise get default stock
    if (attributeId !== 0) {
      stockQuery.append("filter[id_product_attribute]", attributeId.toString());
    } else {
      stockQuery.append("filter[id_product_attribute]", "0");
    }

    try {
      const stockResponse = await fetchFromPrestashopApi<{
        stock_availables: {
          stock_available: Array<{
            id: number;
            quantity: number;
          }>;
        };
      }>(`/stock_availables?${stockQuery.toString()}`, { method: "GET" });

      const stocks = assureArray(
        stockResponse.stock_availables.stock_available,
      );

      if (stocks.length === 0) {
        console.warn(
          `No stock record found for product ${productId} (attribute ${attributeId})`,
        );
        continue;
      }

      const stockRecord = stocks[0];
      const stockId = stockRecord.id;
      const oldQuantity = stockRecord.quantity;

      // Use the shared updateStockQuantity to update stock and create a movement record
      await updateStockQuantity(
        stockId,
        oldQuantity,
        -orderQuantity, // negative because we're removing from stock
        languageData,
        true, // isMovement
        "Order stock removal",
        dateAdd,
      );

      console.log(
        `Stock for product ${productId} (attribute ${attributeId}): ${oldQuantity} → ${oldQuantity - orderQuantity}`,
      );
    } catch (error) {
      console.error(
        `Error updating stock for product ${productId} (attribute ${attributeId}):`,
        error,
      );
    }
  }
}
