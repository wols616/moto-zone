import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingCart,
  History,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: ("admin" | "employee")[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "employee"] },
  { title: "Productos", href: "/products", icon: Package, roles: ["admin", "employee"] },
  { title: "Servicios", href: "/services", icon: Wrench, roles: ["admin"] },
  { title: "Nueva Venta", href: "/sales", icon: ShoppingCart, roles: ["admin", "employee"] },
  { title: "Historial de Ventas", href: "/sales-history", icon: History, roles: ["admin", "employee"] },
];

export const SidebarNav = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const filteredNavItems = navItems.filter(item =>
    item.roles ? item.roles.includes(user?.role as "admin" | "employee") : true
  );

  return (
    <nav className="flex flex-col h-full p-4 bg-motoGray-dark text-motoWhite-dark border-r border-motoGray">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-motoRed">Moto-Zone</h2>
        <p className="text-sm text-motoWhite-dark">Gestión Interna</p>
      </div>
      <ul className="space-y-2 flex-grow">
        {filteredNavItems.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-motoRed text-motoWhite"
                  : "text-motoWhite-dark hover:bg-motoGray hover:text-motoWhite",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4 border-t border-motoGray">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left text-motoWhite-dark hover:bg-motoRed hover:text-motoWhite"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};