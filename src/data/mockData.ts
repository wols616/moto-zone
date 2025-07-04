import { Product, Service, User, Sale } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Aceite Sintético 10W-40",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Aceite",
    description: "Aceite de motor sintético de alto rendimiento para motocicletas.",
    price: 25.99,
    category: "Lubricantes",
    stock: 50,
    lowStockThreshold: 10,
  },
  {
    id: "prod-002",
    name: "Filtro de Aire Deportivo",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Filtro",
    description: "Filtro de aire de alto flujo para mejorar el rendimiento.",
    price: 35.50,
    category: "Filtros",
    stock: 30,
    lowStockThreshold: 5,
  },
  {
    id: "prod-003",
    name: "Pastillas de Freno Delanteras",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Pastillas",
    description: "Pastillas de freno cerámicas para mayor durabilidad y frenado.",
    price: 45.00,
    category: "Frenos",
    stock: 20,
    lowStockThreshold: 5,
  },
  {
    id: "prod-004",
    name: "Casco Integral Sport",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Casco",
    description: "Casco integral con diseño aerodinámico y ventilación avanzada.",
    price: 180.00,
    category: "Accesorios",
    stock: 15,
    lowStockThreshold: 3,
  },
  {
    id: "prod-005",
    name: "Guantes de Cuero Racing",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Guantes",
    description: "Guantes de cuero con protecciones para conducción deportiva.",
    price: 75.00,
    category: "Accesorios",
    stock: 25,
    lowStockThreshold: 5,
  },
];

export const mockServices: Service[] = [
  {
    id: "serv-001",
    name: "Cambio de Aceite y Filtro",
    description: "Reemplazo de aceite de motor y filtro de aceite.",
    price: 40.00,
  },
  {
    id: "serv-002",
    name: "Diagnóstico Electrónico",
    description: "Revisión y diagnóstico de fallas electrónicas del motor.",
    price: 60.00,
  },
  {
    id: "serv-003",
    name: "Alineación y Balanceo",
    description: "Alineación de ruedas y balanceo de neumáticos.",
    price: 55.00,
  },
  {
    id: "serv-004",
    name: "Revisión General",
    description: "Inspección completa de la motocicleta (frenos, luces, fluidos, etc.).",
    price: 80.00,
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
      { id: "prod-001", type: "product", name: "Aceite Sintético 10W-40", price: 25.99, quantity: 1 },
      { id: "serv-001", type: "service", name: "Cambio de Aceite y Filtro", price: 40.00, quantity: 1 },
    ],
    subtotal: 65.99,
    taxRate: 0.16,
    taxAmount: 10.56,
    discountTotal: 0,
    total: 76.55,
    paymentMethod: "Tarjeta",
    cashierId: "user-employee-001",
  },
  {
    id: "sale-002",
    date: "2023-10-25T15:00:00Z",
    items: [
      { id: "prod-004", type: "product", name: "Casco Integral Sport", price: 180.00, quantity: 1 },
      { id: "prod-005", type: "product", name: "Guantes de Cuero Racing", price: 75.00, quantity: 1, discount: 10 }, // 10% discount
    ],
    subtotal: 255.00,
    taxRate: 0.16,
    taxAmount: 40.80,
    discountTotal: 7.50, // 10% of 75
    total: 288.30,
    paymentMethod: "Efectivo",
    cashierId: "user-admin-001",
  },
];