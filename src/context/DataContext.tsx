import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Product, Service, Sale, SaleItem, Category } from "@/types";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "./AuthContext";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { localStorageService } from "@/services/localStorage";

interface DataContextType {
  // Products
  products: Product[];
  loadingProducts: boolean;
  errorProducts: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Services
  services: Service[];
  loadingServices: boolean;
  errorServices: string | null;
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  loadingCategories: boolean;
  errorCategories: string | null;
  fetchCategories: () => Promise<void>;

  // Sales
  sales: Sale[];
  loadingSales: boolean;
  errorSales: string | null;
  fetchSales: () => Promise<void>;
  addSale: (saleData: {
    subtotal: number;
    tax_rate?: number;
    tax_amount?: number;
    discount_total?: number;
    total: number;
    payment_method: string;
    cashier_id: string;
    items: Array<{
      item_id?: string | null;
      item_type?: "product" | "service";
      name: string;
      price: number;
      quantity: number;
      discount?: number;
    }>;
  }) => Promise<Sale>;
  getSalesSummary: () => Promise<{
    today: { count: number; total: number };
    this_month: { count: number; total: number };
    all_time: { count: number; total: number };
  }>;
  getSaleById: (id: string) => Promise<Sale & { items: SaleItem[] }>;
  getSalesByDateRange: (startDate: string, endDate: string) => Promise<Sale[]>;
  getSalesByCashier: (cashierId: string) => Promise<Sale[]>;

  // Analytics
  getSaleItems: () => Promise<SaleItem[]>;

  // Statistics functions
  getProductSalesStats: () => Promise<{
    most_sold_products: Array<{ name: string; quantity: number }>;
    total_unique_products: number;
  }>;
  getServiceSalesStats: () => Promise<{
    most_requested_services: Array<{ name: string; quantity: number }>;
    total_unique_services: number;
  }>;

  // General
  loading: boolean;
  refetchAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isBackendAvailable } = useBackendStatus();

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [errorServices, setErrorServices] = useState<string | null>(null);

  // Sales State
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState<boolean>(false);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // General loading state (when loading multiple resources)
  const [loading, setLoading] = useState<boolean>(false);

  // --- PRODUCTS API CALLS ---
  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoadingProducts(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const offlineProducts = localStorageService.getProducts();
        setProducts(offlineProducts);
        setErrorProducts(null);
        console.log("🎭 [DataContext] Loaded products from offline storage");
      } else {
        // Online mode
        const response = await api.get("/products");
        setProducts(response.data.data);
        setErrorProducts(null);
      }
    } catch (error) {
      setErrorProducts("Error al cargar productos");
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [isAuthenticated, authLoading, isBackendAvailable]);

  // --- SERVICES API CALLS ---
  const fetchServices = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoadingServices(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const offlineServices = localStorageService.getServices();
        setServices(offlineServices);
        setErrorServices(null);
        console.log("🎭 [DataContext] Loaded services from offline storage");
      } else {
        // Online mode
        const response = await api.get("/services");
        setServices(response.data.data);
        setErrorServices(null);
      }
    } catch (error) {
      setErrorServices("Error al cargar servicios");
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  }, [isAuthenticated, authLoading, isBackendAvailable]);

  // --- SALES API CALLS ---
  const fetchSales = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoadingSales(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const offlineSales = localStorageService.getSales();
        setSales(offlineSales);
        setErrorSales(null);
        console.log("🎭 [DataContext] Loaded sales from offline storage");
      } else {
        // Online mode
        const response = await api.get("/sales");
        setSales(response.data.data);
        setErrorSales(null);
      }
    } catch (error) {
      setErrorSales("Error al cargar ventas");
      console.error("Error fetching sales:", error);
    } finally {
      setLoadingSales(false);
    }
  }, [isAuthenticated, authLoading, isBackendAvailable]);

  // --- CATEGORIES API CALLS ---
  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    setLoadingCategories(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const offlineCategories = localStorageService.getCategories();
        setCategories(offlineCategories);
        setErrorCategories(null);
        console.log("🎭 [DataContext] Loaded categories from offline storage");
      } else {
        // Online mode
        const response = await api.get("/products/categories");
        setCategories(response.data.data);
        setErrorCategories(null);
      }
    } catch (error) {
      setErrorCategories("Error al cargar categorías");
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, [isAuthenticated, authLoading, isBackendAvailable]);

  // Fetch all data
  const refetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchServices(),
        fetchSales(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error("Error refetching all data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchServices, fetchSales, fetchCategories]);

  // Initial data load - only when authenticated and auth check is complete
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refetchAll();
    }
  }, [refetchAll, isAuthenticated, authLoading]);

  // Clear all data when user logs out
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setProducts([]);
      setServices([]);
      setSales([]);
      setCategories([]);
      setErrorProducts(null);
      setErrorServices(null);
      setErrorSales(null);
      setErrorCategories(null);
    }
  }, [isAuthenticated, authLoading]);

  const addProduct = async (product: Omit<Product, "id">) => {
    setLoadingProducts(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`,
        };
        localStorageService.addProduct(newProduct);
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Producto agregado exitosamente (Modo sin conexión)");
        setErrorProducts(null);
        return newProduct;
      } else {
        // Online mode
        const response = await api.post("/products", product);
        setProducts((prev) => [...prev, response.data.data]);
        toast.success("Producto agregado exitosamente");
        setErrorProducts(null);
        return response.data.data;
      }
    } catch (error) {
      setErrorProducts("Error al agregar producto");
      toast.error("Error al agregar producto");
      console.error("Error adding product:", error);
      throw error;
    } finally {
      setLoadingProducts(false);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    setLoadingProducts(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const success = localStorageService.updateProduct(id, product);
        if (success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...product } : p))
          );
          toast.success(
            "Producto actualizado exitosamente (Modo sin conexión)"
          );
          setErrorProducts(null);
          return { ...products.find((p) => p.id === id), ...product };
        } else {
          throw new Error("Producto no encontrado");
        }
      } else {
        // Online mode
        const response = await api.put(`/products/${id}`, product);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? response.data.data : p))
        );
        toast.success("Producto actualizado exitosamente");
        setErrorProducts(null);
        return response.data.data;
      }
    } catch (error) {
      setErrorProducts("Error al actualizar producto");
      toast.error("Error al actualizar producto");
      console.error("Error updating product:", error);
      throw error;
    } finally {
      setLoadingProducts(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoadingProducts(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const success = localStorageService.deleteProduct(id);
        if (success) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          toast.success("Producto eliminado exitosamente (Modo sin conexión)");
          setErrorProducts(null);
        } else {
          throw new Error("Producto no encontrado");
        }
      } else {
        // Online mode
        await api.delete(`/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Producto eliminado exitosamente");
        setErrorProducts(null);
      }
    } catch (error) {
      setErrorProducts("Error al eliminar producto");
      toast.error("Error al eliminar producto");
      console.error("Error deleting product:", error);
      throw error;
    } finally {
      setLoadingProducts(false);
    }
  };

  const addService = async (service: Omit<Service, "id">) => {
    setLoadingServices(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const newService: Service = {
          ...service,
          id: `serv-${Date.now()}`,
        };
        localStorageService.addService(newService);
        setServices((prev) => [...prev, newService]);
        toast.success("Servicio agregado exitosamente (Modo sin conexión)");
        setErrorServices(null);
        return newService;
      } else {
        // Online mode
        const response = await api.post("/services", service);
        console.log("Service added response:", response.data);
        const newService = response.data.data;
        setServices((prev) => [...prev, newService]);
        toast.success("Servicio agregado exitosamente");
        setErrorServices(null);
        return newService;
      }
    } catch (error) {
      setErrorServices("Error al agregar servicio");
      toast.error("Error al agregar servicio");
      console.error("Error adding service:", error);
      throw error;
    } finally {
      setLoadingServices(false);
    }
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    setLoadingServices(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const success = localStorageService.updateService(id, service);
        if (success) {
          setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...service } : s))
          );
          toast.success(
            "Servicio actualizado exitosamente (Modo sin conexión)"
          );
          setErrorServices(null);
          return { ...services.find((s) => s.id === id), ...service };
        } else {
          throw new Error("Servicio no encontrado");
        }
      } else {
        // Online mode
        const response = await api.put(`/services/${id}`, service);
        setServices((prev) =>
          prev.map((s) => (s.id === id ? response.data.data : s))
        );
        toast.success("Servicio actualizado exitosamente");
        setErrorServices(null);
        return response.data.data;
      }
    } catch (error) {
      setErrorServices("Error al actualizar servicio");
      toast.error("Error al actualizar servicio");
      console.error("Error updating service:", error);
      throw error;
    } finally {
      setLoadingServices(false);
    }
  };

  const deleteService = async (id: string) => {
    setLoadingServices(true);
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        const success = localStorageService.deleteService(id);
        if (success) {
          setServices((prev) => prev.filter((s) => s.id !== id));
          toast.success("Servicio eliminado exitosamente (Modo sin conexión)");
          setErrorServices(null);
        } else {
          throw new Error("Servicio no encontrado");
        }
      } else {
        // Online mode
        await api.delete(`/services/${id}`);
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success("Servicio eliminado exitosamente");
        setErrorServices(null);
      }
    } catch (error) {
      setErrorServices("Error al eliminar servicio");
      toast.error("Error al eliminar servicio");
      console.error("Error deleting service:", error);
      throw error;
    } finally {
      setLoadingServices(false);
    }
  };

  const addSale = async (saleData: {
    subtotal: number;
    tax_rate?: number;
    tax_amount?: number;
    discount_total?: number;
    total: number;
    payment_method: string;
    cashier_id: string;
    items: Array<{
      item_id?: string | null;
      item_type?: "product" | "service";
      name: string;
      price: number;
      quantity: number;
      discount?: number;
    }>;
  }) => {
    setLoadingSales(true);
    try {
      console.log("📦 [DataContext] Sending sale data:", saleData);

      if (isBackendAvailable === false) {
        // Offline mode
        const newSale: Sale = {
          id: `sale-${Date.now()}`,
          date: new Date().toISOString(),
          items: saleData.items.map((item) => ({
            id: `item-${Date.now()}-${Math.random()}`,
            item_id: item.item_id,
            item_type: item.item_type || "product",
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount,
          })),
          subtotal: saleData.subtotal,
          tax_rate: saleData.tax_rate || 0.16,
          tax_amount: saleData.tax_amount || 0,
          discount_total: saleData.discount_total || 0,
          total: saleData.total,
          payment_method: saleData.payment_method,
          cashier_id: saleData.cashier_id,
        };

        localStorageService.addSale(newSale);
        setSales((prev) => [...prev, newSale]);
        toast.success("Venta registrada exitosamente (Modo sin conexión)");
        setErrorSales(null);

        // Update product stock locally
        setProducts((prevProducts) => {
          return prevProducts.map((product) => {
            const saleItem = saleData.items.find(
              (item) =>
                item.item_type === "product" && item.item_id === product.id
            );

            if (saleItem) {
              const newStock = Math.max(0, product.stock - saleItem.quantity);
              console.log(
                `📦 [Stock Update Local] Product ${product.name}: ${product.stock} → ${newStock}`
              );
              return { ...product, stock: newStock };
            }

            return product;
          });
        });

        return newSale;
      } else {
        // Online mode
        const response = await api.post("/sales", saleData);
        setSales((prev) => [...prev, response.data.data]);
        toast.success("Venta registrada exitosamente");
        setErrorSales(null);

        // Update product stock locally
        setProducts((prevProducts) => {
          return prevProducts.map((product) => {
            const saleItem = saleData.items.find(
              (item) =>
                item.item_type === "product" && item.item_id === product.id
            );

            if (saleItem) {
              const newStock = Math.max(0, product.stock - saleItem.quantity);
              console.log(
                `📦 [Stock Update Local] Product ${product.name}: ${product.stock} → ${newStock}`
              );
              return { ...product, stock: newStock };
            }

            return product;
          });
        });

        return response.data.data;
      }
    } catch (error) {
      setErrorSales("Error al registrar venta");
      toast.error("Error al registrar venta");
      console.error("Error adding sale:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    } finally {
      setLoadingSales(false);
    }
  };

  const getSalesSummary = async () => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getSalesSummary();
      } else {
        // Online mode
        const response = await api.get("/sales/summary");
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      throw error;
    }
  };

  const getSaleById = async (id: string) => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getSaleById(id);
      } else {
        // Online mode
        const response = await api.get(`/sales/${id}`);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching sale by ID:", error);
      throw error;
    }
  };

  const getSalesByDateRange = async (startDate: string, endDate: string) => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getSalesByDateRange(startDate, endDate);
      } else {
        // Online mode
        const response = await api.get(
          `/sales/date-range?start_date=${startDate}&end_date=${endDate}`
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching sales by date range:", error);
      throw error;
    }
  };

  const getSalesByCashier = async (cashierId: string) => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getSalesByCashier(cashierId);
      } else {
        // Online mode
        const response = await api.get(`/sales/cashier/${cashierId}`);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching sales by cashier:", error);
      throw error;
    }
  };

  const getSaleItems = async () => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getSaleItems();
      } else {
        // Online mode
        const response = await api.get("/sale-items");
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching sale items:", error);
      throw error;
    }
  };

  const getProductSalesStats = async () => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getProductSalesStats();
      } else {
        // Online mode
        const response = await api.get("/products/stats/sales");
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching product sales stats:", error);
      throw error;
    }
  };

  const getServiceSalesStats = async () => {
    try {
      if (isBackendAvailable === false) {
        // Offline mode
        return localStorageService.getServiceSalesStats();
      } else {
        // Online mode
        const response = await api.get("/products/stats/services");
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching service sales stats:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        // Products
        products,
        loadingProducts,
        errorProducts,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,

        // Services
        services,
        loadingServices,
        errorServices,
        fetchServices,
        addService,
        updateService,
        deleteService,

        // Sales
        sales,
        loadingSales,
        errorSales,
        fetchSales,
        addSale,
        getSalesSummary,
        getSaleById,
        getSalesByDateRange,
        getSalesByCashier,

        // Categories
        categories,
        loadingCategories,
        errorCategories,
        fetchCategories,

        // Analytics
        getSaleItems,
        getProductSalesStats,
        getServiceSalesStats,

        // General
        loading,
        refetchAll,
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
