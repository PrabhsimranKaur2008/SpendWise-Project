import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, History, LayoutDashboard, PiggyBank, PlusCircle, Settings, Target, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add", label: "Add Expense", icon: PlusCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/goals", label: "Savings Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useStore();
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground p-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-10 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <PiggyBank className="size-5" />
          </span>
          <span className="font-display text-lg font-bold text-sidebar-accent-foreground">SpendWise</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-sidebar-accent p-4 text-sm">
          <p className="text-sidebar-foreground/70">Signed in as</p>
          <p className="font-semibold text-sidebar-accent-foreground">{state.name}</p>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-accent-foreground">
        <Link to="/" className="flex items-center gap-2 font-display font-bold">
          <PiggyBank className="size-5 text-sidebar-primary" /> SpendWise
        </Link>
        <Link to="/settings" aria-label="Settings"><Settings className="size-5" /></Link>
      </header>

      <main className="flex-1 min-w-0 px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10 lg:pb-10">{children}</main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-6 border-t bg-card px-1 py-2">
        {NAV.filter((n) => n.to !== "/settings").map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${path === to ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon className={`size-5 ${path === to ? "text-success" : ""}`} />
            {label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
