import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingCart,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: ("admin" | "employee")[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
  },
  {
    title: "Productos",
    href: "/products",
    icon: Package,
    roles: ["admin", "employee"],
  },
  { title: "Servicios", href: "/services", icon: Wrench, roles: ["admin"] },
  {
    title: "Nueva Venta",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "employee"],
  },
  {
    title: "Historial de Ventas",
    href: "/sales-history",
    icon: History,
    roles: ["admin", "employee"],
  },
];

export const SidebarNav = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles ? item.roles.includes(user?.role as "admin" | "employee") : true
  );

  return (
    <>
      {/* Mobile Menu Button (visible only on small screens) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-motoRed text-motoWhite"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop (hidden on mobile) */}
      <nav className="hidden lg:flex flex-col h-full p-4 bg-motoGray-dark text-motoWhite-dark border-r border-motoGray">
        <DesktopSidebarContent
          filteredNavItems={filteredNavItems}
          location={location}
          logout={logout}
        />
      </nav>

      {/* Mobile Sidebar (visible when menu is open) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="relative z-50 w-64 h-full bg-motoGray-dark text-motoWhite-dark border-r border-motoGray overflow-y-auto">
            <MobileSidebarContent
              filteredNavItems={filteredNavItems}
              location={location}
              logout={logout}
              closeMenu={() => setIsMobileMenuOpen(false)}
            />
          </nav>
        </div>
      )}
    </>
  );
};

// Componente reutilizable para el contenido del sidebar (Desktop)
const DesktopSidebarContent = ({ filteredNavItems, location, logout }) => (
  <>
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-motoRed">Moto-Zone</h2>
      <img
        src="/logo.png"
        alt="Moto-Zone Logo"
        className="mx-auto mb-2 h-12 w-12"
      />
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
                : "text-motoWhite-dark hover:bg-motoGray hover:text-motoWhite"
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
  </>
);

// Componente reutilizable para el contenido del sidebar (Mobile)
const MobileSidebarContent = ({
  filteredNavItems,
  location,
  logout,
  closeMenu,
}) => (
  <>
    <div className="mb-8 p-4 text-center">
      <h2 className="text-2xl font-bold text-motoRed">Moto-Zone</h2>
      <img
        src="/logo.png"
        alt="Moto-Zone Logo"
        className="mx-auto mb-2 h-12 w-12"
      />
      <p className="text-sm text-motoWhite-dark">Gestión Interna</p>
    </div>
    <ul className="space-y-2 p-4">
      {filteredNavItems.map((item) => (
        <li key={item.href}>
          <Link
            to={item.href}
            onClick={closeMenu}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === item.href
                ? "bg-motoRed text-motoWhite"
                : "text-motoWhite-dark hover:bg-motoGray hover:text-motoWhite"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
    <div className="mt-auto p-4 pt-4 border-t border-motoGray">
      <button
        onClick={() => {
          closeMenu();
          logout();
        }}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left text-motoWhite-dark hover:bg-motoRed hover:text-motoWhite"
      >
        <LogOut className="h-5 w-5" />
        Cerrar Sesión
      </button>
    </div>
  </>
);
