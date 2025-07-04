import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ProductsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Gestión de Productos</h1>
      <p className="text-lg text-motoGray">Aquí podrás ver, agregar, editar y eliminar productos.</p>
      <div className="p-4 border border-dashed border-motoGray rounded-md text-center text-motoGray">
        <p>Contenido de la página de Productos en construcción...</p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ProductsPage;