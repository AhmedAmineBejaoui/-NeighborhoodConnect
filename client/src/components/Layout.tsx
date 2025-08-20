import { ReactNode } from "react";
import NavigationSidebar from "./NavigationSidebar";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import NotificationsBell from "./NotificationsBell";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationSidebar />
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Button variant="ghost" size="sm" data-testid="button-menu">
            <i className="fas fa-bars text-gray-600 dark:text-gray-400"></i>
          </Button>
          <h1 className="text-lg font-semibold">Hub Communautaire</h1>
          <div className="flex items-center space-x-2">
            <NotificationsBell />
            <Button variant="ghost" size="sm" onClick={toggleTheme} data-testid="button-theme-toggle">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-gray-600 dark:text-gray-400`}></i>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center p-2 text-primary" data-testid="button-nav-home">
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Accueil</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400" data-testid="button-nav-market">
            <i className="fas fa-store text-lg"></i>
            <span className="text-xs mt-1">Market</span>
          </Button>
          <Button className="flex flex-col items-center p-2 bg-primary text-white rounded-full -mt-2" data-testid="button-nav-create">
            <i className="fas fa-plus text-lg"></i>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400" data-testid="button-nav-polls">
            <i className="fas fa-poll text-lg"></i>
            <span className="text-xs mt-1">Sondages</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400" data-testid="button-nav-profile">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profil</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
