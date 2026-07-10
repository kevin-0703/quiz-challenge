import { Clock, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

const EXPIRY_BUFFER_MS = 10 * 1000;

function formatCountdown(ms) {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function QuizSetupPage({ navigate }) {
  const quizId = new URLSearchParams(window.location.search).get("id");
  const [form, setForm] = useState({
    participant_name: "",
    participant_email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: quiz, loading: quizLoading } = useAsync(
    () => api.getQuizForTaking(quizId),
    [quizId],
  );

  const start = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const attempt = await api.startAttempt({ ...form, quiz: Number(quizId) });
      sessionStorage.setItem(
        `attemptExpiresAt:${attempt.id}`,
        attempt.expires_at,
      );
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
        <CardHeader
          title={quiz?.title || "Quiz setup"}
          description={
            quiz?.description || "Enter your details before starting."
          }
        />
        <form className="space-y-5 p-5" onSubmit={start}>
          <div className="flex items-center gap-3 rounded bg-surface-low px-4 py-3 text-sm text-secondary">
            <Clock size={18} className="text-primary" />
            You will have 10 minutes once the attempt starts.
          </div>
          <FormField label="Participant name">
            <Input
              value={form.participant_name}
              onChange={(event) =>
                setForm({ ...form, participant_name: event.target.value })
              }
              required
            />
          </FormField>
          <FormField label="Participant email">
            <Input
              type="email"
              value={form.participant_email}
              onChange={(event) =>
                setForm({ ...form, participant_email: event.target.value })
              }
              required
            />
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
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const autoSubmittedRef = useRef(false);
  const { data: quiz, loading } = useAsync(
    () => api.getQuizForTaking(quizId),
    [quizId],
  );
  const questions = quiz?.questions || [];

  const submit = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;
      setSubmitting(true);
      setError("");
      try {
        const response = await api.submitAttempt(attemptId, answers);
        sessionStorage.setItem("latestResult", JSON.stringify(response.result));
        sessionStorage.removeItem(`attemptExpiresAt:${attemptId}`);
        navigate("/results");
      } catch (err) {
        setError(
          isAutoSubmit
            ? "Time's up and we couldn't submit automatically. Please try submitting manually."
            : err.message,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [attemptId, answers, submitting, navigate],
  );

  useEffect(() => {
    const expiresAtRaw = sessionStorage.getItem(
      `attemptExpiresAt:${attemptId}`,
    );
    if (!expiresAtRaw) return undefined;

    const deadline = new Date(expiresAtRaw).getTime() - EXPIRY_BUFFER_MS;

    const tick = () => {
      const remaining = deadline - Date.now();
      setTimeLeftMs(Math.max(remaining, 0));

      if (remaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submit(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attemptId, submit]);

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

  const isRunningLow = timeLeftMs !== null && timeLeftMs < 60 * 1000;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-surface-container">
          <div
            className="h-full bg-primary-soft"
            style={{
              width: `${(Object.keys(answers).length / questions.length) * 100}%`,
            }}
          />
        </div>
        <CardHeader
          title={quiz.title}
          description={`${Object.keys(answers).length} of ${questions.length} answered`}
          action={
            <Badge variant={isRunningLow ? "error" : "warning"}>
              {timeLeftMs !== null ? formatCountdown(timeLeftMs) : "10:00"}
            </Badge>
          }
        />
      </Card>
      {questions.map((question, index) => (
        <Card key={question.id} className="p-5">
          <Badge>Question {index + 1}</Badge>
          <h2 className="mt-3 font-semibold">{question.text}</h2>
          <div className="mt-4 grid gap-2">
            {question.choices.map((choice) => (
              <label
                key={choice.id}
                className="flex cursor-pointer items-center gap-3 rounded border border-outline px-4 py-3 hover:bg-surface-low"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === choice.id}
                  onChange={() =>
                    setAnswers({ ...answers, [question.id]: choice.id })
                  }
                />
                <span className="text-sm">{choice.text}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <Button
        icon={Send}
        onClick={() => submit(false)}
        disabled={submitting || !Object.keys(answers).length}
      >
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
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Quiz complete
        </p>
        <h1 className="mt-3 text-4xl font-bold">{result.score} points</h1>
        <p className="mt-2 text-sm text-secondary">
          Submitted by {result.participant_name}
        </p>
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
