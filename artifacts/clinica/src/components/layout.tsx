import { Link, useLocation } from "wouter";
import { Users, Calendar, Stethoscope, Search, LayoutDashboard, LogOut, ShieldCheck, ConciergeBell } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { href: "/", label: "Início", icon: LayoutDashboard },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/servicos", label: "Serviços", icon: Stethoscope },
    { href: "/agendamento", label: "Agendamento", icon: Calendar },
    { href: "/consulta", label: "Consulta", icon: Search },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-6 w-6" />
            <span className="font-semibold text-lg">Clínica</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
              {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <ConciergeBell className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Acesso total" : "Acesso limitado"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-5 w-5" />
            <span className="font-semibold">Clínica</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout-mobile">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
