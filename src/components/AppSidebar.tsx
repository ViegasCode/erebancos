import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Calendar, BarChart3, ChevronLeft, ChevronRight, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, company, signOut, isAdmin } = useAuth();

  const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Clientes", path: "/clientes", icon: Users },
    { title: "Ordens de Serviço", path: "/ordens", icon: FileText },
    { title: "Agenda", path: "/agenda", icon: Calendar },
    { title: "Relatórios", path: "/relatorios", icon: BarChart3 },
    ...(isAdmin ? [{ title: "Configurações", path: "/configuracoes", icon: Settings }] : []),
  ];

  return (
    <aside className={`flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ${collapsed ? "w-16" : "w-64"} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground text-sm">
          OS
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground truncate">{company?.nome || "OS Manager"}</h1>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">Gestão de OS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info + actions */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && profile && (
          <div className="px-2 mb-2">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{profile.nome}</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">{profile.role} • {profile.email}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={signOut} className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
