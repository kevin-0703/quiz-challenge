import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Input from "../components/ui/Input.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export default function ExplorePage({ navigate }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAsync(() => api.listQuizzes(), []);
  const quizzes = data || [];
  const filtered = useMemo(() => quizzes.filter((quiz) => `${quiz.title} ${quiz.description}`.toLowerCase().includes(query.toLowerCase())), [quizzes, query]);
  const totalPages = Math.max(Math.ceil(filtered.length / 6), 1);
  const visible = filtered.slice((page - 1) * 6, page * 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Explore quizzes</h1>
          <p className="mt-1 text-sm text-secondary">Published quizzes from the backend.</p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 text-secondary" size={18} />
          <Input className="pl-10" placeholder="Search quizzes" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        </div>
      </div>
      {loading ? <LoadingSpinner label="Loading published quizzes" /> : null}
      {error ? <EmptyState title="Unable to load quizzes" description={error} /> : null}
      {!loading && !error && !visible.length ? <EmptyState title="No quizzes yet" description="Publish a quiz from the dashboard and it will appear here." actionLabel="Create Quiz" onAction={() => navigate("/create")} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <Badge variant="success">Published</Badge>
            </div>
            <p className="line-clamp-3 flex-1 text-sm leading-6 text-secondary">{quiz.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">{quiz.creator_name || quiz.creator_email || "Quiz creator"}</span>
              <Button variant="soft" size="sm" onClick={() => navigate(`/quiz-setup?id=${quiz.id}`)}>Start</Button>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length > 6 ? <Pagination page={page} totalPages={totalPages} onPageChange={setPage} /> : null}
    </div>
  );
}
