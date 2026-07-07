import { Inbox } from "lucide-react";
import Button from "./Button.jsx";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-dashed border-outline bg-white px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-surface-container p-3 text-primary">
        <Inbox size={24} />
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm text-secondary">{description}</p> : null}
      {actionLabel ? (
        <Button className="mt-5" variant="soft" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
