import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Import Spanish locale
import { ShoppingCart, History, LayoutDashboard } from "lucide-react"; // Import missing icons

const DashboardPage = () => {
  const { sales, products, services } = useData();
  const { user } = useAuth();

  // Calculate total sales for today
  const today = format(new Date(), "yyyy-MM-dd");
  const salesToday = sales.filter(sale => format(new Date(sale.date), "yyyy-MM-dd") === today);
  const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate total sales for the week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const salesLastWeek = sales.filter(sale => new Date(sale.date) >= oneWeekAgo);
  const totalSalesLastWeek = salesLastWeek.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate total sales for the month (current month)
  const currentMonth = format(new Date(), "yyyy-MM");
  const salesThisMonth = sales.filter(sale => format(new Date(sale.date), "yyyy-MM") === currentMonth);
  const totalSalesThisMonth = salesThisMonth.reduce((sum, sale) => sum + sale.total, 0);

  // Most sold products (simple count for now)
  const productSalesCount: { [key: string]: number } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.type === "product") {
        productSalesCount[item.name] = (productSalesCount[item.name] || 0) + item.quantity;
      }
    });
  });
  const sortedProducts = Object.entries(productSalesCount).sort(([, a], [, b]) => b - a);
  const mostSoldProducts = sortedProducts.slice(0, 3);

  // Most requested services (simple count for now)
  const serviceSalesCount: { [key: string]: number } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.type === "service") {
        serviceSalesCount[item.name] = (serviceSalesCount[item.name] || 0) + item.quantity;
      }
    });
  });
  const sortedServices = Object.entries(serviceSalesCount).sort(([, a], [, b]) => b - a);
  const mostRequestedServices = sortedServices.slice(0, 3);

  // Low stock alerts
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">
        Bienvenido, {user?.name}!
      </h1>
      <p className="text-lg text-motoGray">Dashboard de Resumen</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-motoWhite border-motoGray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-motoGray">Ventas del Día</CardTitle>
            <ShoppingCart className="h-4 w-4 text-motoRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-motoGray-dark">${totalSalesToday.toFixed(2)}</div>
            <p className="text-xs text-motoGray">
              {salesToday.length} ventas hoy
            </p>
          </CardContent>
        </Card>
        <Card className="bg-motoWhite border-motoGray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-motoGray">Ventas de la Semana</CardTitle>
            <History className="h-4 w-4 text-motoRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-motoGray-dark">${totalSalesLastWeek.toFixed(2)}</div>
            <p className="text-xs text-motoGray">
              {salesLastWeek.length} ventas en los últimos 7 días
            </p>
          </CardContent>
        </Card>
        <Card className="bg-motoWhite border-motoGray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-motoGray">Ventas del Mes</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-motoRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-motoGray-dark">${totalSalesThisMonth.toFixed(2)}</div>
            <p className="text-xs text-motoGray">
              {salesThisMonth.length} ventas este mes ({format(new Date(), "MMMM yyyy", { locale: es })})
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-motoWhite border-motoGray">
          <CardHeader>
            <CardTitle className="text-lg text-motoGray-dark">Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {mostSoldProducts.length > 0 ? (
              <ul className="space-y-2">
                {mostSoldProducts.map(([name, count]) => (
                  <li key={name} className="flex justify-between text-motoGray">
                    <span>{name}</span>
                    <span className="font-medium">{count} unidades</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-motoGray">No hay datos de ventas de productos.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-motoWhite border-motoGray">
          <CardHeader>
            <CardTitle className="text-lg text-motoGray-dark">Servicios Más Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            {mostRequestedServices.length > 0 ? (
              <ul className="space-y-2">
                {mostRequestedServices.map(([name, count]) => (
                  <li key={name} className="flex justify-between text-motoGray">
                    <span>{name}</span>
                    <span className="font-medium">{count} veces</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-motoGray">No hay datos de ventas de servicios.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="bg-motoWhite border-motoRed">
          <CardHeader>
            <CardTitle className="text-lg text-motoRed">Alertas de Inventario Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lowStockProducts.map(product => (
                <li key={product.id} className="flex justify-between text-motoGray">
                  <span>{product.name}</span>
                  <span className="font-medium text-motoRed">Stock: {product.stock}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default DashboardPage;