import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { SaleItem } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingCart, History, LayoutDashboard } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

interface SalesSummary {
  today: { count: number; total: number };
  this_month: { count: number; total: number };
  all_time: { count: number; total: number };
}

const DashboardPage = () => {
  const {
    products,
    getSalesSummary,
    sales,
    fetchSales,
    getProductSalesStats,
    getServiceSalesStats,
    loading,
    loadingSales,
  } = useData();
  const { user } = useAuth();
  const [summary, setSummary] = useState<SalesSummary>({
    today: { count: 0, total: 0 },
    this_month: { count: 0, total: 0 },
    all_time: { count: 0, total: 0 },
  });
  const [productSales, setProductSales] = useState<
    Array<{ name: string; quantity: number }>
  >([]);
  const [serviceSales, setServiceSales] = useState<
    Array<{ name: string; quantity: number }>
  >([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Helper function to safely format currency
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "0.00";
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  // Fetch sales summary and sales data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Don't load data if no user

      try {
        console.log("📊 [Dashboard] Loading sales summary...");
        const summaryData = await getSalesSummary();
        console.log("📊 [Dashboard] Received summary data:", summaryData);

        // Ensure all values are numbers
        const processedSummary = {
          today: {
            count: Number(summaryData.today?.count) || 0,
            total: Number(summaryData.today?.total) || 0,
          },
          this_month: {
            count: Number(summaryData.this_month?.count) || 0,
            total: Number(summaryData.this_month?.total) || 0,
          },
          all_time: {
            count: Number(summaryData.all_time?.count) || 0,
            total: Number(summaryData.all_time?.total) || 0,
          },
        };

        console.log("📊 [Dashboard] Processed summary:", processedSummary);
        setSummary(processedSummary);

        if (sales.length === 0) {
          await fetchSales();
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Set default values in case of error
        setSummary({
          today: { count: 0, total: 0 },
          this_month: { count: 0, total: 0 },
          all_time: { count: 0, total: 0 },
        });
      }
    };

    loadData();
  }, [getSalesSummary, fetchSales, sales.length, user]);

  // Load statistics using the optimized backend endpoints
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return; // Don't load stats if no user

      setLoadingStats(true);
      try {
        const [productStats, serviceStats] = await Promise.all([
          getProductSalesStats(),
          getServiceSalesStats(),
        ]);

        setProductSales(productStats.most_sold_products);
        setServiceSales(serviceStats.most_requested_services);
      } catch (error) {
        console.error("Error loading sales statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    // Only load stats after basic data is loaded
    if (!loading && !loadingSales && user) {
      loadStats();
    }
  }, [getProductSalesStats, getServiceSalesStats, loading, loadingSales, user]);

  // Get most sold products and services
  const mostSoldProducts = productSales.slice(0, 3);
  const mostRequestedServices = serviceSales.slice(0, 3);

  // Low stock alerts
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.low_stock_threshold
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-motoGray-dark">
          Bienvenido, {user?.name}!
        </h1>
        <p className="text-lg text-motoGray">Dashboard de Resumen</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-motoGray">
                Ventas del Día
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-motoRed" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-motoGray-dark">
                ${formatCurrency(summary.today.total)}
              </div>
              <p className="text-xs text-motoGray">
                {summary.today.count} ventas hoy
              </p>
            </CardContent>
          </Card>
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-motoGray">
                Ventas del Mes
              </CardTitle>
              <History className="h-4 w-4 text-motoRed" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-motoGray-dark">
                ${formatCurrency(summary.this_month.total)}
              </div>
              <p className="text-xs text-motoGray">
                {summary.this_month.count} ventas este mes
              </p>
            </CardContent>
          </Card>
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-motoGray">
                Ventas Totales
              </CardTitle>
              <LayoutDashboard className="h-4 w-4 text-motoRed" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-motoGray-dark">
                ${formatCurrency(summary.all_time.total)}
              </div>
              <p className="text-xs text-motoGray">
                {summary.all_time.count} ventas totales
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader>
              <CardTitle className="text-lg text-motoGray-dark">
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <p className="text-motoGray">Cargando estadísticas...</p>
              ) : mostSoldProducts.length > 0 ? (
                <ul className="space-y-2">
                  {mostSoldProducts.map((product) => (
                    <li
                      key={product.name}
                      className="flex justify-between text-motoGray"
                    >
                      <span>{product.name}</span>
                      <span className="font-medium">
                        {product.quantity} unidades
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-motoGray">
                  No hay datos de ventas de productos.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-motoWhite border-motoGray">
            <CardHeader>
              <CardTitle className="text-lg text-motoGray-dark">
                Servicios Más Solicitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <p className="text-motoGray">Cargando estadísticas...</p>
              ) : mostRequestedServices.length > 0 ? (
                <ul className="space-y-2">
                  {mostRequestedServices.map((service) => (
                    <li
                      key={service.name}
                      className="flex justify-between text-motoGray"
                    >
                      <span>{service.name}</span>
                      <span className="font-medium">
                        {service.quantity} veces
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-motoGray">
                  No hay datos de ventas de servicios.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="bg-motoWhite border-motoRed">
            <CardHeader>
              <CardTitle className="text-lg text-motoRed">
                Alertas de Inventario Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex justify-between text-motoGray"
                  >
                    <span>{product.name}</span>
                    <span className="font-medium text-motoRed">
                      Stock: {product.stock}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
