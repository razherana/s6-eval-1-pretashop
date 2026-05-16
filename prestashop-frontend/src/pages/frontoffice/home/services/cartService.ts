// src/pages/frontoffice/home/services/cartService.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { cartSchema } from "@/schemas/cart";
import type { CartItem } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { ProductReadXML } from "@/pages/backoffice/home/types";

export interface UserCart {
  id: number;
  id_customer?: { "#text": string };
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

// Get all cart IDs that are already converted to orders
export async function getOrderedCartIds(): Promise<Set<number>> {
  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order?: Array<{
          id_cart: string | { "#text": string };
        }>;
      };
    }>("/orders?display=[id_cart]&limit=1000", { method: "GET" });

    const orders = Array.isArray(response.orders?.order)
      ? response.orders.order
      : response.orders?.order
        ? [response.orders.order]
        : [];

    const cartIds = new Set<number>();
    for (const order of orders) {
      const cartId =
        typeof order.id_cart === "object"
          ? parseInt(order.id_cart["#text"])
          : parseInt(order.id_cart);
      cartIds.add(cartId);
    }

    return cartIds;
  } catch (error) {
    console.error("Error fetching ordered cart IDs:", error);
    return new Set();
  }
}

// Get all carts for a customer
export async function getCustomerCarts(
  customerId: number,
): Promise<UserCart[]> {
  const query = new URLSearchParams({
    display: "full",
    "filter[id_customer]": customerId.toString(),
    sort: "id_DESC",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      carts: {
        cart?: UserCart | UserCart[];
      };
    }>(`/carts?${query.toString()}`, { method: "GET" });

    const carts = response.carts?.cart || [];
    return Array.isArray(carts) ? carts : [carts];
  } catch (error) {
    console.error("Error fetching customer carts:", error);
    return [];
  }
}

// Get carts that don't have orders (saved carts)
export async function getSavedCarts(customerId: number): Promise<UserCart[]> {
  const [carts, orderedCartIds] = await Promise.all([
    getCustomerCarts(customerId),
    getOrderedCartIds(),
  ]);

  // Filter out carts that have been converted to orders
  return carts.filter((cart) => !orderedCartIds.has(cart.id));
}

// Convert cart rows to CartItem format
export async function cartToCartItems(cart: UserCart): Promise<CartItem[]> {
  const rows = cart.associations?.cart_rows?.cart_row;
  if (!rows) return [];

  const rowsArray = Array.isArray(rows) ? rows : [rows];
  const resultRowsArray: CartItem[] = [];

  for (const row of rowsArray) {
    const productId = row.id_product["#text"];

    const quantity = row.quantity;

    const combinationId = row.id_product_attribute["#text"];

    if (!productId || !quantity) continue;

    try {
      // Get product data
      const productResponse = await fetchFromPrestashopApi<{
        product: ProductReadXML;
      }>(`/products/${productId}?display=full&price[price_ttc][use_tax]=1`, {
        method: "GET",
      });

      const product = productResponse.product;

      // Get price with tax for combination
      let price = product.price_ttc || product.price;
      if (combinationId && combinationId !== 0) {
        try {
          const priceResponse = await fetchFromPrestashopApi<{
            product: { price_ttc: number };
          }>(
            `/products/${productId}?price[price_ttc][product_attribute]=${combinationId}&price[price_ttc][use_tax]=1`,
            { method: "GET" },
          );
          price = priceResponse.product?.price_ttc || price;
        } catch {
          console.warn(
            `Could not fetch combination price for product ${productId}`,
          );
        }
      }

      // Get combination reference
      let combinationReference: string | undefined;
      if (combinationId && combinationId !== 0) {
        try {
          const combResponse = await fetchFromPrestashopApi<{
            combination: { id: number; reference: string };
          }>(`/combinations/${combinationId}?display=[id,reference]`, {
            method: "GET",
          });
          combinationReference = combResponse.combination?.reference;
        } catch {
          console.warn(`Could not fetch combination ${combinationId}`);
        }
      }

      // Get first image
      const images = product.associations?.images?.image;
      const firstImage = Array.isArray(images) ? images[0] : images;

      resultRowsArray.push({
        productId,
        combinationId: combinationId !== 0 ? combinationId : undefined,
        quantity,
        name: product.name?.language?.[0]?.["#text"] || `Product #${productId}`,
        price,
        reference: product.reference || "",
        image: firstImage?.["@_xlink:href"] || undefined,
        combinationReference,
      });
    } catch (error) {
      console.error(`Error loading product ${productId}:`, error);
    }
  }

  return resultRowsArray;
}

function buildCartRowsString(cartItems: CartItem[]): string {
  return cartItems
    .map((item) => {
      const productId = item.productId.toString();
      const attributeId = item.combinationId?.toString() || "";
      const quantity = item.quantity.toString();
      return `${productId},${attributeId},${quantity}`;
    })
    .join(";");
}

// Save current cart (create new cart without converting to order)
export async function saveCart(
  cartItems: CartItem[],
  customerId: number,
  currencyId: number = 1,
  languageId: number = 1,
  options?: { showToast?: boolean },
): Promise<number> {
  const converter = new PrestaShopXMLConverter(cartSchema, "");

  const cartRowsString = buildCartRowsString(cartItems);

  const cartData: Record<string, string> = {
    id_currency: currencyId.toString(),
    id_lang: languageId.toString(),
    id_shop: "1",
    id_shop_group: "1",
    id_carrier: "0",
    delivery_option: "{}",
    allow_seperated_package: "0",
    id_customer: customerId.toString(),
    cart_rows: cartRowsString,
  };

  const xmlData = converter.convertRowToXML(cartData);
  console.log("Save Cart XML:", xmlData);

  try {
    const response = await fetchFromPrestashopApi<{
      cart: { id: number };
    }>("/carts", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    if (options?.showToast !== false) {
      toast.success("Cart saved successfully!");
    }
    return response.cart.id;
  } catch (error) {
    console.error("Error saving cart:", error);
    if (options?.showToast !== false) {
      toast.error("Failed to save cart");
    }
    throw error;
  }
}

export async function updateCart(
  cartId: number,
  cartItems: CartItem[],
  customerId: number,
  currencyId: number = 1,
  languageId: number = 1,
): Promise<void> {
  const converter = new PrestaShopXMLConverter(cartSchema, "");
  const cartRowsString = buildCartRowsString(cartItems);

  const cartData: Record<string, string> = {
    id: cartId.toString(),
    id_currency: currencyId.toString(),
    id_lang: languageId.toString(),
    id_shop: "1",
    id_shop_group: "1",
    id_carrier: "0",
    delivery_option: "{}",
    allow_seperated_package: "0",
    id_customer: customerId.toString(),
    cart_rows: cartRowsString,
  };

  const xmlData = converter.convertRowToXML(cartData);

  try {
    await fetchFromPrestashopApi(`/carts/${cartId}?ps_method=PATCH`, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

export async function deleteCart(cartId: number): Promise<void> {
  try {
    await fetchFromPrestashopApi(`/carts/${cartId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting cart:", error);
    throw error;
  }
}
