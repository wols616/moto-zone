import { Product, Service, Sale, User, Category } from "@/types";
import {
  mockProducts,
  mockServices,
  mockSales,
  mockUsers,
  mockCategories,
} from "@/data/mockData";

class LocalStorageService {
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Initialize mock data if not exists
  initializeMockData(): void {
    if (!localStorage.getItem("moto-zone-products")) {
      this.saveToStorage("moto-zone-products", mockProducts);
    }
    if (!localStorage.getItem("moto-zone-services")) {
      this.saveToStorage("moto-zone-services", mockServices);
    }
    if (!localStorage.getItem("moto-zone-sales")) {
      this.saveToStorage("moto-zone-sales", mockSales);
    }
    if (!localStorage.getItem("moto-zone-users")) {
      this.saveToStorage("moto-zone-users", mockUsers);
    }
    if (!localStorage.getItem("moto-zone-categories")) {
      this.saveToStorage("moto-zone-categories", mockCategories);
    }
  }

  // Products
  getProducts(): Product[] {
    return this.getFromStorage("moto-zone-products", mockProducts);
  }

  saveProducts(products: Product[]): void {
    this.saveToStorage("moto-zone-products", products);
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  updateProduct(id: string, updatedProduct: Partial<Product>): boolean {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    products[index] = { ...products[index], ...updatedProduct };
    this.saveProducts(products);
    return true;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter((p) => p.id !== id);
    if (filteredProducts.length === products.length) return false;

    this.saveProducts(filteredProducts);
    return true;
  }

  // Services
  getServices(): Service[] {
    return this.getFromStorage("moto-zone-services", mockServices);
  }

  saveServices(services: Service[]): void {
    this.saveToStorage("moto-zone-services", services);
  }

  addService(service: Service): void {
    const services = this.getServices();
    services.push(service);
    this.saveServices(services);
  }

  updateService(id: string, updatedService: Partial<Service>): boolean {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return false;

    services[index] = { ...services[index], ...updatedService };
    this.saveServices(services);
    return true;
  }

  deleteService(id: string): boolean {
    const services = this.getServices();
    const filteredServices = services.filter((s) => s.id !== id);
    if (filteredServices.length === services.length) return false;

    this.saveServices(filteredServices);
    return true;
  }

  // Sales
  getSales(): Sale[] {
    return this.getFromStorage("moto-zone-sales", mockSales);
  }

  saveSales(sales: Sale[]): void {
    this.saveToStorage("moto-zone-sales", sales);
  }

  addSale(sale: Sale): void {
    const sales = this.getSales();
    sales.push(sale);
    this.saveSales(sales);
  }

  // Categories
  getCategories(): Category[] {
    return this.getFromStorage("moto-zone-categories", mockCategories);
  }

  // Users & Auth
  getUsers(): User[] {
    return this.getFromStorage("moto-zone-users", mockUsers);
  }

  authenticateUser(email: string, password: string): User | null {
    // In offline mode, allow flexible authentication
    const validPasswords = ["demo", "123456", "password", "admin"];

    if (validPasswords.includes(password.toLowerCase())) {
      // Return a demo user
      return {
        id: "demo-user-001",
        email: email || "demo@motozone.com",
        name: "Usuario Demo",
        role: "admin",
      };
    }

    // Also check against stored users
    const users = this.getUsers();
    return (
      users.find(
        (user) => user.email === email && user.password === password
      ) || null
    );
  }

  // Analytics and Summary functions
  getSalesSummary() {
    const sales = this.getSales();
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaySales = sales.filter(
      (sale) => new Date(sale.date) >= todayStart
    );
    const thisMonthSales = sales.filter(
      (sale) => new Date(sale.date) >= monthStart
    );

    return {
      today: {
        count: todaySales.length,
        total: todaySales.reduce((sum, sale) => sum + sale.total, 0),
      },
      this_month: {
        count: thisMonthSales.length,
        total: thisMonthSales.reduce((sum, sale) => sum + sale.total, 0),
      },
      all_time: {
        count: sales.length,
        total: sales.reduce((sum, sale) => sum + sale.total, 0),
      },
    };
  }

  getSaleById(id: string) {
    const sales = this.getSales();
    return sales.find((sale) => sale.id === id) || null;
  }

  getSalesByDateRange(startDate: string, endDate: string) {
    const sales = this.getSales();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }

  getSalesByCashier(cashierId: string) {
    const sales = this.getSales();
    return sales.filter((sale) => sale.cashier_id === cashierId);
  }

  getProductSalesStats() {
    const sales = this.getSales();
    const productSales = new Map<string, { name: string; quantity: number }>();

    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (item.item_type === "product") {
          const existing = productSales.get(item.item_id || item.name);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            productSales.set(item.item_id || item.name, {
              name: item.name,
              quantity: item.quantity,
            });
          }
        }
      });
    });

    const most_sold_products = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      most_sold_products,
      total_unique_products: productSales.size,
    };
  }

  getServiceSalesStats() {
    const sales = this.getSales();
    const serviceSales = new Map<string, { name: string; quantity: number }>();

    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (item.item_type === "service") {
          const existing = serviceSales.get(item.item_id || item.name);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            serviceSales.set(item.item_id || item.name, {
              name: item.name,
              quantity: item.quantity,
            });
          }
        }
      });
    });

    const most_requested_services = Array.from(serviceSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      most_requested_services,
      total_unique_services: serviceSales.size,
    };
  }

  getSaleItems() {
    const sales = this.getSales();
    const allItems: any[] = [];

    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        allItems.push({
          ...item,
          sale_id: sale.id,
          sale_date: sale.date,
        });
      });
    });

    return allItems;
  }

  // Clear all data (for reset)
  clearAllData(): void {
    localStorage.removeItem("moto-zone-products");
    localStorage.removeItem("moto-zone-services");
    localStorage.removeItem("moto-zone-sales");
    localStorage.removeItem("moto-zone-users");
    localStorage.removeItem("moto-zone-categories");
    this.initializeMockData();
  }
}

export const localStorageService = new LocalStorageService();
