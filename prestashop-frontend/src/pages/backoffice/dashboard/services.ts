// src/pages/backoffice/dashboard/services.ts
import { fetchFromPrestashopApi } from "@/utils/url";
import { format, parseISO } from "date-fns";
import type {
  LanguageField,
  OrderReadXML,
} from "@/pages/backoffice/home/types";
import { ORDER_STATES } from "@/pages/backoffice/home/types";
import { utc } from "@date-fns/utc";
import { assureArray } from "@/utils/xml";
import { fetchProducts } from "@/pages/backoffice/home/services";
import { fetchProductCombinations } from "@/pages/frontoffice/home/services";
import { fetchProductStock } from "@/pages/backoffice/home/services/stockServices";

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
  stockId: number;
  quantity: number;
}

export interface StockMovement {
  id: number;
  id_stock: number;
  sign: number;
  physical_quantity: number;
  date_add: string;
}

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
    return stateId === ORDER_STATES.PAYMENT_ACCEPTED;
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
    return stateId === ORDER_STATES.PAYMENT_ACCEPTED;
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

export async function fetchStockRowsForDashboard(): Promise<ProductStockRow[]> {
  const products = await fetchProducts(1000, 0);
  const productsWithCombinations = products.filter(
    (product) => product.associations?.combinations?.combination?.length > 0,
  );

  const rows: ProductStockRow[] = [];

  await Promise.all(
    productsWithCombinations.map(async (product) => {
      const [combinations, stockInfo] = await Promise.all([
        fetchProductCombinations(product.id),
        fetchProductStock(product.id),
      ]);

      for (const combination of combinations) {
        const stock = stockInfo.stocks.get(combination.id);
        if (stock)
          rows.push({
            productId: product.id,
            productName: product.name,
            productReference: product.reference || "",
            combinationId: combination.id,
            combinationReference: combination.reference || "",
            stockId: stock.id,
            quantity: stock.quantity,
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

    const movements = assureArray(response.stock_mvts.stock_mvt);

    return movements.map((movement) => ({
      id: movement.id,
      id_stock: movement.id_stock["#text"],
      sign: movement.sign,
      physical_quantity: movement.physical_quantity,
      date_add: movement.date_add,
    }));
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return [];
  }
}
