import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const SalesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Nueva Venta</h1>
      <p className="text-lg text-motoGray">Aquí podrás registrar nuevas ventas de productos y servicios.</p>
      <div className="p-4 border border-dashed border-motoGray rounded-md text-center text-motoGray">
        <p>Contenido de la página de Nueva Venta en construcción...</p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SalesPage;