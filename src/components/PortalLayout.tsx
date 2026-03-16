import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, Bell, GraduationCap, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface PortalLayoutProps {
  role: string;
  userName: string;
  userAvatar: string;
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  children: React.ReactNode;
  notificationSlot?: React.ReactNode;
}

// Custom hook for media query
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const PortalLayout = ({
  role,
  userName,
  userAvatar,
  navItems,
  activeNav,
  onNavChange,
  children,
  notificationSlot,
}: PortalLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on mobile when navigating
  const handleNavChange = (id: string) => {
    onNavChange(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile 
            ? "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out"
            : `shrink-0 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`
          }
          bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col shadow-lg
          ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border overflow-hidden">
          <GraduationCap className="h-8 w-8 text-primary shrink-0" />
          {(!isMobile && sidebarOpen) && (
            <span className="font-bold text-xl text-sidebar-foreground truncate tracking-tight">
              EduVerse
            </span>
          )}
          {/* On mobile, always show logo text when sidebar open */}
          {isMobile && sidebarOpen && (
            <span className="font-bold text-xl text-sidebar-foreground truncate tracking-tight">
              EduVerse
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                activeNav === item.id
                  ? "bg-sidebar-accent text-primary font-semibold border-r-4 border-primary"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {/* Show label when sidebar open on desktop, or always on mobile when open */}
              {(!isMobile && sidebarOpen) && <span className="truncate">{item.label}</span>}
              {isMobile && sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-sm">
              {userAvatar}
            </div>
            {(!isMobile && sidebarOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{role}</p>
              </div>
            )}
            {isMobile && sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!isMobile && sidebarOpen) && <span>Sign Out</span>}
            {isMobile && sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-card shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-all hover:text-foreground hover:border-primary/30 hover:shadow-sm"
              aria-label="Toggle theme"
              type="button"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Notification Bell (or custom slot) */}
            {notificationSlot || (
              <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  3
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;