import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Test gradual de importaciones
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const GradualApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <div style={{ padding: "20px" }}>
                <h1>Gradual App Test - With DataProvider</h1>
                <p>DataProvider is working!</p>
                <Routes>
                  <Route path="/" element={<div>Home</div>} />
                  <Route path="/login" element={<div>Login</div>} />
                </Routes>
              </div>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default GradualApp;
