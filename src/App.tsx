
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { DashboardLayout } from "./components/dashboard/Layout";
import { UserDashboard } from "./components/dashboard/Pages/User";
import { MasterData } from "./components/dashboard/Pages/MasterData";
import { Content } from "./components/dashboard/Pages/Content";
import NotFound from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="light" closeButton className="z-[100]" />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth routes */}
            <Route path="/" element={<AuthPage />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="master-data" element={<MasterData />} />
              <Route path="content" element={<Content />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
