export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-secondary">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-outline border-t-primary" />
      <span>{label}</span>
    </div>
  );
}
