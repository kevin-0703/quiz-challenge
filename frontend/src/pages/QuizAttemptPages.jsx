import { Clock, Send } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export function QuizSetupPage({ navigate }) {
  const quizId = new URLSearchParams(window.location.search).get("id");
  const [form, setForm] = useState({ participant_name: "", participant_email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: quiz, loading: quizLoading } = useAsync(() => api.getQuiz(quizId), [quizId]);

  const start = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const attempt = await api.startAttempt({ ...form, quiz: Number(quizId) });
      navigate(`/take-quiz?id=${quizId}&attempt=${attempt.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (quizLoading) return <LoadingSpinner label="Loading quiz setup" />;

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader title={quiz?.title || "Quiz setup"} description={quiz?.description || "Enter your details before starting."} />
        <form className="space-y-5 p-5" onSubmit={start}>
          <div className="flex items-center gap-3 rounded bg-surface-low px-4 py-3 text-sm text-secondary">
            <Clock size={18} className="text-primary" />
            You will have 10 minutes once the attempt starts.
          </div>
          <FormField label="Participant name">
            <Input value={form.participant_name} onChange={(event) => setForm({ ...form, participant_name: event.target.value })} required />
          </FormField>
          <FormField label="Participant email">
            <Input type="email" value={form.participant_email} onChange={(event) => setForm({ ...form, participant_email: event.target.value })} required />
          </FormField>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Starting..." : "Start Quiz"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export function TakingQuizPage({ navigate }) {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");
  const attemptId = params.get("attempt");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: quiz, loading } = useAsync(() => api.getQuiz(quizId), [quizId]);
  const questions = quiz?.questions || [];

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.submitAttempt(attemptId, answers);
      sessionStorage.setItem("latestResult", JSON.stringify(response.result));
      navigate("/results");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading quiz" />;

  if (!questions.length) {
    return (
      <EmptyState
        title="Questions are not available yet"
        description="The attempt endpoint is ready, but the current quiz detail serializer does not expose question and choice data for the frontend to render."
        actionLabel="Back to Explore"
        onAction={() => navigate("/explore")}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-surface-container">
          <div className="h-full bg-primary-soft" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
        </div>
        <CardHeader title={quiz.title} description={`${Object.keys(answers).length} of ${questions.length} answered`} action={<Badge variant="warning">10 min</Badge>} />
      </Card>
      {questions.map((question, index) => (
        <Card key={question.id} className="p-5">
          <Badge>Question {index + 1}</Badge>
          <h2 className="mt-3 font-semibold">{question.text}</h2>
          <div className="mt-4 grid gap-2">
            {question.choices.map((choice) => (
              <label key={choice.id} className="flex cursor-pointer items-center gap-3 rounded border border-outline px-4 py-3 hover:bg-surface-low">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === choice.id}
                  onChange={() => setAnswers({ ...answers, [question.id]: choice.id })}
                />
                <span className="text-sm">{choice.text}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <Button icon={Send} onClick={submit} disabled={submitting || !Object.keys(answers).length}>
        {submitting ? "Submitting..." : "Submit Quiz"}
      </Button>
    </div>
  );
}

export function ResultsPage({ navigate }) {
  const result = JSON.parse(sessionStorage.getItem("latestResult") || "null");

  if (!result) {
    return (
      <EmptyState
        title="No result to show"
        description="Take a quiz and the latest result will appear here."
        actionLabel="Explore Quizzes"
        onAction={() => navigate("/explore")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Quiz complete</p>
        <h1 className="mt-3 text-4xl font-bold">{result.score} points</h1>
        <p className="mt-2 text-sm text-secondary">Submitted by {result.participant_name}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <ResultMetric label="Questions" value={result.total_questions} />
        <ResultMetric label="Answered" value={result.answered_questions} />
        <ResultMetric label="Correct" value={result.correct_answers} />
      </div>
    </div>
  );
}

function ResultMetric({ label, value }) {
  return (
    <Card className="p-5 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-secondary">{label}</p>
    </Card>
  );
}
