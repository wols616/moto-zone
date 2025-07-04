import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const SalesHistoryPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Historial de Ventas</h1>
      <p className="text-lg text-motoGray">Aquí podrás consultar el historial de todas las ventas.</p>
      <div className="p-4 border border-dashed border-motoGray rounded-md text-center text-motoGray">
        <p>Contenido de la página de Historial de Ventas en construcción...</p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SalesHistoryPage;