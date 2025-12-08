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

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Input Sertifikat", href: "/certificates/input" },
  { icon: List, label: "Sertifikat Saya", href: "/certificates/list" },
  { icon: BarChart3, label: "Monitoring", href: "/monitoring" },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border flex-col hidden md:flex">
      <div className="h-12 px-4 flex items-center gap-2 border-b border-border">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <span className="font-bold text-sm text-foreground tracking-tight">Orion</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
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

      <div className="p-3 border-t border-border space-y-0.5">
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
