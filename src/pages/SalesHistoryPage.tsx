import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/context/DataContext";
import { mockUsers } from "@/data/mockData"; // To get cashier names
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Import Spanish locale

const SalesHistoryPage = () => {
  const { sales } = useData();

  // Helper to get cashier name
  const getCashierName = (cashierId: string) => {
    const user = mockUsers.find(u => u.id === cashierId);
    return user ? user.name : "Desconocido";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Historial de Ventas</h1>
      <p className="text-lg text-motoGray">Consulta el historial completo de todas las ventas realizadas.</p>

      <Card className="bg-motoWhite border-motoGray">
        <CardHeader>
          <CardTitle className="text-xl text-motoGray-dark">Registro de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-motoGray-light">
                  <TableHead className="text-motoGray-dark">Fecha</TableHead>
                  <TableHead className="text-motoGray-dark">Total</TableHead>
                  <TableHead className="text-motoGray-dark">Método de Pago</TableHead>
                  <TableHead className="text-motoGray-dark">Cajero</TableHead>
                  <TableHead className="text-motoGray-dark">Artículos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length > 0 ? (
                  sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-motoWhite-dark">
                      <TableCell className="font-medium text-motoGray-dark">
                        {format(new Date(sale.date), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell className="text-motoGray">${sale.total.toFixed(2)}</TableCell>
                      <TableCell className="text-motoGray">{sale.paymentMethod}</TableCell>
                      <TableCell className="text-motoGray">{getCashierName(sale.cashierId)}</TableCell>
                      <TableCell className="text-motoGray">
                        <ul className="list-disc list-inside">
                          {sale.items.map((item, index) => (
                            <li key={index} className="text-sm">
                              {item.name} (x{item.quantity}) - ${((item.price * item.quantity) * (1 - (item.discount || 0) / 100)).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-motoGray">
                      No hay ventas registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default SalesHistoryPage;