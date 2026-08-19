import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import AppRoutes from "@/routes/AppRoutes";
import Toaster from "@/components/common/Toaster";

// One shared QueryClient for the whole app. Sensible defaults for an
// internal business tool: don't refetch aggressively on window focus,
// but keep data reasonably fresh.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* NotificationProvider needs AuthContext (to know who's logged in
            and whether to open a socket) but not CartContext, so it sits
            between them. CartProvider is app-wide (not just under /worker)
            since it's cheap and keeps the worker's cart isolated from
            anything route-related. */}
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Toaster />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
