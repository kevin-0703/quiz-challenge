import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import { api } from "../services/api.js";

export function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(form);
      onLogin(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" description="Login to manage your quizzes.">
      <form className="space-y-4" onSubmit={submit}>
        <FormField label="Username">
          <Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </FormField>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <button className="w-full text-sm font-semibold text-primary" type="button" onClick={() => navigate("/register")}>
          Create an account
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <AuthShell title="Create account" description="Start building and sharing quizzes.">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <FormField label="First name">
          <Input value={form.first_name} onChange={(event) => update("first_name", event.target.value)} required />
        </FormField>
        <FormField label="Last name">
          <Input value={form.last_name} onChange={(event) => update("last_name", event.target.value)} required />
        </FormField>
        <FormField label="Username">
          <Input value={form.username} onChange={(event) => update("username", event.target.value)} required />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
        </FormField>
        {error ? <p className="text-sm text-error sm:col-span-2">{error}</p> : null}
        <Button className="sm:col-span-2" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </Button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, description, children }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-xl items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-2 text-sm text-secondary">{description}</p>
        {children}
      </Card>
    </main>
  );
}
