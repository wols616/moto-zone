import { Product, Service, User, Sale, Category } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Aceite Sintético 10W-40",
    image: "Aceite de motor sintético de alto rendimiento para motocicletas",
    description:
      "Aceite de motor sintético de alto rendimiento para motocicletas.",
    price: 25.99,
    category_id: "cat-lubricantes",
    stock: 50,
    low_stock_threshold: 10,
  },
  {
    id: "prod-002",
    name: "Filtro de Aire Deportivo",
    image:
      "https://cdn.club-magazin.autodoc.de/uploads/sites/11/2020/09/filtros-incorporados-al-sistema-de-admision.jpg",
    description: "Filtro de aire de alto flujo para mejorar el rendimiento.",
    price: 35.5,
    category_id: "cat-filtros",
    stock: 30,
    low_stock_threshold: 5,
  },
  {
    id: "prod-003",
    name: "Pastillas de Freno Delanteras",
    image:
      "https://www.kmmotos.com/cdn/shop/files/KMS-HND0095.png?v=1748225178&width=1946",
    description:
      "Pastillas de freno cerámicas para mayor durabilidad y frenado.",
    price: 45.0,
    category_id: "cat-frenos",
    stock: 20,
    low_stock_threshold: 5,
  },
  {
    id: "prod-004",
    name: "Casco Integral Sport",
    image:
      "https://www.garibaldi.es/media/catalog/product/cache/aa91ee9597336ae960f1d2ef9725c241/G/H/GH9034_MT-BLC-2.jpg",
    description:
      "Casco integral con diseño aerodinámico y ventilación avanzada.",
    price: 180.0,
    category_id: "cat-accesorios",
    stock: 15,
    low_stock_threshold: 3,
  },
  {
    id: "prod-005",
    name: "Guantes de Cuero Racing",
    image:
      "https://m.media-amazon.com/images/I/71cF+4QU1GL._AC_UF1000,1000_QL80_.jpg",
    description: "Guantes de cuero con protecciones para conducción deportiva.",
    price: 75.0,
    category_id: "cat-accesorios",
    stock: 25,
    low_stock_threshold: 5,
  },
];

export const mockCategories: Category[] = [
  {
    id: "cat-lubricantes",
    name: "Lubricantes",
  },
  {
    id: "cat-filtros",
    name: "Filtros",
  },
  {
    id: "cat-frenos",
    name: "Frenos",
  },
  {
    id: "cat-accesorios",
    name: "Accesorios",
  },
];

export const mockServices: Service[] = [
  {
    id: "serv-001",
    name: "Cambio de Aceite y Filtro",
    description: "Reemplazo de aceite de motor y filtro de aceite.",
    price: 40.0,
  },
  {
    id: "serv-002",
    name: "Diagnóstico Electrónico",
    description: "Revisión y diagnóstico de fallas electrónicas del motor.",
    price: 60.0,
  },
  {
    id: "serv-003",
    name: "Alineación y Balanceo",
    description: "Alineación de ruedas y balanceo de neumáticos.",
    price: 55.0,
  },
  {
    id: "serv-004",
    name: "Revisión General",
    description:
      "Inspección completa de la motocicleta (frenos, luces, fluidos, etc.).",
    price: 80.0,
  },
];

export const mockUsers: User[] = [
  {
    id: "user-admin-001",
    email: "admin@motozone.com",
    password: "password123", // For mock login only
    role: "admin",
    name: "Juan Administrador",
  },
  {
    id: "user-employee-001",
    email: "empleado@motozone.com",
    password: "password123", // For mock login only
    role: "employee",
    name: "Maria Empleada",
  },
];

export const mockSales: Sale[] = [
  {
    id: "sale-001",
    date: "2023-10-26T10:30:00Z",
    items: [
      {
        id: "item-001",
        item_id: "prod-001",
        item_type: "product",
        name: "Aceite Sintético 10W-40",
        price: 25.99,
        quantity: 1,
      },
      {
        id: "item-002",
        item_id: "serv-001",
        item_type: "service",
        name: "Cambio de Aceite y Filtro",
        price: 40.0,
        quantity: 1,
      },
    ],
    subtotal: 65.99,
    tax_rate: 0.16,
    tax_amount: 10.56,
    discount_total: 0,
    total: 76.55,
    payment_method: "Tarjeta",
    cashier_id: "user-employee-001",
  },
  {
    id: "sale-002",
    date: "2023-10-25T15:00:00Z",
    items: [
      {
        id: "item-003",
        item_id: "prod-004",
        item_type: "product",
        name: "Casco Integral Sport",
        price: 180.0,
        quantity: 1,
      },
      {
        id: "item-004",
        item_id: "prod-005",
        item_type: "product",
        name: "Guantes de Cuero Racing",
        price: 75.0,
        quantity: 1,
        discount: 10,
      },
    ],
    subtotal: 255.0,
    tax_rate: 0.16,
    tax_amount: 40.8,
    discount_total: 7.5, // 10% of 75
    total: 288.3,
    payment_method: "Efectivo",
    cashier_id: "user-admin-001",
  },
];
