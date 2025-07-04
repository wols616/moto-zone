import React, { createContext, useState, useContext, ReactNode } from "react";
import { Product, Service, Sale } from "@/types";
import { mockProducts, mockServices, mockSales } from "@/data/mockData";
import { toast } from "sonner";

interface DataContextType {
  products: Product[];
  services: Service[];
  sales: Sale[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addSale: (sale: Omit<Sale, "id">) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [sales, setSales] = useState<Sale[]>(mockSales);

  const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = { ...product, id: generateId("prod") };
    setProducts((prev) => [...prev, newProduct]);
    toast.success("Producto agregado exitosamente.");
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    toast.success("Producto actualizado exitosamente.");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Producto eliminado.");
  };

  const addService = (service: Omit<Service, "id">) => {
    const newService: Service = { ...service, id: generateId("serv") };
    setServices((prev) => [...prev, newService]);
    toast.success("Servicio agregado exitosamente.");
  };

  const updateService = (updatedService: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s)),
    );
    toast.success("Servicio actualizado exitosamente.");
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success("Servicio eliminado.");
  };

  const addSale = (sale: Omit<Sale, "id">) => {
    const newSale: Sale = { ...sale, id: generateId("sale") };
    setSales((prev) => [...prev, newSale]);
    toast.success("Venta registrada exitosamente.");

    // Update product stock
    newSale.items.forEach(item => {
      if (item.type === "product") {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p
          )
        );
      }
    });
  };

  return (
    <DataContext.Provider
      value={{
        products,
        services,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        addService,
        updateService,
        deleteService,
        addSale,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};