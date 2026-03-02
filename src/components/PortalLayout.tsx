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

const PortalLayout = ({ role, userName, userAvatar, navItems, activeNav, onNavChange, children, notificationSlot }: PortalLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border overflow-hidden">
          <GraduationCap className="h-7 w-7 text-primary shrink-0" />
          {sidebarOpen && (
            <span className="font-bold text-lg text-sidebar-foreground truncate">EduVerse</span>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                activeNav === item.id
                  ? "bg-sidebar-accent text-primary font-semibold border-r-2 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {userAvatar}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-background">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
              type="button"
            >
              {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {notificationSlot || (
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
};

export default PortalLayout;
