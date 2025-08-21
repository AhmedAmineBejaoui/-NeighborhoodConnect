import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { SocketProvider } from "@/lib/socket";
import { useAuthStore, AuthProvider } from "@/lib/store";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

function App() {
  const { user, isLoading } = useAuthStore();

  return (
    <SocketProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              {isLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="min-h-screen bg-background transition-colors duration-300">
                  {user ? <Home /> : <Landing />}
                  <Toaster />
                </div>
              )}
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SocketProvider>
  );
}

export default App;
