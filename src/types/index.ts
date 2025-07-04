export interface Product {
  id: string;
  name: string;
  image: string; // URL to product image
  description: string;
  price: number;
  category: string;
  stock: number;
  lowStockThreshold: number; // For inventory alerts
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface SaleItem {
  id: string; // Product or Service ID
  type: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  discount?: number; // Discount per item in percentage
}

export interface Sale {
  id: string;
  date: string; // ISO date string
  items: SaleItem[];
  subtotal: number;
  taxRate: number; // e.g., 0.16 for 16%
  taxAmount: number;
  discountTotal: number; // Total discount applied to the sale
  total: number;
  paymentMethod: string;
  cashierId: string; // ID of the user who made the sale
}

export interface User {
  id: string;
  email: string;
  password?: string; // Only for mock data, not for real auth
  role: "admin" | "employee";
  name: string;
}