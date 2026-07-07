import { ArrowRight, CheckCircle2, FilePlus, PlayCircle } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

const stats = [
  ["7", "Question format"],
  ["10 min", "Attempt timer"],
  ["100%", "Result clarity"],
];

export default function LandingPage({ navigate }) {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Professional quiz platform</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Create, publish, and take focused quizzes with QuizHub.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-secondary">
            A clean frontend for educators, trainers, and learners. No decorative clutter, just the workflows that matter.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="soft" icon={PlayCircle} onClick={() => navigate("/explore")}>
              Take a Quiz
            </Button>
            <Button size="lg" variant="secondary" icon={FilePlus} onClick={() => navigate("/create")}>
              Create a Quiz
            </Button>
          </div>
        </div>
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between border-b border-outline pb-4">
            <div>
              <h2 className="text-xl font-semibold">Quiz workflow</h2>
              <p className="text-sm text-secondary">Simple, readable, backend-ready.</p>
            </div>
            <CheckCircle2 className="text-primary" />
          </div>
          <div className="space-y-3">
            {["Create quiz details", "Add seven questions", "Publish when ready", "Collect attempts and results"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded bg-surface-low px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-ink">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" icon={ArrowRight} onClick={() => navigate("/dashboard")}>
            Open Dashboard
          </Button>
        </Card>
      </section>
      <section className="border-y border-outline bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
