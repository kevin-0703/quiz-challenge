import { Menu } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function Navbar({ navigate, onMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-surface/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button className="text-xl font-bold text-primary" onClick={() => navigate("/")}>
          QuizHub
        </button>
        <div className="hidden items-center gap-6 md:flex">
          <button className="text-sm font-semibold text-muted hover:text-primary" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="text-sm font-semibold text-muted hover:text-primary" onClick={() => navigate("/explore")}>
            Explore
          </button>
          <button className="text-sm font-semibold text-muted hover:text-primary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant="soft" onClick={() => navigate("/register")}>
            Register
          </Button>
        </div>
        <Button className="md:hidden" variant="ghost" icon={Menu} onClick={onMenu} aria-label="Open menu" />
      </nav>
    </header>
  );
}
