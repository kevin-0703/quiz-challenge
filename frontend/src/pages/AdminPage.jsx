import Badge from "../components/ui/Badge.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Table from "../components/ui/Table.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export default function AdminPage() {
  const { data, loading, error } = useAsync(() => api.listQuizzes(), []);
  const quizzes = data || [];
  const columns = [
    { key: "title", label: "Quiz" },
    { key: "creator", label: "Creator", render: (row) => row.creator_email || row.creator_name || "Unknown" },
    { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: "status", label: "Status", render: () => <Badge variant="success">Published</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-secondary">Lightweight overview using the currently available backend data.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Published quizzes" value={quizzes.length} />
        <Metric label="Creators" value={new Set(quizzes.map((quiz) => quiz.creator_email).filter(Boolean)).size} />
        <Metric label="Platform status" value="Live" />
      </div>
      <Card>
        <CardHeader title="Published quiz inventory" description="A simple administrative table." />
        <div className="p-4">
          {loading ? <LoadingSpinner label="Loading admin data" /> : null}
          {error ? <EmptyState title="Unable to load admin data" description={error} /> : null}
          {!loading && !error ? <Table columns={columns} rows={quizzes} /> : null}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
    </Card>
  );
}
