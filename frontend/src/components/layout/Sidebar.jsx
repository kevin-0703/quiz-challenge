import { BarChart3, Compass, FilePlus, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import Button from "../ui/Button.jsx";

const items = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Create Quiz", path: "/create", icon: FilePlus },
  { label: "Results", path: "/results", icon: BarChart3 },
  { label: "Users", path: "/admin", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ path, navigate, user, onLogout }) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-outline bg-surface-low p-4 md:block">
      <button className="mb-8 px-3 text-xl font-bold text-primary" onClick={() => navigate("/")}>
        QuizHub
      </button>
      <nav className="space-y-1">
        {items.filter(item => item.path !== "/admin" || user?.is_admin).map((item) => {
          const Icon = item.icon;
          const active = path === item.path;
          return (
            <button
              key={item.path}
              className={`flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-primary-soft text-primary-ink" : "text-muted hover:bg-surface-container"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-8 rounded bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Management Console</p>
        <p className="mt-2 text-sm text-secondary">Create, publish, and monitor quizzes from one focused workspace.</p>
      </div>
      <Button className="mt-4 w-full" variant="ghost" icon={LogOut} onClick={onLogout}>
        Logout
      </Button>
    </aside>
  );
}
