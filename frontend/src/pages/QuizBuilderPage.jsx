import { Check, Plus, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FormField from "../components/ui/FormField.jsx";
import Input from "../components/ui/Input.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import { useAsync } from "../hooks.js";
import { api } from "../services/api.js";

export default function QuizBuilderPage({ navigate }) {
  const quizId = new URLSearchParams(window.location.search).get("id");
  const [modalOpen, setModalOpen] = useState(false);
  const [localQuestions, setLocalQuestions] = useState([]);
  const [question, setQuestion] = useState({
    text: "",
    marks: 10,
    choices: ["", "", "", ""],
    correctIndex: 0,
  });
  const {
    data: quiz,
    loading,
    error,
  } = useAsync(
    () => (quizId ? api.getQuiz(quizId) : Promise.resolve(null)),
    [quizId],
  );
  const questions = useMemo(
    () => quiz?.questions || localQuestions,
    [quiz, localQuestions],
  );
  const progress = Math.min((questions.length / 7) * 100, 100);

  const addQuestion = () => {
    setLocalQuestions([
      ...localQuestions,
      {
        id: Date.now(),
        order: localQuestions.length + 1,
        text: question.text,
        marks: Number(question.marks),
        choices: question.choices.map((text, index) => ({
          id: `${Date.now()}-${index}`,
          text,
          is_correct: index === Number(question.correctIndex),
        })),
      },
    ]);
    setQuestion({
      text: "",
      marks: 10,
      choices: ["", "", "", ""],
      correctIndex: 0,
    });
    setModalOpen(false);
  };

  const publish = async () => {
    if (!quizId) return;
    if (localQuestions.length !== 7) {
      alert("only 7 questions per quiz are allowed");
      return;
    }

    try {
      const quizData = {
        questions: localQuestions.map((question) => ({
          text: question.text,
          marks: question.marks,
          order: question.order,
          choices: question.choices.map((choice) => ({
            text: choice.text,
            is_correct: choice.is_correct,
          })),
        })),
      };
      console.log("localQuestions:", localQuestions);
      console.log("quizData:", quizData);
      console.log("Question count:", quizData.questions.length);
      await api.publishQuiz(quizId, quizData);
      navigate("/dashboard");
    } catch (error) {
      console.error("failed to publish quiz:", error);
    }
  };

  if (loading) return <LoadingSpinner label="Loading quiz builder" />;
  if (error)
    return (
      <EmptyState
        title="Unable to open quiz"
        description={error}
        actionLabel="Back to dashboard"
        onAction={() => navigate("/dashboard")}
      />
    );

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-surface-container">
          <div
            className="h-full bg-primary-soft"
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardHeader
          title={`Quiz Builder${quiz?.title ? `: ${quiz.title}` : ""}`}
          description={`${questions.length} of 7 questions ready`}
          action={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => setModalOpen(true)}
              >
                Add Question
              </Button>
              <Button
                icon={Upload}
                disabled={questions.length !== 7}
                onClick={publish}
              >
                Publish
              </Button>
            </div>
          }
        />
      </Card>
      {questions.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {questions.map((item, index) => (
            <Card key={item.id || index} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge>Question {item.order || index + 1}</Badge>
                <span className="text-sm font-semibold text-primary">
                  {item.marks} marks
                </span>
              </div>
              <h2 className="font-semibold">{item.text}</h2>
              <div className="mt-4 space-y-2">
                {(item.choices || []).map((choice) => (
                  <div
                    key={choice.id || choice.text}
                    className="flex items-center gap-2 rounded bg-surface-low px-3 py-2 text-sm"
                  >
                    {choice.is_correct ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-outline" />
                    )}
                    {choice.text}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No question data returned yet"
          description="Add questions"
          actionLabel="Add Question"
          onAction={() => setModalOpen(true)}
        />
      )}
      <QuestionModal
        open={modalOpen}
        question={question}
        setQuestion={setQuestion}
        onClose={() => setModalOpen(false)}
        onSave={addQuestion}
      />
    </div>
  );
}

function QuestionModal({ open, question, setQuestion, onClose, onSave }) {
  const updateChoice = (index, value) => {
    const choices = [...question.choices];
    choices[index] = value;
    setQuestion({ ...question, choices });
  };

  return (
    <Modal
      open={open}
      title="Add question"
      onClose={onClose}
      footer={
        <Button
          className="w-full"
          onClick={onSave}
          disabled={
            !question.text || question.choices.some((choice) => !choice)
          }
        >
          Save Question
        </Button>
      }
    >
      <div className="space-y-4">
        <FormField label="Question text">
          <Input
            value={question.text}
            onChange={(event) =>
              setQuestion({ ...question, text: event.target.value })
            }
          />
        </FormField>
        <FormField label="Marks">
          <Input
            type="number"
            min="1"
            value={question.marks}
            onChange={(event) =>
              setQuestion({ ...question, marks: event.target.value })
            }
          />
        </FormField>
        {question.choices.map((choice, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto] gap-2">
            <FormField label={`Choice ${index + 1}`}>
              <Input
                value={choice}
                onChange={(event) => updateChoice(index, event.target.value)}
              />
            </FormField>
            <label className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <input
                type="radio"
                name="correct"
                checked={Number(question.correctIndex) === index}
                onChange={() =>
                  setQuestion({ ...question, correctIndex: index })
                }
              />
              Correct
            </label>
          </div>
        ))}
      </div>
    </Modal>
  );
}
