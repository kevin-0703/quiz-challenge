import { Save } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import { api } from "../services/api.js";
import QuizBuilderPage from "./QuizBuilderPage.jsx";

export default function CreateQuizPage({ navigate }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const quiz = await api.createQuiz(form);

      navigate(`/builder?id=${quiz.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader
          title="Create quiz"
          description="Start with the basic quiz information saved by the backend."
        />
        <form className="space-y-5 p-5" onSubmit={submit}>
          <FormField label="Quiz title">
            <Input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              required
              placeholder="Modern Architecture"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              className="focus-ring min-h-32 w-full rounded border border-outline bg-white px-3 py-2 text-sm"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              required
              placeholder="Describe the quiz goal and audience."
            />
          </FormField>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex justify-end">
            <Button icon={Save} type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
