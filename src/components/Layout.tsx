import React, { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-motoWhite">
      <aside className="w-64 flex-shrink-0">
        <SidebarNav />
      </aside>
      <main className="flex-grow p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};