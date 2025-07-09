import React, { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-motoWhite">
      {/* Sidebar - ahora con altura completa en desktop */}
      <div className="lg:h-full lg:fixed lg:left-0 lg:top-0 lg:bottom-0">
        <SidebarNav />
      </div>

      {/* Contenido principal con margen para el sidebar en desktop */}
      <main className="flex-grow p-4 lg:p-8 lg:ml-64 overflow-auto mt-16 lg:mt-0">
        {children}
      </main>
    </div>
  );
};
