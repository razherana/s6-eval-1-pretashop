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
} from "lucide-react";
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
} from "./services";
import type { OrderReadXML } from "@/pages/backoffice/home/types";
import { useLanguage } from "@/hooks/useLanguage";
import { getFormattedPrice } from "@/utils/lang";
import { LanguageLoadingComponent } from "@/components/ui-manual/language-loading-state";
import { SelectLanguageCurrency } from "@/components/ui-manual/select-lang";
import { utc } from "@date-fns/utc";

export function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { language } = useLanguage();

  const formatCurrency = useCallback(
    (amount: number) => {
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
    try {
      setLoading(true);
      setError(null);
      const allOrders = await fetchAllOrdersForDashboard();
      setOrders(allOrders);
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

  const chartData = useMemo(
    () => prepareChartData(dashboardData.dailyStats),
    [dashboardData],
  );

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
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
        {/* <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter" className="text-sm font-medium">
                Data up to:
              </Label>
              <Input
                id="date-filter"
                type="date"
                className="w-48"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                      ? new Date(e.target.value + "T00:00:00")
                      : null,
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
              {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
            </p>
          )}
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                      formatter={(value: number) => [formatCurrency(value), ""]}
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
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
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
                  {allDailyStats.map((day) => (
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
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}