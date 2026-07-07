import { Plus } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Table from "../components/ui/Table.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export default function DashboardPage({ navigate, user }) {
  const { data: quizzes, loading, error } = useAsync(() => api.listMyQuizzes(), []);
  const rows = quizzes || [];
  const published = rows.filter((quiz) => quiz.is_published).length;

  const columns = [
    { key: "title", label: "Quiz" },
    { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: "status", label: "Status", render: (row) => <Badge variant={row.is_published ? "success" : "warning"}>{row.is_published ? "Published" : "Draft"}</Badge> },
    { key: "actions", label: "Actions", render: (row) => <Button variant="ghost" size="sm" onClick={() => navigate(`/builder?id=${row.id}`)}>Open</Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back{user?.first_name ? `, ${user.first_name}` : ""}</h1>
          <p className="mt-1 text-sm text-secondary">Manage quizzes and review your publishing progress.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/create")}>Create Quiz</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Total quizzes" value={rows.length} />
        <Metric label="Published" value={published} />
        <Metric label="Drafts" value={Math.max(rows.length - published, 0)} />
      </div>
      <Card>
        <CardHeader title="My quizzes" description="Quizzes created through your backend account." />
        <div className="p-4">
          {loading ? <LoadingSpinner label="Loading quizzes" /> : null}
          {error ? <EmptyState title="Login required" description={error} actionLabel="Login" onAction={() => navigate("/login")} /> : null}
          {!loading && !error ? <Table columns={columns} rows={rows} /> : null}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </Card>
  );
}
