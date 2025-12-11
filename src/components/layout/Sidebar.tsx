import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  List, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

import { Logo } from "@/components/Logo";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Input Sertifikat", href: "/certificates/input" },
  { icon: List, label: "Sertifikat Saya", href: "/certificates/list" },
  { icon: BarChart3, label: "Monitoring", href: "/monitoring" },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-64 bg-card flex-col hidden md:flex">
      <div className="h-14 px-5 flex items-center border-b border-primary/20 bg-primary">
        <Logo size="md" textClassName="text-primary-foreground" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto border-r border-border">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border border-r space-y-0.5">
        <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi</span>
        </NavLink>
        <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
        </NavLink>
        <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start gap-3 px-3 py-1.5 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
        >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
        </Button>
      </div>
    </div>
  );
}
