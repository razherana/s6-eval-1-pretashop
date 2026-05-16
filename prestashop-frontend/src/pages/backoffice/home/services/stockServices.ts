// src/pages/backoffice/home/services/stockServices.ts
import type { LanguageData } from "@/contexts/LanguageContext";
import { stockAvailableSchema } from "@/schemas/stock-available";
import { stockMovementReasonSchema } from "@/schemas/stock-movement-reason";
import { stockMovementSchema } from "@/schemas/stock-movements";
import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import { assureArray } from "@/utils/xml";
import { toast } from "sonner";

const EMPLOYEE_ID_STOCK_MVT_REASON = 1; // Employee id 1 used

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
        stock_available: StockAvailable | StockAvailable[];
      };
    }>(`/stock_availables?${query.toString()}`, { method: "GET" });

    const stocks = assureArray(response.stock_availables.stock_available);

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
  oldQuantity: number,
  quantity: number,
  language: LanguageData,
  isMovement: boolean,
  name: string = "Manual adjustment",
  dateAdd: string = new Date().toISOString().slice(0, 19).replace("T", " "),
): Promise<void> {
  const converter = new PrestaShopXMLConverter(stockAvailableSchema, "");

  const languageIds = language.rawLanguages.map((lang) => lang.id);

  const newQuantity = isMovement ? oldQuantity + quantity : quantity;

  const stockData: Record<string, string> = {
    id: stockId.toString(),
    id_shop: "1",
    quantity: newQuantity.toString(),
  };

  let movementQuantity: number;

  if (isMovement) movementQuantity = quantity;
  else movementQuantity = quantity - oldQuantity;

  const xmlData = converter.convertRowToXML(stockData);

  try {
    await fetchFromPrestashopApi(
      `/stock_availables/${stockId}?ps_method=PATCH`,
      {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlData,
      },
    );

    // Add stock_movements entry
    const reasonConverter = new PrestaShopXMLConverter(
      stockMovementReasonSchema,
      "",
    );

    const sign = movementQuantity >= 0 ? "1" : "-1";

    const names: Record<string, string> = {};
    for (const langId of languageIds)
      names[`name;language_id=${langId}`] = name;

    // Stock movement reason "Manual adjustment" first
    const stockMovementReasonData: Record<string, string> = {
      sign,
      ...names,
    };

    // Create and get ID
    const reasonXml = reasonConverter.convertRowToXML(stockMovementReasonData);

    const reasonResponse = await fetchFromPrestashopApi<{
      stock_movement_reason: {
        id: number;
      };
    }>("/stock_movement_reasons", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: reasonXml,
    });

    const reasonId = reasonResponse.stock_movement_reason.id;

    // Then create stock movement
    const stockMovementData: Record<string, string> = {
      id_currency: language.currency_id.toString(),
      id_stock: stockId.toString(),
      id_stock_mvt_reason: reasonId.toString(),
      id_employee: EMPLOYEE_ID_STOCK_MVT_REASON.toString(),
      physical_quantity: Math.abs(movementQuantity).toString(),
      sign,
      price_te: "0", // No price impact for stock adjustments
      date_add: dateAdd,
    };

    // Create stock movement XML
    const movementConverter = new PrestaShopXMLConverter(
      stockMovementSchema,
      "",
    );
    const movementXml = movementConverter.convertRowToXML(stockMovementData);

    const movementResponse = await fetchFromPrestashopApi<{
      stock_mvt: {
        id: number;
      };
    }>("/stock_movements", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: movementXml,
    });

    const movementId = movementResponse.stock_mvt.id;
    console.log(
      `Created stock movement with ID ${movementId} for stock ${stockId}`,
    );

    // Update date_add
    if (movementId) {
      const updateData: Record<string, string> = {
        date_add: dateAdd,
        id: movementId.toString(),
      };
      const updateXml = movementConverter.convertRowToXML(updateData);

      await fetchFromPrestashopApi(
        `/stock_movements/${movementId}?ps_method=PATCH`,
        {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: updateXml,
        },
      );
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    toast.error("Failed to update stock");
    throw error;
  }

  toast.success(`Stock updated to ${quantity}`);
}
