export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-sm text-error">{error}</span> : null}
    </label>
  );
}
