import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Sale, SaleItem } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Eye,
  Filter,
  X,
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
  User,
  CreditCard,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const SalesHistoryPage = () => {
  const { sales, loadingSales, getSaleById } = useData();

  // Filters state
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [cashierFilter, setCashierFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selected sale details
  const [selectedSale, setSelectedSale] = useState<
    (Sale & { items: SaleItem[] }) | null
  >(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Apply filters
  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Date filter
    if (dateFilter.startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.date) >= new Date(dateFilter.startDate)
      );
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.date) <= new Date(dateFilter.endDate)
      );
    }

    // Cashier filter
    if (cashierFilter) {
      filtered = filtered.filter((sale) =>
        sale.cashier_id.toLowerCase().includes(cashierFilter.toLowerCase())
      );
    }

    // Payment method filter
    if (paymentMethodFilter) {
      filtered = filtered.filter(
        (sale) => sale.payment_method === paymentMethodFilter
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [sales, dateFilter, cashierFilter, paymentMethodFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalAmount = filteredSales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );
    const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;

    const paymentMethods = filteredSales.reduce((acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date().toISOString().split("T")[0];
    const todaySales = filteredSales.filter(
      (sale) => sale.date.split("T")[0] === today
    );
    const todayAmount = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalSales,
      totalAmount,
      averageAmount,
      paymentMethods,
      todaySales: todaySales.length,
      todayAmount,
    };
  }, [filteredSales]);

  // Get sale details
  const handleViewDetails = async (saleId: string) => {
    setLoadingDetails(true);
    try {
      const saleDetails = await getSaleById(saleId);
      setSelectedSale(saleDetails);
      setShowSaleDetails(true);
    } catch (error) {
      toast.error("Error al cargar los detalles de la venta");
      console.error("Error loading sale details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setDateFilter({ startDate: "", endDate: "" });
    setCashierFilter("");
    setPaymentMethodFilter("");
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      Efectivo: "default",
      Tarjeta: "secondary",
      Transferencia: "outline",
    } as const;

    return (
      <Badge variant={variants[method as keyof typeof variants] || "default"}>
        {method}
      </Badge>
    );
  };

  // Get the active filters count
  const activeFiltersCount = [
    dateFilter.startDate,
    dateFilter.endDate,
    cashierFilter,
    paymentMethodFilter,
  ].filter(Boolean).length;

  if (loadingSales) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-motoGray-dark">
            Historial de Ventas
          </h1>
          <p className="text-lg text-motoGray">
            Consulta el historial completo de todas las ventas realizadas.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ventas
                </p>
                <p className="text-2xl font-bold">{statistics.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ingresos
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Promedio por Venta
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.averageAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold">{statistics.todaySales}</p>
                <p className="text-sm text-muted-foreground">
                  ${statistics.todayAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros de Búsqueda</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashier">Cajero</Label>
                <Input
                  id="cashier"
                  type="text"
                  placeholder="ID del cajero..."
                  value={cashierFilter}
                  onChange={(e) => setCashierFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pago</Label>
                <Select
                  value={paymentMethodFilter}
                  onValueChange={setPaymentMethodFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los métodos</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card className="bg-motoWhite border-motoGray">
        <CardHeader>
          <CardTitle className="text-xl text-motoGray-dark flex items-center justify-between">
            <span>Registro de Ventas ({filteredSales.length})</span>
            {filteredSales.length !== sales.length && (
              <Badge variant="outline">
                {filteredSales.length} de {sales.length} ventas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-motoGray-light">
                  <TableHead className="text-motoGray-dark">ID Venta</TableHead>
                  <TableHead className="text-motoGray-dark">Fecha</TableHead>
                  <TableHead className="text-motoGray-dark">Total</TableHead>
                  <TableHead className="text-motoGray-dark">
                    Método de Pago
                  </TableHead>
                  <TableHead className="text-motoGray-dark">Cajero</TableHead>
                  <TableHead className="text-motoGray-dark">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-motoWhite-dark">
                      <TableCell className="font-medium text-motoGray-dark font-mono">
                        {sale.id}
                      </TableCell>
                      <TableCell className="text-motoGray">
                        {format(new Date(sale.date), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(sale.payment_method)}
                      </TableCell>
                      <TableCell className="text-motoGray font-mono text-sm">
                        {sale.cashier_id}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(sale.id)}
                          disabled={loadingDetails}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-motoGray"
                    >
                      {sales.length === 0
                        ? "No hay ventas registradas."
                        : "No se encontraron ventas con los filtros aplicados."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detalles de Venta {selectedSale?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fecha y Hora</span>
                    </div>
                    <p className="text-lg">
                      {format(new Date(selectedSale.date), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Cajero</span>
                    </div>
                    <p className="text-lg font-mono">
                      {selectedSale.cashier_id}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Method */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Método de Pago</span>
                  </div>
                  {getPaymentMethodBadge(selectedSale.payment_method)}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Artículos Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedSale.items &&
                      selectedSale.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.item_type === "product"
                                ? "Producto"
                                : "Servicio"}
                              {item.item_id && ` • ID: ${item.item_id}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                            {item.discount > 0 && (
                              <p className="text-sm text-red-600">
                                Descuento: {item.discount.toFixed(2)}%
                              </p>
                            )}
                            <p className="text-lg font-bold text-green-600">
                              $
                              {(
                                item.price *
                                item.quantity *
                                (1 - (item.discount || 0) / 100)
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Totals Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Desglose de Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedSale.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedSale.discount_total > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento Total:</span>
                        <span>-${selectedSale.discount_total.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedSale.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Impuestos ({(selectedSale.tax_rate * 100).toFixed(0)}
                          %):
                        </span>
                        <span>${selectedSale.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ${selectedSale.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SalesHistoryPage;
