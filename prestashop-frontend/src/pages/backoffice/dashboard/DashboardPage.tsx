// src/pages/backoffice/dashboard/DashboardPage.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Euro,
  BarChart3,
  Star,
  RefreshCw,
  LineChart,
  Boxes,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  fetchAllOrdersForDashboard,
  calculateDashboardData,
  getAllDailyStats,
  prepareChartData,
  fetchStockRowsForDashboard,
  fetchCategoryStockRows,
  fetchStockMovements,
  fetchVirtualMovementsForProduct,
  fetchAndCalculateAllStats,
  type ProductStockRow,
  type CategoryStockRow,
  type StockMovement,
  type CategoryProfit,
} from "./services";
import type { OrderReadXML } from "@/pages/backoffice/home/types";
import { useLanguage } from "@/hooks/useLanguage";
import { getFormattedPrice, getWithLanguage } from "@/utils/lang";
import { LanguageLoadingComponent } from "@/components/ui-manual/language-loading-state";
import { SelectLanguageCurrency } from "@/components/ui-manual/select-lang";
import { utc } from "@date-fns/utc";
import { StockHistoryDialog } from "./components/StockHistoryDialog";
import { ResultsPagination } from "../home/components/import-data/ResultsPagination";
import Decimal from "decimal.js";

export function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { language } = useLanguage();
  const [stockRows, setStockRows] = useState<ProductStockRow[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [selectedStockRow, setSelectedStockRow] = useState<ProductStockRow | null>(null);
  const [isStockHistoryOpen, setIsStockHistoryOpen] = useState(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockMovementsLoading, setStockMovementsLoading] = useState(false);

  // Stock table search & pagination
  const [stockSearch, setStockSearch] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const stockPageSize = 10;
  const [categoryStockRows, setCategoryStockRows] = useState<CategoryStockRow[]>([]);

  const filteredStockRows = useMemo(() => {
    if (!stockSearch.trim()) return stockRows;
    const query = stockSearch.toLowerCase();
    return stockRows.filter((row) => {
      const productName = getWithLanguage(
        row.productName,
        language?.language_id ?? 1,
      ).toLowerCase();
      const combinationName = (row.combinationName || "").toLowerCase();
      return (
        productName.includes(query) || combinationName.includes(query)
      );
    });
  }, [stockRows, stockSearch, language]);

  const paginatedStockRows = useMemo(() => {
    const start = (stockPage - 1) * stockPageSize;
    return filteredStockRows.slice(start, start + stockPageSize);
  }, [filteredStockRows, stockPage]);

  // Total sales HT, total purchase cost, and profit stats
  const [totalSalesHt, setTotalSalesHt] = useState<number>(0);
  const [totalPurchase, setTotalPurchase] = useState<number>(0);
  const [categoryProfits, setCategoryProfits] = useState<CategoryProfit[]>([]);
  const [totalProfitTtc, setTotalProfitTtc] = useState<number>(0);
  const [totalCostFromOrders, setTotalCostFromOrders] = useState<number>(0);

  // Daily breakdown table pagination (page state only, memo defined after allDailyStats)
  const [dailyPage, setDailyPage] = useState(1);
  const dailyPageSize = 15;

  const formatCurrency = useCallback(
    (amount: number | string) => {
      return getFormattedPrice(
        amount,
        language.currency,
        language.conversion_change,
        language.locale,
      );
    },
    [language],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ordersResult = await fetchAllOrdersForDashboard();
      setOrders(ordersResult);
      setDailyPage(1);

      // Calculate all dashboard stats with a single data fetch
      const stats = await fetchAndCalculateAllStats(ordersResult);
      setTotalSalesHt(stats.totalSalesHt);
      setTotalPurchase(stats.totalPurchase);
      setCategoryProfits(stats.categoryProfits);
      setTotalProfitTtc(stats.totalProfitTtc);
      setTotalCostFromOrders(stats.totalCostFromOrders);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  // Dashboard data for charts and stats (respects date filter)
  const dashboardData = useMemo(
    () => calculateDashboardData(orders, selectedDate),
    [orders, selectedDate],
  );

  // All daily stats for the breakdown table (always all data)
  const allDailyStats = useMemo(
    () => getAllDailyStats(orders),
    [orders],
  );

  // Paginated daily stats (must be after allDailyStats declaration)
  const paginatedDailyStats = useMemo(() => {
    const start = (dailyPage - 1) * dailyPageSize;
    return allDailyStats.slice(start, start + dailyPageSize);
  }, [allDailyStats, dailyPage]);

  const chartData = useMemo(
    () => prepareChartData(dashboardData.dailyStats),
    [dashboardData],
  );

  useEffect(() => {
    if (!isStockHistoryOpen || !selectedStockRow?.stockId) return;

    (async () => {
      setStockMovementsLoading(true);
      try {
        const [physicalMovements, virtualMovements] = await Promise.all([
          fetchStockMovements(selectedStockRow.stockId),
          fetchVirtualMovementsForProduct(
            selectedStockRow.productId,
            selectedStockRow.combinationId,
            selectedDate
              ? format(selectedDate, "yyyy-MM-dd", { in: utc })
              : null,
          ),
        ]);

        console.log("Physical movements:", physicalMovements);
        console.log("Virtual movements:", virtualMovements);

        // Merge and sort by date
        const allMovements = [...physicalMovements, ...virtualMovements].sort(
          (a, b) => a.date_add.localeCompare(b.date_add),
        );
        setStockMovements(allMovements);
      } catch (err) {
        console.error("Error loading stock movements:", err);
      } finally {
        setStockMovementsLoading(false);
      }
    })();
  }, [isStockHistoryOpen, selectedStockRow?.stockId, selectedStockRow?.productId, selectedStockRow?.combinationId, selectedDate]);

  // Re-fetch stock rows when the selected date changes
  useEffect(() => {
    (async () => {
      setStockLoading(true);
      try {
        const dateStr = selectedDate
          ? format(selectedDate, "yyyy-MM-dd", { in: utc })
          : null;
        const [rows, catRows] = await Promise.all([
          fetchStockRowsForDashboard(dateStr),
          fetchCategoryStockRows(dateStr),
        ]);
        setStockRows(rows);
        setCategoryStockRows(catRows);
        setStockPage(1);
        setStockSearch("");
        setStockError(null);
      } catch (err) {
        console.error("Error loading stock data:", err);
        setStockError("Failed to load stock data");
      } finally {
        setStockLoading(false);
      }
    })();
  }, [selectedDate]);

  if (!language) {
    return <LanguageLoadingComponent />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center">
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/backoffice/home")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <SelectLanguageCurrency />
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Date Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter" className="text-sm font-medium">
                Data up to:
              </Label>
              <Input
                id="date-filter"
                type="date"
                className="w-48"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd", { in: utc }) : ""}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value ? parseISO(`${e.target.value}`, { in: utc }) : null,
                  )
                }
              />
            </div>
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                Show all data
              </Button>
            )}
          </div>
          {selectedDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Charts & stats show cumulative data up to{" "}
              {format(selectedDate, "dd MMMM yyyy", { locale: fr, in: utc })}.
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboardData.totalOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Paid orders only
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(dashboardData.grandTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total revenue (tax incl.)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(dashboardData.averageOrderValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Best Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.bestDay ? (
                <>
                  <p className="text-3xl font-bold text-amber-600">
                    {formatCurrency(dashboardData.bestDay.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(dashboardData.bestDay.date, { in: utc }), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold text-muted-foreground">-</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Total Sales (HT)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">
                {formatCurrency(totalSalesHt)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total revenue (tax excl.)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-rose-600">
                {formatCurrency(totalPurchase)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total purchase cost of bought products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Purchase (orders)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-rose-600">
                {formatCurrency(totalCostFromOrders)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cost from orders (wholesale)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Profit TTC (orders)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(totalProfitTtc)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue TTC - wholesale cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Profit TTC (stock movements)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${ Number(dashboardData.grandTotal) > totalPurchase ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(new Decimal(dashboardData.grandTotal).minus(new Decimal(totalPurchase)).toFixed(2))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue TTC - wholesale cost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cumulative Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Cumulative Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorCumulative"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "#888" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "#888" }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [typeof value === "number" ? formatCurrency(value) : "", ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      name="Chiffre d'affaires cumulé"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorCumulative)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <p>No data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Revenue Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "#888" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "#888" }}
                      tickFormatter={(value) => `${value} €`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [typeof value === "number" ? formatCurrency(value) : "", "Revenue"]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <p>No data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Table */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Stock
            </CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search..."
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
                className="w-56"
              />
              <Label htmlFor="stock-history-date" className="text-sm font-medium whitespace-nowrap">
                History up to:
              </Label>
              <Input
                id="stock-history-date"
                type="date"
                className="w-40"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd", { in: utc }) : ""}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value ? parseISO(`${e.target.value}`, { in: utc }) : null,
                  )
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : stockError ? (
              <div className="flex items-center justify-center py-8 text-destructive">
                <p>{stockError}</p>
              </div>
            ) : (
              <Tabs defaultValue="per-product">
                <TabsList className="mb-4">
                  <TabsTrigger value="per-product">Per Product</TabsTrigger>
                  <TabsTrigger value="by-category">By Category</TabsTrigger>
                </TabsList>

                <TabsContent value="per-product">
                  {filteredStockRows.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Combination</TableHead>
                            <TableHead className="text-right">Ref.</TableHead>
                            <TableHead className="text-right">Physical</TableHead>
                            <TableHead className="text-right">Reserved</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedStockRows.map((row) => (
                            <TableRow
                              key={`${row.productId}-${row.combinationId}`}
                              className={row.stockId ? "cursor-pointer" : "opacity-60"}
                              onClick={() => {
                                if (!row.stockId) return;
                                setSelectedStockRow(row);
                                setIsStockHistoryOpen(true);
                              }}
                            >
                              <TableCell className="font-medium">
                                {getWithLanguage(row.productName, language.language_id)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium whitespace-pre-line text-xs leading-relaxed">
                                    {row.combinationName}
                                  </span>
                                  {row.combinationReference && (
                                    <span className="text-xs text-muted-foreground">
                                      {row.combinationReference}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {row.productReference || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary">
                                  {row.physicalQuantity}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {row.virtualQuantity > 0 ? (
                                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                                    {row.virtualQuantity}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={row.quantity > 0 ? "default" : "destructive"}>
                                  {row.quantity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <ResultsPagination
                        currentPage={stockPage}
                        totalPages={Math.ceil(filteredStockRows.length / stockPageSize)}
                        startIndex={(stockPage - 1) * stockPageSize}
                        endIndex={Math.min(stockPage * stockPageSize, filteredStockRows.length)}
                        total={filteredStockRows.length}
                        onPrevious={() => setStockPage((p) => Math.max(1, p - 1))}
                        onNext={() => setStockPage((p) => Math.min(Math.ceil(filteredStockRows.length / stockPageSize), p + 1))}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <p>No product combinations found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="by-category">
                  {categoryStockRows.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Physical</TableHead>
                          <TableHead className="text-right">Reserved</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryStockRows.map((row) => (
                          <TableRow key={row.categoryId}>
                            <TableCell className="font-medium">
                              {row.categoryName}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {row.physicalQuantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {row.virtualQuantity > 0 ? (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  {row.virtualQuantity}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={row.quantity > 0 ? "default" : "destructive"}>
                                {row.quantity}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <p>No category stock data available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Daily Breakdown Table - Always shows all data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Breakdown
              <Badge variant="secondary" className="ml-2">
                All time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allDailyStats.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Daily Revenue</TableHead>
                      <TableHead className="text-right">Cumulative</TableHead>
                      <TableHead className="text-right">Avg Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDailyStats.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {format(parseISO(day.date, { in: utc }), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{day.orderCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(day.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(day.cumulativeAmount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(day.totalAmount / day.orderCount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Grand Total Row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell className="text-right">
                        <Badge>
                          {allDailyStats.reduce((sum, d) => sum + d.orderCount, 0)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          allDailyStats.reduce((sum, d) => sum + d.totalAmount, 0),
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          allDailyStats.reduce((sum, d) => sum + d.totalAmount, 0),
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          allDailyStats.reduce((sum, d) => sum + d.totalAmount, 0) /
                          allDailyStats.reduce((sum, d) => sum + d.orderCount, 0),
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <ResultsPagination
                  currentPage={dailyPage}
                  totalPages={Math.ceil(allDailyStats.length / dailyPageSize)}
                  startIndex={(dailyPage - 1) * dailyPageSize}
                  endIndex={Math.min(dailyPage * dailyPageSize, allDailyStats.length)}
                  total={allDailyStats.length}
                  onPrevious={() => setDailyPage((p) => Math.max(1, p - 1))}
                  onNext={() => setDailyPage((p) => Math.min(Math.ceil(allDailyStats.length / dailyPageSize), p + 1))}
                />
              </>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit by Category Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryProfits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Sales (HT)</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryProfits.map((cat) => {
                    const margin = cat.totalSales > 0
                      ? ((cat.totalProfit / cat.totalSales) * 100).toFixed(1)
                      : "-";
                    return (
                      <TableRow key={cat.categoryId}>
                        <TableCell className="font-medium">
                          {cat.categoryName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{cat.orderCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cat.totalSales)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cat.totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={cat.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(cat.totalProfit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={cat.totalProfit >= 0 ? "default" : "destructive"}>
                            {margin}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>No category profit data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <StockHistoryDialog
        open={isStockHistoryOpen}
        onOpenChange={(open) => {
          setIsStockHistoryOpen(open);
          if (!open) {
            setSelectedStockRow(null);
            setStockMovements([]);
          }
        }}
        selectedStockRow={selectedStockRow}
        stockMovements={stockMovements}
        stockMovementsLoading={stockMovementsLoading}
        language={language}
        stockHistoryDate={selectedDate}
      />
    </div>
  );
}