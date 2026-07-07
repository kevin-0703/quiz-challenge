import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Button from "./components/ui/Button.jsx";
import Modal from "./components/ui/Modal.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { LoginPage, RegisterPage } from "./pages/AuthPages.jsx";
import CreateQuizPage from "./pages/CreateQuizPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import QuizBuilderPage from "./pages/QuizBuilderPage.jsx";
import { QuizSetupPage, ResultsPage, TakingQuizPage } from "./pages/QuizAttemptPages.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { useRoute } from "./hooks.js";
import { api } from "./services/api.js";

const publicRoutes = ["/", "/login", "/register", "/explore", "/quiz-setup", "/take-quiz", "/results"];

export default function App() {
  const { path, navigate } = useRoute();
  const route = path.split("?")[0];
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null));
  }, []);

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // The UI should still clear local auth state if the cookie is already gone.
    }
    setUser(null);
    navigate("/");
  };

  const content = renderRoute(route, { navigate, user, onLogin: setUser });
  const isPublic = publicRoutes.includes(route);

  return (
    <>
      {isPublic ? (
        <div className="min-h-screen">
          <Navbar navigate={navigate} onMenu={() => setMenuOpen(true)} />
          {content}
        </div>
      ) : (
        <div className="flex min-h-screen bg-surface">
          <Sidebar path={route} navigate={navigate} onLogout={logout} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{content}</div>
          </main>
        </div>
      )}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navigate={navigate} />
    </>
  );
}

function renderRoute(route, props) {
  switch (route) {
    case "/":
      return <LandingPage navigate={props.navigate} />;
    case "/login":
      return <LoginPage navigate={props.navigate} onLogin={props.onLogin} />;
    case "/register":
      return <RegisterPage navigate={props.navigate} />;
    case "/dashboard":
      return <DashboardPage navigate={props.navigate} user={props.user} />;
    case "/explore":
      return <ExplorePage navigate={props.navigate} />;
    case "/create":
      return <CreateQuizPage navigate={props.navigate} />;
    case "/builder":
      return <QuizBuilderPage navigate={props.navigate} />;
    case "/quiz-setup":
      return <QuizSetupPage navigate={props.navigate} />;
    case "/take-quiz":
      return <TakingQuizPage navigate={props.navigate} />;
    case "/results":
      return <ResultsPage navigate={props.navigate} />;
    case "/admin":
      return <AdminPage />;
    case "/settings":
      return <SettingsPage />;
    default:
      return <LandingPage navigate={props.navigate} />;
  }
}

function MobileMenu({ open, onClose, navigate }) {
  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Modal open={open} title="Menu" onClose={onClose}>
      <div className="grid gap-2">
        {[
          ["Home", "/"],
          ["Explore", "/explore"],
          ["Dashboard", "/dashboard"],
          ["Create Quiz", "/create"],
          ["Login", "/login"],
          ["Register", "/register"],
        ].map(([label, path]) => (
          <Button key={path} variant="ghost" className="justify-start" onClick={() => go(path)}>
            {label}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
