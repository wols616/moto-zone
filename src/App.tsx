import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles: ("admin" | "employee")[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if not authorized
  }

  return <Layout>{children}</Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={["admin", "employee"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute allowedRoles={["admin", "employee"]}>
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute allowedRoles={["admin", "employee"]}>
                    <SalesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales-history"
                element={
                  <ProtectedRoute allowedRoles={["admin", "employee"]}>
                    <SalesHistoryPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;