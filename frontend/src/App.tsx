import AppRouter from "./router/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/main.css";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-gray-100">
        <AppRouter />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
