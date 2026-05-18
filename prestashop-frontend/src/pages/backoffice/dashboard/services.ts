// src/pages/backoffice/dashboard/services.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { format, parseISO } from "date-fns";
import type {
  LanguageField,
  OrderReadXML,
  CombinationDetailXML,
  ProductOptionXML,
  ProductOptionValueDetail,
  ProductReadXML,
} from "@/pages/backoffice/home/types";
import { ORDER_STATES } from "@/pages/backoffice/home/types";
import { utc } from "@date-fns/utc";
import { assureArray, type MaybeArray } from "@/utils/xml";
import { getWithLanguage } from "@/utils/lang";
import { fetchProducts, fetchCategories } from "@/pages/backoffice/home/services";
import {
  fetchProductCombinations,
  fetchAllProductOptions,
  fetchAllProductOptionValues,
} from "@/pages/frontoffice/home/services";
import {
  fetchProductStock,
  fetchStockAtDate,
} from "@/pages/backoffice/home/services/stockServices";

export interface DailyStats {
  date: string;
  orderCount: number;
  totalAmount: number;
  cumulativeAmount: number;
  orders: OrderReadXML[];
}

export interface DashboardData {
  dailyStats: DailyStats[];
  grandTotal: number;
  totalOrders: number;
  averageOrderValue: number;
  bestDay: DailyStats | null;
}

export interface ProductStockRow {
  productId: number;
  productName: LanguageField;
  productReference: string;
  combinationId: number;
  combinationReference: string;
  combinationName: string;
  stockId: number;
  /** Physical stock at the given date (from stock_movements) */
  physicalQuantity: number;
  /** Virtual/reserved stock from unpaid orders (PAYMENT_ACCEPTED) */
  virtualQuantity: number;
  /** Net available stock = physicalQuantity - virtualQuantity */
  quantity: number;
}

export interface CategoryProfit {
  categoryId: number;
  categoryName: string;
  totalProfit: number;
  totalSales: number;
  totalCost: number;
  orderCount: number;
}

export interface CategoryStockRow {
  categoryId: number;
  categoryName: string;
  physicalQuantity: number;
  virtualQuantity: number;
  quantity: number;
}

export interface StockMovement {
  id: number;
  id_stock: number;
  sign: number;
  physical_quantity: number;
  date_add: string;
  type: "physical" | "reserved";
}

export const ORDER_STATES_RESERVED = `[${ORDER_STATES.PAYMENT_ACCEPTED.toString()}|${ORDER_STATES.AWAITING_CASH_ON_DELIVERY.toString()}]`;

// Fetch all orders sorted by date
export async function fetchAllOrdersForDashboard(): Promise<OrderReadXML[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: "1000",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    return assureArray(response.orders.order).sort((a, b) =>
      a.date_add.localeCompare(b.date_add),
    );
  } catch (error) {
    console.error("Error fetching orders for dashboard:", error);
    return [];
  }
}

// Build daily stats from paid orders (always all data, no date filter)
function buildDailyStats(paidOrders: OrderReadXML[]): DailyStats[] {
  const dailyMap = new Map<string, DailyStats>();

  for (const order of paidOrders) {
    if (!order.date_add) continue;

    const orderDate = format(
      parseISO(order.date_add, { in: utc }),
      "yyyy-MM-dd",
      { in: utc },
    );

    const existing = dailyMap.get(orderDate);
    const totalPaid = order.total_paid_tax_incl ?? 0;

    if (existing) {
      existing.orderCount++;
      existing.totalAmount += totalPaid;
      existing.orders.push(order);
    } else {
      dailyMap.set(orderDate, {
        date: orderDate,
        orderCount: 1,
        totalAmount: totalPaid,
        cumulativeAmount: 0,
        orders: [order],
      });
    }
  }

  // Sort by date and calculate cumulative amounts
  const dailyStats = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  let runningTotal = 0;
  for (const day of dailyStats) {
    runningTotal += day.totalAmount;
    day.cumulativeAmount = runningTotal;
  }

  return dailyStats;
}

// Calculate dashboard data for charts and stats cards (respects date filter)
export function calculateDashboardData(
  orders: OrderReadXML[],
  selectedDate: Date | null,
): DashboardData {
  // Filter only paid orders
  const paidOrders = orders.filter((order) => {
    const stateId = order.current_state["#text"];
    return (
      stateId !== ORDER_STATES.CANCELED &&
      stateId !== ORDER_STATES.AWAITING_CASH_ON_DELIVERY
    );
  });

  // Build all daily stats first (no date filter)
  const allDailyStats = buildDailyStats(paidOrders);

  // Filter by selected date for charts and stats
  let filteredStats = allDailyStats;
  if (selectedDate) {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd", { in: utc });
    filteredStats = allDailyStats.filter((day) => day.date <= selectedDateStr);
  }

  // Recalculate cumulative for filtered data
  let runningTotal = 0;
  for (const day of filteredStats) {
    runningTotal += day.totalAmount;
    day.cumulativeAmount = runningTotal;
  }

  const grandTotal = filteredStats.reduce(
    (sum, day) => sum + day.totalAmount,
    0,
  );
  const totalOrders = filteredStats.reduce(
    (sum, day) => sum + day.orderCount,
    0,
  );
  const averageOrderValue = totalOrders > 0 ? grandTotal / totalOrders : 0;

  const bestDay =
    filteredStats.length > 0
      ? filteredStats.reduce((best, day) =>
          day.totalAmount > best.totalAmount ? day : best,
        )
      : null;

  return {
    dailyStats: filteredStats,
    grandTotal,
    totalOrders,
    averageOrderValue,
    bestDay,
  };
}

// Get all daily stats for the breakdown table (always all data)
export function getAllDailyStats(orders: OrderReadXML[]): DailyStats[] {
  const paidOrders = orders.filter((order) => {
    const stateId = order.current_state["#text"];
    return (
      stateId !== ORDER_STATES.CANCELED &&
      stateId !== ORDER_STATES.AWAITING_CASH_ON_DELIVERY
    );
  });

  return buildDailyStats(paidOrders);
}

// Prepare chart data
export function prepareChartData(dailyStats: DailyStats[]) {
  return dailyStats.map((day) => ({
    date: format(parseISO(day.date, { in: utc }), "dd/MM", { in: utc }),
    revenue: Math.round(day.totalAmount * 100) / 100,
    cumulative: Math.round(day.cumulativeAmount * 100) / 100,
    fullDate: day.date,
  }));
}

function buildCombinationName(
  combination: CombinationDetailXML,
  productOptions: Map<number, ProductOptionXML>,
  productOptionValues: Map<number, ProductOptionValueDetail>,
  languageId: number,
): string {
  const optionValues =
    combination.associations?.product_option_values?.product_option_value;
  if (!optionValues) return `Variant #${combination.id}`;

  const optionValuesArray = Array.isArray(optionValues)
    ? optionValues
    : [optionValues];

  const parts: string[] = [];
  for (const ov of optionValuesArray) {
    const detail = productOptionValues.get(ov.id);
    if (!detail) {
      parts.push(`Option #${ov.id}`);
      continue;
    }

    const optionGroup = productOptions.get(
      typeof detail.id_attribute_group === "object"
        ? detail.id_attribute_group["#text"]
        : detail.id_attribute_group,
    );

    if (optionGroup) {
      parts.push(
        `${getWithLanguage(optionGroup.name, languageId)}: ${getWithLanguage(detail.name, languageId)}`,
      );
    } else {
      parts.push(getWithLanguage(detail.name, languageId));
    }
  }
  return parts.join("\n");
}

/**
 * Fetch reserved quantities from PAYMENT_ACCEPTED orders.
 * Returns a Map keyed by "productId_combinationId" -> reserved quantity.
 */
export async function fetchReservedQuantities(
  dateMax: string | null = null,
): Promise<Map<string, number>> {
  const reservedMap = new Map<string, number>();

  const query = new URLSearchParams({
    display: "full",
    limit: "1000",
    "filter[current_state]": ORDER_STATES_RESERVED,
  });

  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    const orders = assureArray(response.orders.order);

    for (const order of orders) {
      // Apply date filter if set
      if (dateMax && order.date_add > `${dateMax} 23:59:59`) continue;

      const detailsQuery = new URLSearchParams({
        display: "[id,product_id,product_attribute_id,product_quantity]",
        "filter[id_order]": order.id.toString(),
      });

      try {
        const detailsResponse = await fetchFromPrestashopApi<{
          order_details: {
            order_detail: MaybeArray<{
              id: number;
              product_id: { "#text": number };
              product_attribute_id: { "#text": number };
              product_quantity: number;
            }>;
          };
        }>(`/order_details?${detailsQuery.toString()}`, { method: "GET" });

        const details = assureArray(
          detailsResponse.order_details?.order_detail,
        );

        for (const detail of details) {
          const key = `${detail.product_id["#text"]}_${detail.product_attribute_id["#text"]}`;
          reservedMap.set(
            key,
            (reservedMap.get(key) || 0) + detail.product_quantity,
          );
        }
      } catch (err) {
        console.warn(
          `Could not fetch order details for order ${order.id}:`,
          err,
        );
      }
    }
  } catch (error) {
    console.error("Error fetching reserved quantities:", error);
  }

  return reservedMap;
}

export async function fetchStockRowsForDashboard(
  dateMax: string | null = null,
): Promise<ProductStockRow[]> {
  const products = await fetchProducts(1000, 0);

  // Fetch all product options and option values to build combination names
  const [allOptions, allOptionValues] = await Promise.all([
    fetchAllProductOptions(),
    fetchAllProductOptionValues(),
  ]);

  const productOptionsMap = new Map<number, ProductOptionXML>();
  allOptions.forEach((opt: ProductOptionXML) =>
    productOptionsMap.set(opt.id, opt),
  );

  const optionValuesMap = new Map<number, ProductOptionValueDetail>();
  allOptionValues.forEach((val: ProductOptionValueDetail) =>
    optionValuesMap.set(val.id, val),
  );

  // Fetch reserved (virtual) quantities from PAYMENT_ACCEPTED orders
  const reservedMap = await fetchReservedQuantities(dateMax);

  const rows: ProductStockRow[] = [];

  await Promise.all(
    products.map(async (product) => {
      const stockInfo = await fetchProductStock(product.id);
      const combinations = assureArray(
        product.associations?.combinations?.combination,
      )?.length
        ? await fetchProductCombinations(product.id)
        : [];

      if (combinations.length > 0) {
        // Products with combinations
        for (const combination of combinations) {
          const stock = stockInfo.stocks.get(combination.id);
          if (stock) {
            const physicalQty = await fetchStockAtDate(
              stock.id,
              stock.quantity,
              dateMax,
            );
            const key = `${product.id}_${combination.id}`;
            const virtualQty = reservedMap.get(key) || 0;
            rows.push({
              productId: product.id,
              productName: product.name,
              productReference: product.reference || "",
              combinationId: combination.id,
              combinationReference: combination.reference || "",
              combinationName: buildCombinationName(
                combination,
                productOptionsMap,
                optionValuesMap,
                1,
              ),
              stockId: stock.id,
              physicalQuantity: physicalQty,
              virtualQuantity: virtualQty,
              quantity: Math.max(0, physicalQty - virtualQty),
            });
          }
        }
      } else if (stockInfo.defaultStock) {
        // Simple products (no combinations)
        const stock = stockInfo.defaultStock;
        const physicalQty = await fetchStockAtDate(
          stock.id,
          stock.quantity,
          dateMax,
        );
        const key = `${product.id}_0`;
        const virtualQty = reservedMap.get(key) || 0;
        rows.push({
          productId: product.id,
          productName: product.name,
          productReference: product.reference || "",
          combinationId: 0,
          combinationReference: "",
          combinationName: "-",
          stockId: stock.id,
          physicalQuantity: physicalQty,
          virtualQuantity: virtualQty,
          quantity: Math.max(0, physicalQty - virtualQty),
        });
      }
    }),
  );

  return rows.sort(
    (a, b) => a.productId - b.productId || a.combinationId - b.combinationId,
  );
}

export async function fetchStockMovements(
  stockId: number,
): Promise<StockMovement[]> {
  const query = new URLSearchParams({
    display: "full",
    limit: "1000",
    "filter[id_stock]": stockId.toString(),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      stock_mvts: {
        stock_mvt: {
          id: number;
          id_stock: { "#text": number };
          sign: number;
          physical_quantity: number;
          date_add: string;
        }[];
      };
    }>(`/stock_movements?${query.toString()}`, { method: "GET" });

    const movements = assureArray(response.stock_mvts?.stock_mvt);

    return movements.map((movement) => ({
      id: movement.id,
      id_stock: movement.id_stock["#text"],
      sign: movement.sign,
      physical_quantity: movement.physical_quantity,
      date_add: movement.date_add,
      type: "physical" as const,
    }));
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return [];
  }
}

/**
 * Fetch stock rows aggregated by category, respecting the date filter.
 */
export async function fetchCategoryStockRows(
  dateMax: string | null = null,
): Promise<CategoryStockRow[]> {
  // Fetch products, categories, and stock rows in parallel
  const [products, categories, stockRows] = await Promise.all([
    fetchProducts(1000, 0),
    fetchCategories(100, 0),
    fetchStockRowsForDashboard(dateMax),
  ]);

  // Build product -> categoryIds map
  const productCategoryMap = new Map<number, number[]>();
  for (const product of products) {
    const assoc = product as ProductReadXML & {
      associations: {
        categories?: { category?: MaybeArray<{ id: number }> };
      };
    };
    const cats = assureArray(
      assoc.associations?.categories?.category,
    );
    productCategoryMap.set(
      product.id,
      cats
        .filter((c): c is NonNullable<typeof c> => c != null)
        .map((c) => c.id),
    );
  }

  // Build category name map
  const categoryNameMap = new Map<number, string>();
  for (const cat of categories) {
    const name =
      cat.name?.language?.[0]?.["#text"] || `Category #${cat.id}`;
    categoryNameMap.set(cat.id, name);
  }

  // Aggregate stock rows by category
  const categoryMap = new Map<
    number,
    { physical: number; virtual: number; available: number }
  >();

  for (const row of stockRows) {
    const catIds = productCategoryMap.get(row.productId) || [];
    if (catIds.length === 0) continue;

    for (const catId of catIds) {
      const entry = categoryMap.get(catId) || {
        physical: 0,
        virtual: 0,
        available: 0,
      };
      entry.physical += row.physicalQuantity;
      entry.virtual += row.virtualQuantity;
      entry.available += row.quantity;
      categoryMap.set(catId, entry);
    }
  }

  // Build result sorted by category name
  const results: CategoryStockRow[] = [];
  for (const [catId, data] of categoryMap) {
    results.push({
      categoryId: catId,
      categoryName: categoryNameMap.get(catId) || `Category #${catId}`,
      physicalQuantity: data.physical,
      virtualQuantity: data.virtual,
      quantity: data.available,
    });
  }

  return results.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

/**
 * Fetch virtual (reserved) movements from PAYMENT_ACCEPTED orders
 * for a specific product + combination.
 */
export async function fetchVirtualMovementsForProduct(
  productId: number,
  combinationId: number,
  dateMax: string | null = null,
): Promise<StockMovement[]> {
  const virtualMovements: StockMovement[] = [];

  const query = new URLSearchParams({
    display: "full",
    limit: "1000",
    "filter[current_state]": ORDER_STATES_RESERVED,
  });

  try {
    const response = await fetchFromPrestashopApi<{
      orders: {
        order: OrderReadXML | OrderReadXML[];
      };
    }>(`/orders?${query.toString()}`, { method: "GET" });

    const orders = assureArray(response.orders.order);

    for (const order of orders) {
      if (dateMax && order.date_add > `${dateMax} 23:59:59`) continue;

      try {
        const details = assureArray(order.associations.order_rows?.order_row);

        // Filter to exact combination match
        const filtered = details.filter(
          (d) =>
            d.product_id["#text"] === productId &&
            d.product_attribute_id === combinationId,
        );

        if (filtered.length > 0) {
          console.log(
            `Order ${order.id} has ${filtered.length} matching details for product ${productId} and combination ${combinationId}`,
            order,
          );
        }

        for (const detail of filtered) {
          virtualMovements.push({
            id: -detail.id, // negative id to avoid collision with physical movements
            id_stock: 0,
            sign: -1,
            physical_quantity: detail.product_quantity,
            date_add: order.date_add,
            type: "reserved",
          });
        }
      } catch (err) {
        console.warn(
          `Could not fetch order details for order ${order.id}:`,
          err,
        );
      }
    }
  } catch (error) {
    console.error("Error fetching virtual movements:", error);
  }

  return virtualMovements;
}

/**
 * Calculate total sales excluding tax by summing order rows.
 * For base products (combinationId=0): uses product.price (HT).
 * For combinations: uses product.price + combination.price (HT).
 */
export async function calculateTotalSalesHt(
  orders: OrderReadXML[],
  products: ProductReadXML[],
  combinationCache?: Map<number, CombinationDetailXML[]>,
): Promise<number> {
  // Build a price map: key = "${productId}_${combinationId}" -> price HT
  const priceMap = new Map<string, number>();
  const cache = combinationCache ?? new Map();

  for (const product of products) {
      // Base product price (HT)
      const basePrice = product.price || 0;
      priceMap.set(`${product.id}_0`, basePrice);

      // Fetch combinations for this product
      const combos = assureArray(
        product.associations?.combinations?.combination,
      )?.length
        ? await fetchProductCombinations(product.id, cache, false)
        : [];

      for (const combo of combos) {
        // Combination price is the impact (added to or subtracted from base price)
        const comboImpact = combo.price || 0;
        priceMap.set(`${product.id}_${combo.id}`, basePrice + comboImpact);
      }
    }

  // Sum up order rows using the price map
  let totalHt = 0;

  for (const order of orders) {
    const stateId = order.current_state["#text"];
    // Skip cancelled and unpaid orders
    if (
      stateId === ORDER_STATES.CANCELED ||
      stateId === ORDER_STATES.AWAITING_CASH_ON_DELIVERY
    )
      continue;

    const rows = assureArray(order.associations?.order_rows?.order_row);
    for (const row of rows) {
      const productId = row.product_id["#text"];
      const combinationId = row.product_attribute_id || 0;
      const quantity = row.product_quantity || 0;
      const key = `${productId}_${combinationId}`;
      const unitPriceHt = priceMap.get(key) ?? 0;
      totalHt += unitPriceHt * quantity;
    }
  }

  return totalHt;
}

/**
 * Calculate total purchase cost from stock movements (incoming stock).
 * Uses pre-fetched wholesale price map, stock-to-product map, and movements.
 */
export function calculateTotalPurchaseCost(
  wholesaleMap: Map<number, number>,
  stockToProduct: Map<number, number>,
  stockMovements: Array<{ id_stock: number; physical_quantity: number }>,
): number {
  let totalPurchase = 0;

  for (const movement of stockMovements) {
    const productId = stockToProduct.get(movement.id_stock);
    if (productId === undefined) continue;
    const wholesalePrice = wholesaleMap.get(productId) ?? 0;
    totalPurchase += wholesalePrice * movement.physical_quantity;
  }

  return totalPurchase;
}

/**
 * Calculate profit by category.
 * For each order row: profit = (sales_price_ht - wholesale_price) × quantity.
 * Sales price HT uses product.price + combination.price impact.
 * Wholesale price comes from product.wholesale_price.
 */
export async function calculateProfitByCategory(
  orders: OrderReadXML[],
  categoryNameMap: Map<number, string>,
  products: ProductReadXML[],
  combinationCache?: Map<number, CombinationDetailXML[]>,
): Promise<CategoryProfit[]> {
  // Build maps from pre-fetched products
  const productCategoryMap = new Map<number, number[]>();
  const wholesaleMap = new Map<number, number>();
  const salesPriceMap = new Map<string, number>();
  const cache = combinationCache ?? new Map();

  for (const product of products) {
      // Categories
      const assoc = product as ProductReadXML & {
        associations: {
          categories?: { category?: MaybeArray<{ id: number }> };
        };
      };
      const cats = assureArray(
        assoc.associations?.categories?.category,
      );
      productCategoryMap.set(
        product.id,
        cats.filter((c): c is NonNullable<typeof c> => c != null).map((c) => c.id),
      );

      // Wholesale price
      if (
        product.wholesale_price !== undefined &&
        product.wholesale_price !== null
      ) {
        wholesaleMap.set(product.id, Number(product.wholesale_price));
      }

      // Sales price HT (base product)
      const basePrice = product.price || 0;
      salesPriceMap.set(`${product.id}_0`, basePrice);

      // Combinations
      const combos = assureArray(
        product.associations?.combinations?.combination,
      )?.length
        ? await fetchProductCombinations(product.id, cache, false)
        : [];

      for (const combo of combos) {
        const comboImpact = combo.price || 0;
        salesPriceMap.set(
          `${product.id}_${combo.id}`,
          basePrice + comboImpact,
        );
      }
    }

  // 3. Aggregate profit by category from orders
  const profitMap = new Map<
    number,
    { totalSales: number; totalCost: number; orderCount: number }
  >();

  for (const order of orders) {
    const stateId = order.current_state["#text"];
    if (
      stateId === ORDER_STATES.CANCELED ||
      stateId === ORDER_STATES.AWAITING_CASH_ON_DELIVERY
    )
      continue;

    const rows = assureArray(order.associations?.order_rows?.order_row);
    const seenCategories = new Set<number>();

    for (const row of rows) {
      const productId = row.product_id["#text"];
      const combinationId = row.product_attribute_id || 0;
      const quantity = row.product_quantity || 0;

      const categoryIds = productCategoryMap.get(productId) || [];
      if (categoryIds.length === 0) continue;

      const salePrice =
        salesPriceMap.get(`${productId}_${combinationId}`) ?? 0;
      const wholesalePrice = wholesaleMap.get(productId) ?? 0;
      for (const catId of categoryIds) {
        const entry = profitMap.get(catId) || {
          totalSales: 0,
          totalCost: 0,
          orderCount: 0,
        };
        entry.totalSales += salePrice * quantity;
        entry.totalCost += wholesalePrice * quantity;
        if (!seenCategories.has(catId)) {
          seenCategories.add(catId);
          entry.orderCount++;
        }
        profitMap.set(catId, entry);
      }
    }
  }

  // 4. Build result sorted by profit descending
  const results: CategoryProfit[] = [];
  for (const [catId, data] of profitMap) {
    results.push({
      categoryId: catId,
      categoryName: categoryNameMap.get(catId) || `Category #${catId}`,
      totalProfit: data.totalSales - data.totalCost,
      totalSales: data.totalSales,
      totalCost: data.totalCost,
      orderCount: data.orderCount,
    });
  }

  return results.sort((a, b) => b.totalProfit - a.totalProfit);
}

/**
 * Unified function that fetches all data once and computes all dashboard stats.
 */
export async function fetchAndCalculateAllStats(
  orders: OrderReadXML[],
): Promise<{
  totalSalesHt: number;
  totalPurchase: number;
  categoryProfits: CategoryProfit[];
}> {
  // Fetch all shared data in parallel
  const [
    products,
    categories,
    stockAvailablesResponse,
    stockMovementsResponse,
  ] = await Promise.all([
    fetchProducts(1000, 0),
    fetchCategories(100, 0),
    fetchFromPrestashopApi<{
      stock_availables: {
        stock_available: Array<{
          id: number;
          id_product: { "#text": number };
        }>;
      };
    }>("/stock_availables?display=[id,id_product]&limit=10000", {
      method: "GET",
    }),
    fetchFromPrestashopApi<{
      stock_mvts: {
        stock_mvt: MaybeArray<{
          id: number;
          id_stock: { "#text": number };
          sign: number;
          physical_quantity: number;
        }>;
      };
    }>("/stock_movements?display=full&limit=10000&filter[sign]=1", {
      method: "GET",
    }),
  ]);

  // Build shared maps
  const wholesaleMap = new Map<number, number>();
  for (const product of products) {
    const ws = product.wholesale_price;
    if (ws !== undefined && ws !== null && !isNaN(Number(ws))) {
      wholesaleMap.set(product.id, Number(ws));
    }
  }

  const stockToProduct = new Map<number, number>();
  const stocks = assureArray(
    stockAvailablesResponse.stock_availables?.stock_available,
  );
  for (const stock of stocks) 
    stockToProduct.set(stock.id, stock.id_product["#text"]);

  const stockMovements = assureArray(
    stockMovementsResponse.stock_mvts?.stock_mvt,
  )
    .filter((m) => m.sign === 1)
    .map((m) => ({
      id_stock: m.id_stock["#text"],
      physical_quantity: m.physical_quantity,
    }));

  const categoryNameMap = new Map<number, string>();
  for (const cat of categories) {
    const name =
      cat.name?.language?.[0]?.["#text"] || `Category #${cat.id}`;
    categoryNameMap.set(cat.id, name);
  }

  // Shared combination cache for all calls that need combinations
  const combinationCache = new Map<number, CombinationDetailXML[]>();

  // Compute all stats
  const [totalSalesHt, categoryProfits] = await Promise.all([
    calculateTotalSalesHt(orders, products, combinationCache),
    calculateProfitByCategory(
      orders,
      categoryNameMap,
      products,
      combinationCache,
    ),
  ]);

  const totalPurchase = calculateTotalPurchaseCost(
    wholesaleMap,
    stockToProduct,
    stockMovements,
  );

  return { totalSalesHt, totalPurchase, categoryProfits };
}

