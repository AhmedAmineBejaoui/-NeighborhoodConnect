import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/store";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NavigationSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    {
      icon: "fas fa-stream",
      label: "Fil d'actualité",
      href: "/",
      active: location === "/",
    },
    {
      icon: "fas fa-bullhorn",
      label: "Annonces",
      href: "/announcements",
      active: location.startsWith("/announcements"),
    },
    {
      icon: "fas fa-store",
      label: "Marketplace",
      href: "/marketplace",
      active: location.startsWith("/marketplace"),
      badge: "12",
    },
    {
      icon: "fas fa-poll",
      label: "Sondages",
      href: "/polls",
      active: location.startsWith("/polls"),
    },
    {
      icon: "fas fa-handshake",
      label: "Services",
      href: "/services",
      active: location.startsWith("/services"),
    },
  ];

  const moderationItems = [
    {
      icon: "fas fa-flag",
      label: "Signalements",
      href: "/moderation/reports",
      active: location.startsWith("/moderation/reports"),
      badge: "3",
      badgeVariant: "destructive" as const,
    },
    {
      icon: "fas fa-eye-slash",
      label: "Contenu masqué",
      href: "/moderation/hidden",
      active: location.startsWith("/moderation/hidden"),
    },
  ];

  const showModeration = user.roles.includes('moderator') || user.roles.includes('admin');

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-home text-white text-sm"></i>
          </div>
          <span className="text-lg font-semibold" data-testid="text-app-title">Hub Communautaire</span>
        </div>
        <Button variant="ghost" size="sm" className="lg:hidden" data-testid="button-close-sidebar">
          <i className="fas fa-times text-gray-600 dark:text-gray-400"></i>
        </Button>
      </div>

      <nav className="mt-6">
        {/* User Profile */}
        <div className="px-6 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm" data-testid="text-user-initials">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-medium" data-testid="text-community-name">Quartier Saint-Antoine</p>
              <p className="text-xs text-gray-600 dark:text-gray-400" data-testid="text-user-role">
                {user.roles[0] === 'admin' ? 'Administrateur' : 
                 user.roles[0] === 'moderator' ? 'Modérateur' : 'Résident'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${item.active ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300'}`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} w-5 mr-3`}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </li>
          ))}
        </ul>

        {/* Moderation Section */}
        {showModeration && (
          <div className="mt-8 px-3">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Modération
            </p>
            <ul className="space-y-1">
              {moderationItems.map((item) => (
                <li key={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`w-full justify-start ${item.active ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300'}`}
                    data-testid={`mod-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <i className={`${item.icon} w-5 mr-3`}></i>
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || "secondary"} className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* User Account Section */}
      <div className="absolute bottom-4 left-3 right-3">
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs" data-testid="text-user-initials-bottom">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-medium" data-testid="text-user-name">{user.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">En ligne</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={toggleTheme} data-testid="button-theme-toggle-sidebar">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-gray-600 dark:text-gray-400 text-sm`}></i>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <i className="fas fa-sign-out-alt text-gray-600 dark:text-gray-400 text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
