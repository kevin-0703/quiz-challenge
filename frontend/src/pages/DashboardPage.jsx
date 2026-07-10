import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Table from "../components/ui/Table.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export default function DashboardPage({ navigate, user }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const {
    data: quizzes,
    loading,
    error,
  } = useAsync(
    () => (user?.is_admin ? api.listQuizzes() : api.listMyQuizzes()),
    [user, refreshKey],
  );
  const rows = quizzes || [];
  const published = rows.filter((quiz) => quiz.is_published).length;

  const handleEditClick = async (quiz) => {
    setEditLoading(true);
    setEditError("");

    try {
      const fullQuiz = await api.getQuizForEdit(quiz.id);

      setEditingQuiz(fullQuiz);
      setEditForm(fullQuiz);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (event) => {
    if (event) event.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      await api.updateQuiz(editingQuiz.id, editForm);
      setEditingQuiz(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await api.deleteQuiz(id);
        setRefreshKey((k) => k + 1);
      } catch (err) {
        alert("Failed to delete quiz: " + err.message);
      }
    }
  };

  const columns = [
    { key: "title", label: "Quiz" },
    {
      key: "created_at",
      label: "Created",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={row.is_published ? "success" : "warning"}>
          {row.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error-soft"
            onClick={() => handleDeleteClick(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Manage quizzes and review your publishing progress.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/create")}>
          Create Quiz
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Total quizzes" value={rows.length} />
        <Metric label="Published" value={published} />
        <Metric label="Drafts" value={Math.max(rows.length - published, 0)} />
      </div>
      <Card>
        <CardHeader
          title={user?.is_admin ? "All system quizzes" : "My quizzes"}
          description={
            user?.is_admin
              ? "Administrative list of all platform quizzes."
              : "Quizzes created through your backend account."
          }
        />
        <div className="p-4">
          {loading ? <LoadingSpinner label="Loading quizzes" /> : null}
          {error ? (
            <EmptyState
              title="Login required"
              description={error}
              actionLabel="Login"
              onAction={() => navigate("/login")}
            />
          ) : null}
          {!loading && !error ? <Table columns={columns} rows={rows} /> : null}
        </div>
      </Card>

      <Modal
        open={!!editingQuiz}
        title="Edit Quiz"
        onClose={() => setEditingQuiz(null)}
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditingQuiz(null)}>
              Cancel
            </Button>

            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        {editForm && (
          <form
            className="space-y-6 max-h-[75vh] overflow-y-auto pr-2"
            onSubmit={handleEditSubmit}
          >
            {/* Quiz Details */}

            <FormField label="Quiz Title">
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </FormField>

            <FormField label="Description">
              <textarea
                className="focus-ring min-h-32 w-full rounded border border-outline bg-white px-3 py-2 text-sm"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
                required
              />
            </FormField>

            {/* Questions */}

            {editForm.questions?.map((question, qIndex) => (
              <Card key={question.id} className="p-5">
                <h3 className="mb-4 font-semibold">Question {qIndex + 1}</h3>

                <FormField label="Question">
                  <Input
                    value={question.text}
                    onChange={(e) => {
                      const questions = [...editForm.questions];
                      questions[qIndex].text = e.target.value;

                      setEditForm({
                        ...editForm,
                        questions,
                      });
                    }}
                  />
                </FormField>

                <FormField label="Marks">
                  <Input
                    type="number"
                    min="1"
                    value={question.marks}
                    onChange={(e) => {
                      const questions = [...editForm.questions];
                      questions[qIndex].marks = Number(e.target.value);

                      setEditForm({
                        ...editForm,
                        questions,
                      });
                    }}
                  />
                </FormField>

                <div className="mt-4 space-y-3">
                  {question.choices.map((choice, cIndex) => (
                    <div key={choice.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={choice.is_correct}
                        onChange={() => {
                          const questions = [...editForm.questions];

                          questions[qIndex].choices = questions[
                            qIndex
                          ].choices.map((item, index) => ({
                            ...item,
                            is_correct: index === cIndex,
                          }));

                          setEditForm({
                            ...editForm,
                            questions,
                          });
                        }}
                      />

                      <Input
                        className="flex-1"
                        value={choice.text}
                        onChange={(e) => {
                          const questions = [...editForm.questions];

                          questions[qIndex].choices[cIndex].text =
                            e.target.value;

                          setEditForm({
                            ...editForm,
                            questions,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {editError && <p className="text-sm text-error">{editError}</p>}
          </form>
        )}
      </Modal>
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
