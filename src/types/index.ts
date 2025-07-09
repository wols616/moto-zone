export interface Product {
  id: string;
  name: string;
  image: string | null; // URL to product image
  description: string | null;
  price: number;
  category_id: string;
  stock: number;
  low_stock_threshold: number; // For inventory alerts
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface SaleItem {
  id?: string; // Optional for new items
  sale_id?: string; // Optional for new items
  item_id: string | null; // Product or Service ID
  item_type: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  discount?: number; // Discount per item (percentage or amount)
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id?: string; // Optional for new sales
  date: string; // ISO date string
  subtotal: number;
  tax_rate: number; // e.g., 0.16 for 16%
  tax_amount: number;
  discount_total: number; // Total discount applied to the sale
  total: number;
  payment_method: string;
  cashier_id: string; // ID of the user who made the sale
  items?: SaleItem[]; // Optional items array
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Only for mock data, not for real auth
  role: "admin" | "employee";
  name: string;
}
