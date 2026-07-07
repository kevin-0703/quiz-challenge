export default function Card({ children, className = "" }) {
  return (
    <section className={`rounded border border-outline bg-white ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
