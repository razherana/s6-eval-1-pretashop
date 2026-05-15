// src/pages/backoffice/home/services/stockServices.ts
import { stockAvailableSchema } from "@/schemas/stock-available";
import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { assureArray } from "@/utils/xml";
import { toast } from "sonner";

export interface StockAvailable {
  id: number;
  id_product: { "#text": number };
  id_product_attribute: { "#text": number } | number;
  id_shop: { "#text": number };
  quantity: number;
  depends_on_stock: number;
  out_of_stock: number;
}

export interface ProductStockInfo {
  productId: number;
  // Map of id_product_attribute -> stock info
  stocks: Map<number, StockAvailable>;
  defaultStock: StockAvailable | null; // id_product_attribute = 0
}

// Fetch stock availables for a product
export async function fetchProductStock(
  productId: number,
): Promise<ProductStockInfo> {
  const query = new URLSearchParams({
    display: "full",
    "filter[id_product]": productId.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      stock_availables: {
        stock_available?: StockAvailable | StockAvailable[];
      };
    }>(`/stock_availables?${query.toString()}`, { method: "GET" });

    const stocks = assureArray(response.stock_availables?.stock_available);

    const stocksMap = new Map<number, StockAvailable>();
    let defaultStock: StockAvailable | null = null;

    for (const stock of stocks) {
      const attributeId =
        typeof stock.id_product_attribute === "object"
          ? stock.id_product_attribute["#text"]
          : stock.id_product_attribute;

      if (attributeId === 0) defaultStock = stock;
      else stocksMap.set(attributeId, stock);
    }

    return {
      productId,
      stocks: stocksMap,
      defaultStock,
    };
  } catch (error) {
    console.error(`Error fetching stock for product ${productId}:`, error);
    return {
      productId,
      stocks: new Map(),
      defaultStock: null,
    };
  }
}

// Update stock quantity
export async function updateStockQuantity(
  stockId: number,
  quantity: number,
): Promise<void> {
  const converter = new PrestaShopXMLConverter(stockAvailableSchema, "");

  const stockData: Record<string, string> = {
    id: stockId.toString(),
    id_shop: "1",
    quantity: quantity.toString(),
  };

  const xmlData = converter.convertRowToXML(stockData);

  try {
    await fetchFromPrestashopApi(`/stock_availables/${stockId}?ps_method=PATCH`, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    toast.success(`Stock updated to ${quantity}`);
  } catch (error) {
    console.error("Error updating stock:", error);
    toast.error("Failed to update stock");
    throw error;
  }
}
